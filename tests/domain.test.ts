import {describe,it,expect} from 'vitest';
import {fee, balance, parseBackup, overlaps, defaultLesson} from '../src/domain';
const lesson = {id:'a',kind:'live' as const,students:['Ada'],grade:'8',topic:'Üslü sayılar',date:'2026-10-31',start:'14:00',end:'14:40',status:'done' as const,note:''};
describe('ders ücretleri ve bağımsız hesaplar',()=>{
 it('öğrenci sayısına göre ders başına hesaplar',()=>{expect(fee(lesson)).toBe(200);expect(fee({...lesson,students:['Ada','Ece']})).toBe(400);expect(fee({...lesson,kind:'center',students:['Ada','Ece']})).toBe(200);expect(fee({...lesson,end:'16:00'})).toBe(200)});
 it('sadece yapılan dersleri sayar, kısmi ödeme ve avansı ayırır',()=>{const lessons=[lesson,{...lesson,id:'b',status:'planned' as const},{...lesson,id:'c',status:'cancelled' as const},{...lesson,id:'d',kind:'center' as const}];const payments=[{id:'p',kind:'live' as const,date:'2026-10-31',amount:75,note:''}];expect(balance(lessons,payments,'live')).toEqual({earned:200,paid:75,due:125,advance:0,count:1});expect(balance(lessons,[{...payments[0],amount:300}],'live').advance).toBe(100);expect(balance(lessons,payments,'center').due).toBe(200);expect(balance(lessons,payments,'live','2026-09').earned).toBe(0)});
 it('tamamlanma değişikliği ve silme bakiyeyi günceller',()=>{expect(balance([{...lesson,status:'planned'}],[],'live').due).toBe(0);expect(balance([lesson],[],'live').due).toBe(200);expect(balance([],[],'live').due).toBe(0)});
 it('iptalleri hariç tutup sınır saatlerde çakışmayı ayırır',()=>{expect(overlaps({...lesson,id:'b',start:'14:20',end:'15:00'},[lesson])).toHaveLength(1);expect(overlaps({...lesson,id:'b',start:'14:40',end:'15:20'},[lesson])).toHaveLength(0);expect(overlaps({...lesson,id:'b'},[{...lesson,status:'cancelled'}])).toHaveLength(0)});
 it('dershaneye pazar günü ve 40 dakika önerir',()=>{const draft=defaultLesson('center','2026-10-31');expect(draft.date).toBe('2026-11-01');expect(draft.start).toBe('10:00');expect(draft.end).toBe('10:40')});
});
describe('yedek doğrulama',()=>{
 it('geçerli yedeği geri yüklemeye hazırlar',()=>{expect(parseBackup(JSON.stringify({version:1,lessons:[lesson],payments:[]})).lessons).toEqual([lesson])});
 it.each([{}, {version:2,lessons:[],payments:[]},{version:1,lessons:[{...lesson,date:'2026-02-30'}],payments:[]},{version:1,lessons:[{...lesson,end:'13:00'}],payments:[]},{version:1,lessons:[{...lesson,students:[]}],payments:[]},{version:1,lessons:[lesson,lesson],payments:[]},{version:1,lessons:[],payments:[{id:'x',kind:'live',date:'2026-10-31',amount:-1,note:''}]}])('bozuk verileri reddeder: %j', value=>{expect(()=>parseBackup(JSON.stringify(value))).toThrow()});
});
