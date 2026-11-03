const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('velora',{action:(kind,value)=>ipcRenderer.invoke('action',kind,value),onState:fn=>ipcRenderer.on('state',(_e,state)=>fn(state)),onCommand:fn=>ipcRenderer.on('command',()=>fn())});
