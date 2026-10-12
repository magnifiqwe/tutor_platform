import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export const dataDir = process.env.DATA_DIR || './data';
mkdirSync(dataDir, { recursive: true });
export const db = new DatabaseSync(`${dataDir}/platform.sqlite`);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY,content BLOB NOT NULL);`);
export function all(kind:string):any[] { return db.prepare('SELECT data FROM records WHERE kind=?').all(kind).map((r:any)=>JSON.parse(r.data)); }
export function get(kind:string,id:string):any { const r:any=db.prepare('SELECT data FROM records WHERE kind=? AND id=?').get(kind,id); return r?JSON.parse(r.data):null; }
export function put(kind:string,value:any) { db.prepare('INSERT OR REPLACE INTO records VALUES (?,?,?)').run(kind,value.id,JSON.stringify(value)); return value; }
export function transaction<T>(fn:()=>T):T { db.exec('BEGIN IMMEDIATE');try {const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;} }
export function hash(password:string) {const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function verify(password:string,value:string) {try {const [salt,hex]=value.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hex,'hex'));}catch{return false;}}
export function publicUser(u:any) { const {password,...safe}=u; return safe; }
export function remaining(studentId:string, packId?:string) {return all('pack').filter(p=>p.studentId===studentId&&(!packId||p.id===packId)).reduce((n,p)=>n+p.count,0)-all('lesson').filter(l=>l.studentId===studentId&&l.charged&&(!packId||l.packId===packId)).length;}
export function finishLesson(id:string,status:string,charge:boolean) {return transaction(()=>{const l=get('lesson',id);if(!l)throw Error('Урок не найден');if(l.status==='completed'||l.status==='late_cancelled'||l.status==='cancelled')throw Error('Урок уже закрыт');if(!['completed','late_cancelled','cancelled'].includes(status))throw Error('Неверный статус');if(l.trial)charge=false;if(charge){const p=get('pack',l.packId||'');if(!p||p.studentId!==l.studentId||p.duration!==l.duration||remaining(l.studentId,p.id)<1)throw Error('Нет подходящего оплаченного занятия');}return put('lesson',{...l,status,active:false,paid:charge,charged:charge,endedAt:new Date().toISOString()});});}
