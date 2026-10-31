import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {FileStore} from '../desktop/store';
const dirs:string[]=[];
async function setup(){const dir=await mkdtemp(join(tmpdir(),'ders-defteri-test-'));dirs.push(dir);return {dir,store:new FileStore(dir)}}
afterEach(async()=>{await Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true})))});
const data={lessons:[],payments:[{id:'p',kind:'center' as const,date:'2026-10-31',amount:125.5,note:'Kısmi ödeme'}]};
it('ilk açılış boş olur; kaydedilen tutar yeni depo örneğinde korunur',async()=>{const {dir,store}=await setup();expect(await store.load()).toEqual({lessons:[],payments:[]});await store.save(data);expect(await new FileStore(dir).load()).toEqual(data)});
it('geçersiz yazım eski veriyi değiştirmez',async()=>{const {store}=await setup();await store.save(data);await expect(store.save({...data,payments:[{...data.payments[0],amount:-1}]})).rejects.toThrow();expect(await store.load()).toEqual(data)});
it('bozuk ana dosyayı sıfırlamaz ve üstüne yazmaz',async()=>{const {store,dir}=await setup();await writeFile(join(dir,'records.json'),'{bad');await expect(store.load()).rejects.toThrow();await expect(store.save(data)).rejects.toThrow();expect(await readFile(join(dir,'records.json'),'utf8')).toBe('{bad')});
it('her başarılı değişimde önceki kayıt dosyasını korur',async()=>{const {store,dir}=await setup();await store.save(data);await store.save({lessons:[],payments:[]});expect(JSON.parse(await readFile(join(dir,'records.previous.json'),'utf8')).payments[0].amount).toBe(125.5);expect(await store.load()).toEqual({lessons:[],payments:[]})});
it('paralel yazımları sıraya alır ve tamamlanmış son veriyi korur',async()=>{const {store}=await setup();await Promise.all([store.save(data),store.save({lessons:[],payments:[]})]);expect(await store.load()).toEqual({lessons:[],payments:[]})});

it('eski dosyayı açar ve eklenen birikmiş alacağı kayıpsız saklar',async()=>{const {store,dir}=await setup();await writeFile(join(dir,'records.json'),JSON.stringify({version:1,lessons:[],payments:[]}));const old=await store.load();await store.save({...old,receivables:[{id:'r',kind:'live',date:'2026-10-31',amount:5000,note:''}]});expect((await new FileStore(dir).load()).receivables?.[0].amount).toBe(5000);expect(JSON.parse(await readFile(join(dir,'records.json'),'utf8')).version).toBe(2)});
