import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import {loadData, saveData} from '../src/storage';
it('dersleri ve ödemeleri yeniden açıldığında korur ve yedeği atomik değiştirir',async()=>{
 const lesson={id:'a',kind:'center' as const,students:['Ada'],grade:'8',topic:'Cebir',date:'2026-11-01',start:'10:00',end:'10:40',status:'done' as const,note:''};
 await saveData({lessons:[lesson],payments:[{id:'p',kind:'center',date:'2026-11-01',amount:100,note:''}]});
 expect((await loadData()).lessons).toEqual([lesson]);expect((await loadData()).payments[0].amount).toBe(100);
 await saveData({lessons:[],payments:[]});expect(await loadData()).toEqual({lessons:[],payments:[]});
});
