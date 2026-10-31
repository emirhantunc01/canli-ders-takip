import {app,BrowserWindow,dialog,ipcMain,Menu} from 'electron';
import type {IpcMainInvokeEvent} from 'electron';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileStore} from './store.js';

// A separate test profile is accepted only by explicitly launched development tests.
const testProfile=!app.isPackaged&&process.env.DERS_DEFTERI_TEST_PROFILE;
app.setName('Ders Defteri');
app.setPath('userData',testProfile||join(app.getPath('appData'),'DersDefteri'));
const single=app.requestSingleInstanceLock();
let window:BrowserWindow|null=null;
const store=new FileStore(app.getPath('userData'));
const renderer=join(app.getAppPath(),'dist','index.html');
const rendererURL=pathToFileURL(renderer).href;
function allowed(event:IpcMainInvokeEvent){if(!window||event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||event.senderFrame.url.split('#')[0]!==rendererURL)throw new Error('Bu işlem yalnızca uygulama penceresinden yapılabilir.')}
function createWindow(){
 window=new BrowserWindow({width:1380,height:950,minWidth:900,minHeight:650,title:'Ders Defteri',backgroundColor:'#f2f4f7',show:false,icon:join(app.getAppPath(),'desktop','icon.ico'),webPreferences:{preload:join(app.getAppPath(),'desktop','preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 Menu.setApplicationMenu(null);
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.on('will-navigate',(event,url)=>{if(url.split('#')[0]!==rendererURL)event.preventDefault()});
 window.webContents.on('will-attach-webview',event=>event.preventDefault());
 window.once('ready-to-show',()=>window?.show());
 window.webContents.on('did-fail-load',(_event,code,description)=>{if(code!==-3)dialog.showErrorBox('Ders Defteri açılamadı',description)});
 window.on('closed',()=>{window=null});
 void window.loadFile(renderer).catch(error=>dialog.showErrorBox('Ders Defteri açılamadı',String(error)));
}
if(!single){app.quit()}else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus()}});
 void app.whenReady().then(()=>{
  ipcMain.handle('records:load',async event=>{allowed(event);try{return await store.load()}catch(error){dialog.showErrorBox('Kayıt dosyası açılamadı',`${(error as Error).message}\n\nVeri klasörü: ${app.getPath('userData')}`);throw error}});
  ipcMain.handle('records:save',async(event,data:unknown)=>{allowed(event);await store.save(data as Parameters<FileStore['save']>[0])});
  createWindow();
  window!.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
 });
 app.on('window-all-closed',()=>app.quit());
}
