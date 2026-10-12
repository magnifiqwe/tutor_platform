import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
const root=process.env.DATA_DIR||'./data';mkdirSync(root+'/backups',{recursive:true});
const target=root+'/backups/platform-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite';
const db=new DatabaseSync(root+'/platform.sqlite');db.exec(`VACUUM INTO '${target.replaceAll("'","''")}'`);db.close();console.log(target);
