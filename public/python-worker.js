importScripts('/runtime/pyodide.js');
self.onmessage=async({data:m})=>{
 const send=e=>postMessage(e);let py;
 try{
 send({type:'status',text:'Загрузка Python…'});
 py=await loadPyodide({indexURL:'/runtime/'});
 const input=new Int32Array(m.input),decoder=new TextDecoder();
 py.setInterruptBuffer(new Uint8Array(m.interrupt));
 py.setStdout({write:bytes=>{send({type:'stdout',text:decoder.decode(bytes)});return bytes.length;}});
 py.setStderr({write:bytes=>{send({type:'stderr',text:decoder.decode(bytes)});return bytes.length;}});
 py.setStdin({stdin:()=>{Atomics.store(input,0,0);send({type:'waiting'});Atomics.wait(input,0,0);const value=decoder.decode(new Uint8Array(input.buffer,8,Atomics.load(input,1)));send({type:'input',text:value+'\n'});return value;}});
 py.FS.mkdir('/project');py.FS.chdir('/project');
 for(const [name,text] of Object.entries(m.code))py.FS.writeFile(name,text);
 for(const [name,v] of Object.entries(m.assets)){if(!/^[\w\-. А-Яа-яЁё]{1,100}$/.test(name))continue;py.FS.writeFile(name,v.binary?Uint8Array.from(atob(v.content),c=>c.charCodeAt(0)):v.content);}
 const turtle=await(await fetch('/turtle.py')).text();py.FS.writeFile('/project/turtle.py',turtle);
 self.turtleCommand=json=>send({type:'turtle',command:JSON.parse(json)});
 send({type:'status',text:'Выполнение '+m.entry});
 py.globals.set('__entry',m.entry);
 try{await py.runPythonAsync("import runpy, sys\nsys.path.insert(0, '/project')\nrunpy.run_path(__entry, run_name='__main__')");}catch(e){send({type:'stderr',text:String(e)});}
 const assets={},code={};let total=0;
 for(const name of py.FS.readdir('/project')){if(!/^[\w\-. А-Яа-яЁё]{1,100}$/.test(name)||name==='turtle.py'||name==='.'||name==='..')continue;const stat=py.FS.stat(name);if(!py.FS.isFile(stat.mode))continue;total+=stat.size;if(total>8e6){send({type:'stderr',text:'Результаты превысили 8 МБ: часть файлов не сохранена.'});break;}const bytes=py.FS.readFile(name);if(name.endsWith('.py')){const value=decoder.decode(bytes);if(value!==m.code[name])code[name]=value;}else{let str='';for(let i=0;i<bytes.length;i+=32768)str+=String.fromCharCode(...bytes.subarray(i,i+32768));assets[name]={content:btoa(str),binary:true};}}
 send({type:'files',assets,code,baseCode:m.code,baseAssetNames:Object.keys(m.assets)});
 }catch(e){send({type:'stderr',text:String(e)});}finally{send({type:'done'});}
};
