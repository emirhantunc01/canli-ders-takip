import type {Data} from './domain';
export interface AndroidBridge {load():string;save(raw:string):string;exportBackup(raw:string,filename:string):string;minimize?():void}
declare global { interface Window { DersAndroid?:AndroidBridge } }
export function androidBridge(){return typeof window!=='undefined'?window.DersAndroid:undefined}
export function nativeReply(raw:string):{data?:unknown}{const reply=JSON.parse(raw);if(reply?.ok!==true)throw new Error(reply?.error||'Telefon kaydı tamamlanamadı.');return reply}
export function backupEnvelope(data:Data){return {version:2,lessons:data.lessons,payments:data.payments,receivables:data.receivables??[]}}
export function exportAndroidBackup(raw:string,filename:string):Promise<boolean>{const bridge=androidBridge();if(!bridge)return Promise.resolve(false);return new Promise((resolve,reject)=>{const done=(event:Event)=>{const detail=(event as CustomEvent).detail;window.removeEventListener('ders-backup-result',done);if(detail.cancelled)resolve(false);else if(detail.ok)resolve(true);else reject(new Error(detail.error||'Yedek kaydedilemedi.'))};window.addEventListener('ders-backup-result',done);try{nativeReply(bridge.exportBackup(raw,filename))}catch(e){window.removeEventListener('ders-backup-result',done);reject(e)}})}
