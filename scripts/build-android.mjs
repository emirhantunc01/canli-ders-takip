import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const android=path.join(root,'android');const privateDir=path.join(root,'.local');
fs.mkdirSync(privateDir,{recursive:true});
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||path.join(os.homedir(),'AppData','Local','Android','Sdk');
if(!fs.existsSync(sdk))throw Error('Android SDK bulunamadı. ANDROID_HOME ayarlayın.');
fs.writeFileSync(path.join(android,'local.properties'),'sdk.dir='+sdk.replaceAll('\\','/')+'\n');
const assets=path.join(android,'app','src','main','assets','www');
if(!assets.startsWith(root+path.sep)||!assets.endsWith(path.join('assets','www')))throw Error('Beklenmeyen varlık yolu.');
fs.rmSync(assets,{recursive:true,force:true});fs.mkdirSync(assets,{recursive:true});fs.cpSync(path.join(root,'dist'),assets,{recursive:true});
const key=path.join(privateDir,'ders-defteri.jks'),properties=path.join(privateDir,'android-signing.properties');
if(fs.existsSync(key)!==fs.existsSync(properties))throw Error('İmza anahtarı veya ayarları eksik. Güncelleme anahtarını yedekten geri yükleyin.');
if(!fs.existsSync(key)){
 const password=crypto.randomBytes(32).toString('hex');const passwordFile=path.join(privateDir,'keytool-password.tmp');
 fs.writeFileSync(passwordFile,password,{mode:0o600});
 try{const tool=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'keytool.exe':'keytool'):'keytool';const result=spawnSync(tool,['-genkeypair','-noprompt','-keystore',key,'-alias','ders-defteri','-keyalg','RSA','-keysize','3072','-validity','10000','-storetype','PKCS12','-dname','CN=Ders Defteri','-storepass:file',passwordFile,'-keypass:file',passwordFile],{cwd:root,stdio:'inherit'});if(result.error||result.status!==0)throw result.error||Error('İmza anahtarı oluşturulamadı.');fs.writeFileSync(properties,'storePassword='+password+'\n',{mode:0o600});}finally{fs.rmSync(passwordFile,{force:true})}
}
const variant=process.argv.includes('--debug')?'Debug':'Release';
const command=process.platform==='win32'?['cmd.exe',['/d','/c',`android\\gradlew.bat -p android assemble${variant} --console=plain`]]:[path.join(android,'gradlew'),['-p',android,`assemble${variant}`,'--console=plain']];
const result=spawnSync(command[0],command[1],{cwd:root,stdio:'inherit'});if(result.error||result.status!==0)throw result.error||Error('Android derlemesi başarısız.');
const source=path.join(android,'app','build','outputs','apk',variant.toLowerCase(),`app-${variant.toLowerCase()}.apk`);
const output=path.join(root,'release',variant==='Release'?'DersDefteri-Android.apk':'DersDefteri-Android-Test.apk');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(source,output);
fs.writeFileSync(output+'.sha256',crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')+'  '+path.basename(output)+'\n');
console.log('APK hazır: '+output);
