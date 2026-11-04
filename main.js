const {app,BrowserWindow,WebContentsView,ipcMain,session,Menu,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const {destination,allowed}=require('./core');
const {randomUUID}=require('node:crypto');
let win,tabs=[],active=null,seq=0,overlay=false,bookmarks=[],closed=[],eco=true,closing=false,focusMode=false,activeWorkspace='personal',workspaces=[{id:'personal',name:'Personal'},{id:'work',name:'Work'},{id:'study',name:'Study'}],workspaceLast={};
const file=()=>path.join(app.getPath('userData'),'velora.json');
function save(){if(!win||closing)return;fs.writeFileSync(file(),JSON.stringify({bookmarks,eco,workspaces,activeWorkspace,tabs:tabs.map(t=>({url:t.url,title:t.title,workspaceId:t.workspaceId})),active:tabs.findIndex(t=>t.id===active)}))}
function emit(){if(win&&!win.isDestroyed())win.webContents.send('state',{tabs:tabs.map(({id,url,title,sleeping,muted,loading,error,favicon,workspaceId,view})=>({id,url,title,sleeping,muted,loading,error,favicon,workspaceId,audible:!!view&&!view.webContents.isDestroyed()&&view.webContents.isCurrentlyAudible()})),active,bookmarks,eco,focusMode,workspaces,activeWorkspace})}
function bounds(){if(!win)return;let [w,h]=win.getContentSize();for(const t of tabs)if(t.view){t.view.setVisible(t.id===active&&!overlay);t.view.setBounds({x:focusMode?0:244,y:focusMode?52:88,width:Math.max(1,w-(focusMode?0:244)),height:Math.max(1,h-(focusMode?52:88))})}}
function destroy(t){if(t.view){win.contentView.removeChildView(t.view);t.view.webContents.close();t.view=null}}
function mount(t){
 if(t.view||!t.url)return;
 const v=t.view=new WebContentsView({webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,partition:'persist:velora',backgroundThrottling:true}});win.contentView.addChildView(v);
 const wc=v.webContents;t.sleeping=false;t.error='';
 wc.setAudioMuted(!!t.muted);
 for(const event of ['will-navigate','will-redirect'])wc.on(event,(e,url)=>{if(!allowed(url))e.preventDefault()});
 wc.setWindowOpenHandler(({url})=>{if(allowed(url))newTab(url);return {action:'deny'}});
 wc.on('page-favicon-updated',(_event,urls)=>{t.favicon=urls.find(url=>/^https:\/\//.test(url))||'';emit()});
 wc.on('media-started-playing',emit);wc.on('media-paused',emit);
 wc.on('page-title-updated',(_,title)=>{t.title=title;emit()});
 const update=()=>{t.url=wc.getURL()||t.url;emit();save()};wc.on('did-navigate',update);wc.on('did-navigate-in-page',update);
 wc.on('did-start-loading',()=>{t.loading=true;emit()});wc.on('did-stop-loading',()=>{t.loading=false;emit()});
 wc.on('did-fail-load',(_,code,desc,url,main)=>{if(main&&code!==-3){t.error=desc;t.loading=false;emit()}});
 wc.on('before-input-event',(e,input)=>{if(shortcut(input)){e.preventDefault()}});
 wc.on('render-process-gone',()=>{destroy(t);t.sleeping=true;t.error='Tab stopped. Click to reload.';emit()});
 wc.loadURL(t.url).catch(()=>{});bounds();
}
function select(id){const t=tabs.find(t=>t.id===id);if(!t)return;const old=tabs.find(t=>t.id===active);if(old){old.last=Date.now();workspaceLast[old.workspaceId]=old.id}active=id;activeWorkspace=t.workspaceId;workspaceLast[activeWorkspace]=id;if(t.url)mount(t);bounds();emit();save()}
function newTab(url='',workspaceId=activeWorkspace){let t={id:++seq,url:allowed(url)?url:'',title:url?'Loading…':'New tab',workspaceId,sleeping:!!url,muted:false,loading:false,last:Date.now(),view:null};tabs.push(t);select(t.id)}
function switchWorkspace(id){if(!workspaces.some(w=>w.id===id))return;activeWorkspace=id;const target=tabs.find(t=>t.id===workspaceLast[id]&&t.workspaceId===id)||tabs.find(t=>t.workspaceId===id);if(target)select(target.id);else newTab('',id)}
function shortcut(i){if(i.type!=='keyDown')return false;let mod=i.meta||i.control,k=i.key.toLowerCase();if(!mod)return false;if(i.shift&&k==='f'){action('focus');return true;}if(k==='l'||k==='k'){overlay=true;bounds();win.webContents.send('command');return true}if(k==='t'){newTab();return true}if(k==='w'){action('close',active);return true}if(k==='r'){action('reload');return true}return false}
function action(kind,value){const t=tabs.find(t=>t.id===active);switch(kind){
 case 'new':newTab();break;
 case 'go':{const url=destination(value);if(url&&t){t.url=url;t.favicon='';t.error='';t.title='Loading…';if(t.view)t.view.webContents.loadURL(url).catch(()=>{});else mount(t);overlay=false;bounds()}break}
 case 'select':if(tabs.some(t=>t.id===value))select(value);break;
 case 'close':{const index=tabs.findIndex(t=>t.id===value);if(index<0)break;const item=tabs[index];closed.push({url:item.url,title:item.title,workspaceId:item.workspaceId});closed=closed.slice(-20);destroy(item);tabs.splice(index,1);if(active===value){const next=tabs.find(t=>t.workspaceId===activeWorkspace);if(next)select(next.id);else newTab()}break}
 case 'reopen':{const item=closed.pop();if(item)newTab(item.url,workspaces.some(w=>w.id===item.workspaceId)?item.workspaceId:activeWorkspace);break}
 case 'focus':focusMode=!focusMode;bounds();break;
 case 'workspace-switch':switchWorkspace(value);break;
 case 'workspace-create':{const name=String(value||'').trim().slice(0,32);if(name&&workspaces.length<12){const id='space-'+randomUUID();workspaces.push({id,name});switchWorkspace(id)}break}
 case 'workspace-rename':{const name=String(value||'').trim().slice(0,32),w=workspaces.find(w=>w.id===activeWorkspace);if(name&&w)w.name=name;break}
 case 'workspace-move':if(t&&workspaces.some(w=>w.id===value)&&value!==activeWorkspace){t.workspaceId=value;const next=tabs.find(item=>item.workspaceId===activeWorkspace);if(next)select(next.id);else newTab()}break;
 case 'mute-others':for(const item of tabs)if(item.id!==active){item.muted=true;item.view?.webContents.setAudioMuted(true)}break;
 case 'import-bookmarks':{if(!Array.isArray(value))return {added:0};const known=new Set(bookmarks.map(b=>new URL(b.url).href));let added=0;for(const item of value.slice(0,5000)){if(!item||typeof item.url!=='string'||item.url.length>8192||!allowed(item.url))continue;const canonical=new URL(item.url).href;if(known.has(canonical))continue;known.add(canonical);bookmarks.push({url:canonical,title:String(item.title||item.url).slice(0,200)});added++}emit();save();return {added}}
 case 'back':if(t?.view?.webContents.navigationHistory.canGoBack())t.view.webContents.navigationHistory.goBack();break;
 case 'forward':if(t?.view?.webContents.navigationHistory.canGoForward())t.view.webContents.navigationHistory.goForward();break;
 case 'reload':if(t?.view)t.view.webContents.reload();else if(t?.url)mount(t);break;
 case 'mute':if(t){t.muted=!t.muted;t.view?.webContents.setAudioMuted(t.muted)}break;
 case 'bookmark':if(t?.url){const n=bookmarks.findIndex(b=>b.url===t.url);if(n<0)bookmarks.push({url:t.url,title:t.title,favicon:t.favicon});else bookmarks.splice(n,1)}break;
 case 'open-bookmark':if(allowed(value))newTab(value);break;
 case 'overlay':overlay=!!value;bounds();return;
 case 'eco':eco=!eco;break;
 case 'sleep':for(const item of tabs)if(item.id!==active&&item.view&&!item.view.webContents.isCurrentlyAudible()){destroy(item);item.sleeping=true}break;
 case 'zoom-in':if(t?.view)t.view.webContents.setZoomLevel(t.view.webContents.getZoomLevel()+0.5);break;
 case 'zoom-out':if(t?.view)t.view.webContents.setZoomLevel(t.view.webContents.getZoomLevel()-0.5);break;
 }emit();save()}
app.whenReady().then(()=>{
 session.fromPartition('persist:velora').setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.fromPartition('persist:velora').setPermissionCheckHandler(()=>false);
 session.fromPartition('persist:velora').on('will-download',async(e,item)=>{const result=await dialog.showSaveDialog(win,{defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});if(result.canceled)item.cancel();else item.setSavePath(result.filePath)});
 win=new BrowserWindow({width:1360,height:900,minWidth:900,minHeight:600,title:'Velora',backgroundColor:'#101813',icon:path.join(__dirname,'assets','icon.png'),titleBarStyle:'hiddenInset',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
 ipcMain.handle('action',(e,kind,value)=>{if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame)return;return action(kind,value)});
 win.webContents.on('before-input-event',(e,i)=>{if(shortcut(i))e.preventDefault()});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Velora',submenu:[{role:'about'},{role:'quit'}]},{label:'Edit',submenu:[{role:'undo'},{role:'redo'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'Window',submenu:[{role:'minimize'},{role:'togglefullscreen'}]}]));
 win.loadFile('index.html');win.on('resize',bounds);
 win.webContents.on('did-finish-load',()=>{let data={};try{data=JSON.parse(fs.readFileSync(file(),'utf8'))}catch{}bookmarks=(Array.isArray(data.bookmarks)?data.bookmarks:[]).filter(b=>b&&allowed(b.url));eco=data.eco!==false;if(Array.isArray(data.workspaces)&&data.workspaces.length){workspaces=data.workspaces.filter(w=>w&&typeof w.id==='string'&&typeof w.name==='string').slice(0,12);if(!workspaces.length)workspaces=[{id:'personal',name:'Personal'}]}activeWorkspace=workspaces.some(w=>w.id===data.activeWorkspace)?data.activeWorkspace:workspaces[0].id;for(const item of (data.tabs||[]).slice(0,80)){tabs.push({id:++seq,url:allowed(item.url)?item.url:'',title:String(item.title||'Tab'),workspaceId:workspaces.some(w=>w.id===item.workspaceId)?item.workspaceId:workspaces[0].id,sleeping:!!item.url,muted:false,last:Date.now()})}if(!tabs.length)newTab();else select(tabs[Math.min(Math.max(0,data.active||0),tabs.length-1)].id)});
 win.on('close',()=>{save();closing=true;for(const t of tabs)destroy(t)});win.on('closed',()=>{win=null;app.quit()});
 setInterval(()=>{if(!eco||!win)return;let changed=false;for(const t of tabs)if(t.id!==active&&t.view&&Date.now()-t.last>300000&&!t.view.webContents.isCurrentlyAudible()){destroy(t);t.sleeping=true;changed=true}if(changed)emit()},30000).unref();
});app.on('window-all-closed',()=>app.quit());
