const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('dersDefteri',Object.freeze({
 load:()=>ipcRenderer.invoke('records:load'),
 save:data=>ipcRenderer.invoke('records:save',data)
}));
