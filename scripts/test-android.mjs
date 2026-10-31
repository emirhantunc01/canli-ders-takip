import {_android as android,expect} from '@playwright/test';import assert from 'node:assert/strict';
const devices=await android.devices();const device=devices.find(d=>d.serial().startsWith('emulator-'));if(!device)throw Error('Yalnızca Android emülatöründe çalıştırılır.');
const pkg='com.emirhantunc.dersdefteri';let original;let page;
async function connect(){const view=await device.webView({pkg},{timeout:30000});const p=await view.page();await expect(p.getByRole('heading',{name:'Ders takvimi',exact:true})).toBeVisible();return p}
try{
 await device.shell(`am force-stop ${pkg}`);await device.shell(`am start -W -f 0x10008000 -n ${pkg}/.MainActivity`);page=await connect();original=await page.evaluate(()=>JSON.parse(window.DersAndroid.load()).data);
 // This test operates only on an emulator and restores its snapshot in finally.
 await page.evaluate(()=>{const r=JSON.parse(window.DersAndroid.save(JSON.stringify({version:2,lessons:[],payments:[],receivables:[]})));if(!r.ok)throw Error(r.error)});await page.reload();
 await page.locator('.mobile-nav').getByRole('button',{name:'Ödemeler',exact:true}).click();await page.getByRole('button',{name:'Birikmiş alacak ekle',exact:true}).first().click();await page.getByLabel('Tutar (TL)').fill('5000');await page.getByRole('button',{name:'Alacağı kaydet'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Ödeme ekle',exact:true}).first().click();await page.getByLabel('Tutar (TL)').fill('1500');await page.getByRole('button',{name:'Ödemeyi kaydet'}).click();await expect(page.locator('.ledger').first().locator('.balance')).toContainText('3.500,00');
 await page.locator('.mobile-nav').getByRole('button',{name:'Takvim',exact:true}).click();await page.getByRole('button',{name:'Yeni ders',exact:true}).click();await page.getByLabel('Öğrenci adları').fill('Android Test Öğrenci, İkinci Öğrenci');await page.getByLabel('Konu',{exact:true}).fill('Üslü sayılar');await page.getByLabel('Ders durumu').selectOption('done');await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await device.shell(`am force-stop ${pkg}`);await device.shell(`am start -W -f 0x10008000 -n ${pkg}/.MainActivity`);page=await connect();
 await page.locator('.mobile-nav').getByRole('button',{name:'Ödemeler',exact:true}).click();await expect(page.locator('.ledger').first().locator('.balance')).toContainText('3.500,00');await expect(page.locator('.ledger').nth(1).locator('.balance')).toContainText('400,00');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await device.screenshot({path:'.taste-skill/android-payments.png'});
 await page.locator('.mobile-nav').getByRole('button',{name:'Yedekleme',exact:true}).click();await expect(page.getByRole('heading',{name:'Bu telefonda saklanır'})).toBeVisible();
 await page.evaluate(()=>{window.__backupResult=null;window.addEventListener('ders-backup-result',event=>window.__backupResult=event.detail)});
 await page.getByRole('button',{name:'JSON yedeğini indir'}).click();
 const filename='ders-defteri-android-test-'+Date.now()+'.json';
 await device.wait({res:'android:id/button1',text:'SAVE'},{timeout:15000});await device.fill({res:'android:id/title',clazz:'android.widget.EditText'},filename);await device.tap({res:'android:id/button1',text:'SAVE'});
 await expect.poll(()=>page.evaluate(()=>window.__backupResult),{timeout:15000}).toMatchObject({ok:true,cancelled:false});
 const exported='/sdcard/Download/'+filename;
 const data=JSON.parse((await device.shell(`cat ${exported}`)).toString());assert.equal(data.receivables[0].amount,5000);assert.equal(data.payments[0].amount,1500);assert.equal(data.lessons[0].students.length,2);
 await page.evaluate(()=>window.DersAndroid.save(JSON.stringify({version:2,lessons:[],payments:[],receivables:[]})));await page.reload();await page.locator('.mobile-nav').getByRole('button',{name:'Yedekleme',exact:true}).click();await page.getByText('Yedek dosyası seç',{exact:true}).click();await device.wait({text:filename},{timeout:15000});await device.tap({text:filename});await expect(page.getByRole('dialog')).toContainText('1 birikmiş alacak');await page.getByRole('button',{name:'Kayıtları değiştir ve yükle'}).click();await page.locator('.mobile-nav').getByRole('button',{name:'Ödemeler',exact:true}).click();await expect(page.locator('.ledger').first().locator('.balance')).toContainText('3.500,00');
 console.log('Android UI: alacak, kısmi ödeme, grup dersi, yeniden açılış ve gerçek belge yedeği geçti.');
}finally{
 if(original&&page&&!page.isClosed())await page.evaluate(raw=>{window.DersAndroid.save(JSON.stringify(raw))},original).catch(()=>{});
 await device.shell('am force-stop com.microsoft.playwright.androiddriver').catch(()=>{});
 await Promise.race([device.close(),new Promise(resolve=>setTimeout(resolve,3000))]);
}

process.exit(0);
