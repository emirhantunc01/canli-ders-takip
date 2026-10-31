import {it,expect,afterEach,vi} from 'vitest';
import {loadData,saveData} from '../src/storage';
afterEach(()=>vi.unstubAllGlobals());
const fixture={lessons:[],payments:[],receivables:[{id:'r',kind:'center' as const,date:'2026-10-31',amount:5000,note:''}]};
it('Android köprüsündeki alacağı doğrulayıp okur',async()=>{vi.stubGlobal('window',{DersAndroid:{load:()=>JSON.stringify({ok:true,data:{version:2,...fixture}})}});expect(await loadData()).toEqual(fixture)});
it('Android kayıt hatasını başarı saymaz',async()=>{vi.stubGlobal('window',{DersAndroid:{save:()=>JSON.stringify({ok:false,error:'Disk dolu'})}});await expect(saveData(fixture)).rejects.toThrow('Disk dolu')});
it('Android yükleme hatasını boş veriyle maskelemez',async()=>{vi.stubGlobal('window',{DersAndroid:{load:()=>JSON.stringify({ok:false,error:'Kayıt açılamadı'})}});await expect(loadData()).rejects.toThrow('Kayıt açılamadı')});
it('Android kayıt köprüsüne v2 yedek biçimini verir',async()=>{let stored='';vi.stubGlobal('window',{DersAndroid:{save:(raw:string)=>{stored=raw;return JSON.stringify({ok:true})}}});await saveData(fixture);expect(JSON.parse(stored)).toEqual({version:2,...fixture})});
it('Android köprüsünden bozuk kayıt gelirse reddeder',async()=>{vi.stubGlobal('window',{DersAndroid:{load:()=>JSON.stringify({ok:true,data:{version:2,lessons:[],payments:[],receivables:[{...fixture.receivables[0],amount:-1}]}})}});await expect(loadData()).rejects.toThrow()});
