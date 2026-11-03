(() => {
 const query=s=>document.querySelector(s);
 let saved={};try{saved=JSON.parse(localStorage.getItem('velora.audio')||'{}')}catch{}
 const options={music:false,effects:false,musicVolume:24,effectsVolume:35,muted:false,...saved};
 let context,musicBus,effectsBus,interval=null,voices=new Set(),chord=0,lastHover=0,ducked=false;
 function persist(){localStorage.setItem('velora.audio',JSON.stringify(options))}
 function ensure(){if(!context){context=new (window.AudioContext||window.webkitAudioContext)();musicBus=context.createGain();effectsBus=context.createGain();musicBus.connect(context.destination);effectsBus.connect(context.destination);musicBus.gain.value=0;effectsBus.gain.value=0}if(context.state==='suspended')context.resume().catch(()=>{});return context}
 function levels(){if(!context)return;const now=context.currentTime;const quiet=options.muted||document.hidden;musicBus.gain.setTargetAtTime(quiet||!options.music?0:options.musicVolume/100*(ducked?.15:1),now,.35);effectsBus.gain.setTargetAtTime(quiet||!options.effects?0:options.effectsVolume/100,now,.03)}
 function tone(freq,when,duration,amplitude,bus,type='sine'){
 const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=freq;osc.connect(gain);gain.connect(bus);gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(amplitude,when+Math.min(.9,duration*.2));gain.gain.exponentialRampToValueAtTime(.0001,when+duration);osc.start(when);osc.stop(when+duration+.05);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};
 }
 const progression=[[130.813,164.814,195.998,246.942],[110,130.813,164.814,195.998],[87.307,130.813,174.614,220],[97.999,146.832,195.998,246.942]];
 function phrase(){if(!context||document.hidden||options.muted||!options.music)return;const notes=progression[chord++%4],start=context.currentTime+.06;notes.forEach(n=>tone(n,start,7.9,.035,musicBus));[0,2,1,3].forEach((n,i)=>tone(notes[n]*4,start+i*1.8,2.6,.023,musicBus))}
 function stopMusic(){if(interval!==null){clearInterval(interval);interval=null}for(const voice of voices){try{voice.stop(context.currentTime+.08)}catch{}}voices.clear()}
 function sync(){levels();if(options.music&&!options.muted&&!document.hidden){ensure();levels();if(interval===null){phrase();interval=setInterval(phrase,8000)}}else stopMusic();persist();render()}
 function fx(kind){if(!options.effects||options.muted||document.hidden)return;ensure();levels();tone(kind==='hover'?740:440,context.currentTime+.005,kind==='hover'?.045:.095,kind==='hover'?.025:.07,effectsBus)}
 function render(){query('#music-enabled').checked=options.music;query('#effects-enabled').checked=options.effects;query('#music-volume').value=options.musicVolume;query('#effects-volume').value=options.effectsVolume;query('#music-level').textContent=options.musicVolume+'%';query('#effects-level').textContent=options.effectsVolume+'%';query('#audio-mute').textContent=options.muted?'Unmute':'Mute all';query('#audio-status').textContent=options.muted?'All Velora audio muted.':options.music?(ducked?'Music softened for page audio.':'Ambient music on.'):options.effects?'Interface sounds on.':'Ready when you are.';query('#sound-settings').classList.toggle('is-on',options.music&&!options.muted)}
 query('#sound-settings').onclick=()=>{window.velora.action('overlay',true);query('#audio-settings').showModal();render()};query('#audio-close').onclick=()=>query('#audio-settings').close();query('#audio-settings').addEventListener('close',()=>window.velora.action('overlay',false));
 for(const [id,key] of [['music-enabled','music'],['effects-enabled','effects']])query('#'+id).onchange=e=>{options[key]=e.target.checked;ensure();sync();if(key==='effects')fx('click')};
 for(const [id,key] of [['music-volume','musicVolume'],['effects-volume','effectsVolume']])query('#'+id).oninput=e=>{options[key]=Number(e.target.value);ensure();sync()};
 query('#audio-mute').onclick=()=>{options.muted=!options.muted;ensure();sync()};
 document.addEventListener('pointerdown',e=>{if(e.target.closest('button,input')){if(options.music||options.effects){ensure();sync()}fx('click')}});
 document.addEventListener('pointerover',e=>{const b=e.target.closest('button');if(!b||b.contains(e.relatedTarget))return;const now=performance.now();if(now-lastHover<110)return;lastHover=now;fx('hover')});
 document.addEventListener('visibilitychange',()=>sync());window.addEventListener('velora-state',e=>{ducked=e.detail.tabs.some(t=>t.audible&&!t.muted);levels();render()});window.addEventListener('beforeunload',()=>{stopMusic();context?.close()});
 // Audio starts only after a gesture, even when a saved preference is enabled.
 render();
})();
