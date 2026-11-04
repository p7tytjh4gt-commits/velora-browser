(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const enabled=()=>!reduced.matches&&!document.body.classList.contains('reduce-motion');
 const springs=new Map();let frame=0,last=0;
 function tick(now){frame=0;const dt=Math.min((now-last)/1000||1/60,1/30);last=now;let busy=false;for(const [key,s] of springs){if(key instanceof Element&&!key.isConnected){springs.delete(key);continue}let moving=false;for(let i=0;i<s.x.length;i++){s.v[i]+=((s.to[i]-s.x[i])*180-s.v[i]*25)*dt;s.x[i]+=s.v[i]*dt;if(Math.abs(s.x[i]-s.to[i])>.002||Math.abs(s.v[i])>.01)moving=true;else{s.x[i]=s.to[i];s.v[i]=0}}s.draw(s.x);busy=busy||moving}if(busy&&!document.hidden&&enabled())frame=requestAnimationFrame(tick)}
 function spring(key,to,draw,from=to){let s=springs.get(key);if(!s){s={x:[...from],to:[...to],v:to.map(()=>0),draw};springs.set(key,s)}s.to=[...to];s.draw=draw;if(!enabled()){s.x=[...to];s.v=to.map(()=>0);draw(to);return}if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick)}}
 function reset(){if(!enabled()){cancelAnimationFrame(frame);frame=0;for(const [key,s] of springs){s.x=[...s.to];s.v=s.to.map(()=>0);s.draw(s.x);if(key instanceof Element)key.style.transform=''}}indicator()}
 let hover;
 const eligible=target=>target.closest('.shortcuts button,.home-tools button,.new,.themes button,#setup-next,header button:not(#address)');
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'||!enabled())return;const b=eligible(e.target);if(!b||b.contains(e.relatedTarget))return;hover=b;const scale=b.matches('.new,#setup-next')?1.01:1.015;spring(b,[0,-1,scale],v=>{if(enabled())b.style.transform=`translate3d(${v[0]}px,${v[1]}px,0) scale(${v[2]})`},[0,0,1])});
 document.addEventListener('pointermove',e=>{if(!hover||!hover.contains(e.target)||!enabled())return;const r=hover.getBoundingClientRect(),b=hover;spring(b,[(e.clientX-r.left-r.width/2)*0,-1, b.matches('.new,#setup-next')?1.01:1.015],v=>{if(enabled())b.style.transform=`translate3d(${v[0]}px,${v[1]}px,0) scale(${v[2]})`},[0,0,1])});
 document.addEventListener('pointerout',e=>{const b=eligible(e.target);if(!b||b.contains(e.relatedTarget))return;if(hover===b)hover=null;spring(b,[0,0,1],v=>{b.style.transform=enabled()?`translate3d(${v[0]}px,${v[1]}px,0) scale(${v[2]})`:''},[0,0,1])});
 document.addEventListener('pointerdown',e=>{const b=eligible(e.target);if(!b||!enabled())return;spring(b,[0,0,.99],v=>b.style.transform=`translate3d(${v[0]}px,${v[1]}px,0) scale(${v[2]})`,[0,0,1])});
 document.addEventListener('pointerup',e=>{const b=eligible(e.target);if(!b)return;spring(b,[0,0,1],v=>b.style.transform=enabled()?`translate3d(${v[0]}px,${v[1]}px,0) scale(${v[2]})`:'',[0,0,1])});
 function indicator(){const b=document.querySelector('[data-mood][aria-pressed="true"]'),el=document.querySelector('#mood-indicator');if(!b||!el)return;spring('mood',[b.offsetLeft-4,b.offsetWidth],v=>el.style.transform=`translateX(${v[0]}px) scaleX(${v[1]/60})`)}
 window.addEventListener('velora-mood',indicator);window.addEventListener('resize',indicator);window.addEventListener('velora-motion',reset);reduced.addEventListener('change',reset);document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('app-hidden',document.hidden);if(document.hidden){cancelAnimationFrame(frame);frame=0}else indicator()});indicator();
})();
