import {test,expect,_electron as electron} from '@playwright/test';
import {existsSync} from 'node:fs';import {resolve} from 'node:path';
test('paketlenmiş Windows exe, sunucu ve Node kurulumu gerektirmeden açılır',async()=>{
 const executablePath=resolve('release/win-unpacked/Ders Defteri.exe');test.skip(!existsSync(executablePath),'Önce Windows paketi üretilmeli');
 const app=await electron.launch({executablePath,args:[]});
 try{const page=await app.firstWindow();await expect(page.getByRole('heading',{name:'Ders takvimi',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Yeni ders',exact:true})).toBeEnabled();expect(page.url()).toMatch(/^file:.*app\.asar/);expect(await app.evaluate(({app})=>app.isPackaged)).toBe(true);await page.screenshot({path:'.taste-skill/packaged-desktop.png',fullPage:true})}finally{await app.close()}
});
