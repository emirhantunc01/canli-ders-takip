import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {FileStore} from '../desktop/store';import {loadData,saveData} from '../src/storage';
afterEach(()=>vi.unstubAllGlobals());
it('masaüstü köprüsü varken veriyi dosya deposundan okur ve dosyaya yazar',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ders-bridge-'));const store=new FileStore(dir);
 const data={lessons:[],payments:[{id:'p',kind:'live' as const,date:'2026-10-31',amount:50,note:''}]};
 vi.stubGlobal('window',{dersDefteri:{load:()=>store.load(),save:(value:typeof data)=>store.save(value)}});
 try{await saveData(data);expect(await new FileStore(dir).load()).toEqual(data);expect(await loadData()).toEqual(data)}finally{await rm(dir,{recursive:true,force:true})}
});
