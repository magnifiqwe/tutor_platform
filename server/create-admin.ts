import { all, put, hash } from './store.js';
import { randomUUID } from 'node:crypto';
const login=process.env.ADMIN_LOGIN, password=process.env.ADMIN_PASSWORD;
if(!login||!password||password.length<12)throw Error('Задайте ADMIN_LOGIN и ADMIN_PASSWORD (от 12 символов)');
if(all('user').some(u=>u.login===login))throw Error('Логин уже существует');
put('user',{id:randomUUID(),name:'Валерий',login,password:hash(password),role:'teacher',blocked:false});
console.log('Аккаунт преподавателя создан.');
