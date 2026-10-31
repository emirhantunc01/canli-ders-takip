import {test,expect} from '@playwright/test';
test('ders oluşturma, düzenleme, ödeme ve kalıcılık',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Yeni ders',exact:true}).click();
 await page.getByLabel('Öğrenci adları').fill('Ada, Ece');await page.getByLabel('Konu',{exact:true}).fill('Üslü sayılar');await page.getByLabel('Ders durumu').selectOption('done');await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();
 await page.getByRole('button',{name:'Liste',exact:true}).click();await expect(page.getByRole('button',{name:/Ada, Ece/}).first()).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Liste',exact:true}).click();await page.getByRole('button',{name:/Ada, Ece/}).first().click();await page.getByLabel('Ders durumu').selectOption('planned');await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();
 await page.getByRole('button',{name:'Ödemeler',exact:true}).click();await page.getByRole('button',{name:'Ödeme ekle',exact:true}).first().click();await page.getByLabel('Tutar (TL)').fill('100');await page.getByRole('button',{name:'Ödemeyi kaydet'}).click();await expect(page.getByText('100,00', {exact:false}).first()).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Ödemeler',exact:true}).click();await expect(page.getByText('Tüm zamanlar · Avans', {exact:true}).first()).toBeVisible();
});
test('geçersiz yedek kayıtları değiştirmez',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Yedekleme',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":2}')});await expect(page.getByRole('alert')).toContainText('geçersiz')});



test('yedek geri yükleme, çakışma, silme ve ekran boyutları',async({page})=>{
 const now=new Date();const d=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 const l={id:'fixture',kind:'live',students:['Deneme Öğrenci'],grade:'8',topic:'Cebir',date:d,start:'10:00',end:'10:40',status:'done',note:''};
 await page.goto('/');await page.getByRole('button',{name:'Yedekleme',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,lessons:[l],payments:[]}))});
 await page.getByRole('button',{name:'Kayıtları değiştir ve yükle'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Takvim',exact:true}).click();await page.getByRole('button',{name:'Yeni ders',exact:true}).click();await page.getByLabel('Öğrenci adları').fill('Diğer Öğrenci');await page.getByLabel('Konu',{exact:true}).fill('Geometri');await expect(page.getByText(/Bu saatlerde/)).toBeVisible();await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByLabel('Çakışmaya rağmen kaydet').check();await page.getByRole('button',{name:'Dersi kaydet',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'.taste-skill/desktop.png',fullPage:true});
 await page.setViewportSize({width:768,height:1000});await page.screenshot({path:'.taste-skill/tablet.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.taste-skill/mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Liste',exact:true}).click();await page.getByRole('button',{name:/Diğer Öğrenci/}).first().click();await page.getByRole('button',{name:'Dersi sil',exact:true}).click();await page.getByRole('button',{name:'Kalıcı olarak sil'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:/Diğer Öğrenci/})).toHaveCount(0);
 await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('button',{name:'Yedekleme',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'JSON yedeğini indir'}).click();expect((await download).suggestedFilename()).toContain('ders-defteri-');
});
