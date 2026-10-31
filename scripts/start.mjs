import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const url='http://127.0.0.1:5173';
const open=()=>spawn('powershell.exe',['-NoProfile','-WindowStyle','Hidden','-Command',`Start-Process '${url}'`],{stdio:'ignore',windowsHide:true});
async function available(){try{return (await fetch(url,{signal:AbortSignal.timeout(500)})).ok}catch{return false}}
if(await available()){open()}else{
 const server=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'--host','127.0.0.1','--port','5173','--strictPort'],{stdio:'inherit'});
 server.on('exit',code=>process.exit(code??0));
 for(let i=0;i<60;i++){if(await available()){open();break}await new Promise(r=>setTimeout(r,250))}
}
