/* Zaso atmospheric effects: canvas only, no external dependencies. */
(function(){
 const stage=document.querySelector('.profile-stage');if(!stage)return;
 const canvas=document.createElement('canvas');canvas.className='zaso-weather';canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);
 const lightning=document.createElement('div');lightning.className='zaso-lightning';lightning.setAttribute('aria-hidden','true');stage.append(lightning);
 const ctx=canvas.getContext('2d');let particles=[],w=0,h=0,mode='none',frame=0,raf=0,bolt=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);seed()}
 function seed(){const count=mode==='snow'?Math.min(155,Math.floor(w*h/6500)):mode==='none'?0:Math.min(210,Math.floor(w*h/4400));particles=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:mode==='snow'?1+Math.random()*3:.7+Math.random(),v:mode==='snow'?0.45+Math.random()*1.8:8+Math.random()*9,drift:(Math.random()-.5)*.65,alpha:.3+Math.random()*.65}))}
 function draw(){raf=0;if(mode==='none'||reduced.matches)return;ctx.clearRect(0,0,w,h);frame++;
 for(const a of particles){ctx.beginPath();if(mode==='snow'){ctx.fillStyle='rgba(255,255,255,'+a.alpha+')';ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();a.y+=a.v;a.x+=a.drift+Math.sin(frame/85+a.y/45)*.2}else{ctx.strokeStyle='rgba(185,207,255,'+a.alpha*.62+')';ctx.lineWidth=a.r;ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-3,a.y+14+a.v);ctx.stroke();a.y+=a.v;a.x-=2.6}if(a.y>h+25){a.y=-25;a.x=Math.random()*w}if(a.x<0)a.x=w;if(a.x>w)a.x=0}
 if(mode==='storm'&&frame>bolt){bolt=frame+120+Math.floor(Math.random()*240);lightning.classList.remove('flash');void lightning.offsetWidth;lightning.classList.add('flash')}
 raf=requestAnimationFrame(draw)}
 function setMode(next){mode=['none','snow','rain','storm'].includes(next)?next:'none';canvas.style.display=mode==='none'?'none':'';if(raf)cancelAnimationFrame(raf);ctx.clearRect(0,0,w,h);lightning.classList.remove('flash');seed();if(mode!=='none')raf=requestAnimationFrame(draw)}
 window.ZasoEffects={apply(theme={}){setMode(theme.weather||'none');stage.classList.toggle('zaso-floating',!!theme.floating);stage.classList.toggle('zaso-creator-glow',!!theme.glow);stage.classList.toggle('zaso-sparkle',!!theme.sparkle);},setMode};
 window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else if(!document.hidden&&mode!=='none'&&!raf)raf=requestAnimationFrame(draw)});resize();
})();
