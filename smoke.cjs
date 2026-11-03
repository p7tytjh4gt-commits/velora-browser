// Runs on a Mac runner with a temporary profile and a local test website only.
const {app,webContents}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'velora-smoke-')));
let server,finished=false;
const timeout=setTimeout(()=>finish(new Error('App smoke check timed out')),45000);
function finish(error){if(finished)return;finished=true;clearTimeout(timeout);if(error)console.error(error);else console.log('PASS: real Electron startup, local assets, setup, navigation, sandbox, tabs, bookmarks and mute.');server?.close();app.exit(error?1:0)}
async function until(fn){for(let i=0;i<150;i++){const result=await fn();if(result)return result;await new Promise(r=>setTimeout(r,50))}throw Error('Expected app state did not appear')}
app.on('browser-window-created',(_e,win)=>{win.webContents.once('did-finish-load',async()=>{try{
 win.webContents.on('console-message',(_event,details)=>console.log('RENDERER:',details?.message||details));
 const js=async code=>{console.log('SMOKE:',code.slice(0,130));const result=await win.webContents.executeJavaScript(code);console.log('SMOKE OK');return result};
 await until(()=>js('document.querySelectorAll(".tab").length===1'));
 assert.equal(await js('document.querySelector("#setup").hidden'),false);
 assert.equal(await js('document.querySelectorAll(".shortcuts img[src^=\"assets/\"]").length'),4);
 assert.equal(await js('Promise.all([...document.querySelectorAll(".shortcuts img")].map(i=>i.decode())).then(()=>true)'),true);
 await js('document.querySelector("#setup-next").click();document.querySelector("[data-theme=forest]").click();document.querySelector("#setup-next").click();document.querySelector("#setup-next").click();document.querySelector("#setup-motion").click();document.querySelector("#setup-next").click()');
 await until(()=>js('document.querySelector("#setup").hidden'));
 server=http.createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Velora smoke page</title><h1>Real page navigation</h1>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 await js('window.velora.action("go",'+JSON.stringify(url)+')');
 const page=await until(()=>webContents.getAllWebContents().find(c=>c.getURL().startsWith(url)&&c.getTitle()==='Velora smoke page'));
 assert.equal(await page.executeJavaScript('typeof require'),'undefined');
 await js('window.velora.action("bookmark")');await until(()=>js('document.querySelectorAll("#bookmarks button").length===1'));
 await js('window.velora.action("mute")');assert.equal(page.isAudioMuted(),true);
 await js('window.velora.action("new")');await until(()=>js('document.querySelectorAll(".tab").length===2'));
 await js('document.querySelector(".tab.selected .close-tab").click()');await until(()=>js('document.querySelectorAll(".tab").length===1'));
 await js('window.velora.action("reopen")');await until(()=>js('document.querySelectorAll(".tab").length===2'));
 finish();
 }catch(error){finish(error)}})});
require('./main.js');
