export type Kind='center'|'live';
export type Status='planned'|'done'|'cancelled';
export interface Lesson {id:string;kind:Kind;students:string[];grade:string;topic:string;date:string;start:string;end:string;status:Status;note:string}
export interface Payment {id:string;kind:Kind;date:string;amount:number;note:string}
export interface Data {lessons:Lesson[];payments:Payment[]}
export const names:Record<Kind,string>={center:'Dershane',live:'Canlı ders'};
export const statuses:Record<Status,string>={planned:'Planlandı',done:'Yapıldı',cancelled:'İptal edildi'};
export const money=(n:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2}).format(n);
export function iso(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export const today=()=>iso(new Date());
export const dateObj=(s:string)=>new Date(s+'T12:00:00');
export function addDays(s:string,n:number){const d=dateObj(s);d.setDate(d.getDate()+n);return iso(d)}
export const fmtDate=(s:string,options:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>dateObj(s).toLocaleDateString('tr-TR',options);
export const minutes=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));
export function fee(l:Pick<Lesson,'kind'|'students'>){return l.kind==='live'&&l.students.length>1?400:200}
export function balance(lessons:Lesson[],payments:Payment[],kind:Kind,month?:string){const rows=lessons.filter(l=>l.kind===kind&&l.status==='done'&&(!month||l.date.startsWith(month)));const earned=rows.reduce((n,l)=>n+fee(l),0);const cents=payments.filter(p=>p.kind===kind&&(!month||p.date.startsWith(month))).reduce((n,p)=>n+Math.round(p.amount*100),0);const paid=cents/100;return {earned,paid,due:Math.max(0,earned-paid),advance:Math.max(0,paid-earned),count:rows.length}}
export function overlaps(l:Lesson,others:Lesson[]){return l.status==='cancelled'?[]:others.filter(o=>o.id!==l.id&&o.status!=='cancelled'&&o.date===l.date&&l.start<o.end&&l.end>o.start)}
export function defaultLesson(kind:Kind,date=today()):Lesson{return {id:crypto.randomUUID(),kind,students:[],grade:'8',topic:'',date:kind==='center'?addDays(date,(7-dateObj(date).getDay())%7):date,start:'10:00',end:'10:40',status:'planned',note:''}}
function validDate(v:unknown):v is string {if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=dateObj(v);return !isNaN(d.getTime())&&iso(d)===v&&v>='2000-01-01'&&v<='2100-12-31'}
const text=(v:unknown,max=1000):v is string=>typeof v==='string'&&v.length<=max;
const kind=(v:unknown)=>v==='center'||v==='live';
const time=(v:unknown)=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export function validateLesson(l:Lesson){if(!l||!text(l.id,100)||!l.id||!kind(l.kind)||!validDate(l.date)||!time(l.start)||!time(l.end)||l.end<=l.start||!Array.isArray(l.students)||!l.students.length||l.students.length>100||!l.students.every(s=>text(s,100)&&s.trim())||!text(l.grade,40)||!l.grade.trim()||!text(l.topic,200)||!l.topic.trim()||!text(l.note,2000)||!['planned','done','cancelled'].includes(l.status))throw new Error('Ders bilgilerini kontrol edin. Öğrenci, sınıf ve konu zorunludur; bitiş başlangıçtan sonra olmalıdır.');}
export function validatePayment(p:Payment){if(!p||!text(p.id,100)||!p.id||!kind(p.kind)||!validDate(p.date)||typeof p.amount!=='number'||!Number.isFinite(p.amount)||p.amount<=0||p.amount>10000000||Math.abs(p.amount*100-Math.round(p.amount*100))>0.00001||!text(p.note,2000))throw new Error('Geçerli bir tarih ve sıfırdan büyük, en fazla iki ondalıklı ödeme tutarı girin.');}
export function parseBackup(raw:string):Data {try{const b=JSON.parse(raw);if(b.version!==1||!Array.isArray(b.lessons)||!Array.isArray(b.payments)||b.lessons.length>100000||b.payments.length>100000)throw Error();b.lessons.forEach(validateLesson);b.payments.forEach(validatePayment);for(const rows of [b.lessons,b.payments])if(new Set(rows.map((r:{id:string})=>r.id)).size!==rows.length)throw Error();return {lessons:b.lessons,payments:b.payments}}catch{throw new Error('Yedek dosyası geçersiz veya desteklenmeyen bir sürümde. Mevcut kayıtlarınız değiştirilmedi.')}}
