import {test,expect,_electron as electron} from '@playwright/test';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';

test('sunucusuz masaüstü açılır; kayıt kapanıp açılınca korunur',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ders-desktop-e2e-'));
 const profile=join(root,'first-run-profile');
 const launch=()=>electron.launch({args:['.'],env:{...process.env,DERS_DEFTERI_TEST_PROFILE:profile}});
 let app=await launch();
 try{
  let page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await expect(page.getByRole('heading',{name:'Ders takvimi',exact:true})).toBeVisible();expect(page.url()).toMatch(/^file:/);
  expect(await page.evaluate(()=>typeof window.dersDefteri?.load)).toBe('function');
  expect(await page.evaluate(()=>typeof (window as any).require)).toBe('undefined');
  await page.getByRole('button',{name:'Yeni ders',exact:true}).click();await page.getByLabel('Öğrenci adları').fill('Masaüstü Test Öğrenci');await page.getByLabel('Konu',{exact:true}).fill('Denklemler');await page.getByLabel('Ders durumu').selectOption('done');await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Ödemeler',exact:true}).click();await page.getByRole('button',{name:'Ödeme ekle',exact:true}).first().click();await page.getByLabel('Ödeme kaynağı').selectOption('live');await page.getByLabel('Tutar (TL)').fill('75');await page.getByRole('button',{name:'Ödemeyi kaydet'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  const disk=JSON.parse(await readFile(join(profile,'records.json'),'utf8'));expect(disk.lessons[0].students).toEqual(['Masaüstü Test Öğrenci']);expect(disk.payments[0].amount).toBe(75);
  expect(errors).toEqual([]);
  await app.close();app=await launch();page=await app.firstWindow();await page.getByRole('button',{name:'Ödemeler',exact:true}).click();await expect(page.locator('.ledger').nth(1).locator('.balance')).toContainText('125,00');
  await page.getByRole('button',{name:'Yedekleme',exact:true}).click();await expect(page.getByRole('heading',{name:'Bu bilgisayarda saklanır'})).toBeVisible();
  await page.getByRole('button',{name:'Takvim',exact:true}).click();await page.screenshot({path:'.taste-skill/desktop-native.png',fullPage:true});
 }finally{await app.close();await rm(root,{recursive:true,force:true})}
});
