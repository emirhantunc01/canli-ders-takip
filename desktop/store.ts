import {mkdir,readFile,open,rename,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {parseBackup,type Data} from '../src/domain.js';

/** One instance owns a directory; Electron prevents a second process opening it. */
export class FileStore {
 private pending:Promise<void>=Promise.resolve();
 constructor(private readonly directory:string){}
 private get path(){return join(this.directory,'records.json')}
 private async read():Promise<{data:Data;raw:string|null}>{
  let raw:string;
  try{raw=await readFile(this.path,'utf8')}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {data:{lessons:[],payments:[]},raw:null};throw error}
  try{return {data:parseBackup(raw),raw}}catch{throw new Error('Kayıt dosyası okunamadı. Verileriniz korunuyor; records.previous.json veya indirdiğiniz yedeği kullanarak kurtarın.')}
 }
 async load():Promise<Data>{await this.pending;return (await this.read()).data}
 async save(data:Data):Promise<void>{
  // Validate and snapshot before queuing, so later mutations cannot change a pending write.
  const snapshot=parseBackup(JSON.stringify({version:1,lessons:data?.lessons,payments:data?.payments}));
  const operation=this.pending.then(async()=>{
   await mkdir(this.directory,{recursive:true});
   const old=await this.read(); // Never overwrite an unreadable/corrupt existing file.
   if(old.raw!==null)await this.atomicWrite(join(this.directory,'records.previous.json'),old.raw);
   await this.atomicWrite(this.path,JSON.stringify({version:1,...snapshot},null,2));
  });
  this.pending=operation.catch(()=>{});
  return operation;
 }
 private async atomicWrite(path:string,raw:string){
  const temporary=path+'.'+randomUUID()+'.tmp';
  try{
   const handle=await open(temporary,'wx',0o600);
   try{await handle.writeFile(raw,'utf8');await handle.sync()}finally{await handle.close()}
   await rename(temporary,path);
  }finally{await rm(temporary,{force:true}).catch(()=>{})}
 }
}
