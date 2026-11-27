'use strict';
(() => {
  // Gallery images and animation settings. Keep all image paths relative to this site.
  const CONFIG = {
    cycleSeconds: 24,
    perspective: 900,
    particles: { desktop: 72, mobile: 30, linkDistance: 120, pointerDistance: 145 },
    images: [
      { src:'./assets/images/gallery-01.webp', label:'雪日 · 眼镜', alt:'戴着黑框眼镜、站在雪景前的企鹅角色插画', width:1184, height:1200 },
      { src:'./assets/images/gallery-02.webp', label:'夏日 · 小确幸', alt:'拿着汽水和巧克力冰淇淋的企鹅角色插画', width:1056, height:1200 },
      { src:'./assets/images/gallery-03.webp', label:'元气 · 瞬间', alt:'粉色短发卡通角色的元气表情插画', width:1200, height:675 },
      { src:'./assets/images/gallery-04.webp', label:'午后 · 轻松', alt:'企鹅装扮的短发角色抬手轻触头发的插画', width:1035, height:1400 },
      { src:'./assets/images/gallery-05.webp', label:'防吃 · 日常', alt:'企鹅装扮的短发角色闭眼抬手，旁边写着防吃的插画', width:1224, height:1086 },
      { src:'./assets/images/gallery-06.webp', label:'雪地 · 心意', alt:'雪地里的企鹅装扮角色展示礼盒的插画', width:1051, height:1400 }
    ]
  };
  const $ = s => document.querySelector(s);
  const stage = $('#orbit-stage'), container = $('#orbit-cards'), canvas = $('#particle-background');
  const toggle = $('#motion-toggle'), dialog = $('#photo-dialog');
  if (!stage || !container || !canvas || !toggle || !dialog) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  let userPaused = false;
  try { userPaused = sessionStorage.getItem('cj-lab-motion-paused') === 'true'; } catch {}
  let raf=0,last=0,angle=0,targetAngle=null,stageVisible=false,width=stage.clientWidth;
  let focused=false,hovered=false,dragging=false,dragStart=0,dragAngle=0,dragMoved=false,suppressClick=false;
  let active=0,viewportWidth=innerWidth,viewportHeight=innerHeight,particles=[];
  const pointer={x:-10000,y:-10000};
  const cardNodes=[],selectors=[],photoStates=[],retryPhotos=[];
  const step=2*Math.PI/CONFIG.images.length;
  stage.style.perspective=CONFIG.perspective+'px';
  container.style.perspective=CONFIG.perspective+'px';
  const mod=(a,n)=>(a%n+n)%n;
  const paused=()=>userPaused||reduced.matches;
  const pageVisible=()=>!document.hidden;
  const galleryVisible=()=>stageVisible&&!$('#view-overview').hidden;
  const galleryRunning=()=>galleryVisible()&&!focused&&!hovered&&!dragging&&!dialog.open;
  const canAnimate=()=>!paused()&&pageVisible()&&!dialog.open;

  function showPhoto(index) {
    suppressClick=false;
    if(photoStates[index]!=='ready'){if(photoStates[index]==='error')retryPhotos[index]();return;}
    const photo=CONFIG.images[index];
    $('#photo-title').textContent=photo.label;
    $('#photo-preview').src=photo.src;$('#photo-preview').alt=photo.alt;
    dialog.showModal();synchronize();
  }
  CONFIG.images.forEach((photo,index)=>{
    const card=document.createElement('button');card.type='button';card.className='orbit-card';
    card.setAttribute('aria-label','查看大图：'+photo.label);
    const frame=document.createElement('span');frame.className='orbit-image-frame';
    // All six images belong to one moving gallery. Native lazy loading can defer
    // images behind the 3D stage until after their cards have rotated forward.
    const img=document.createElement('img');img.alt=photo.alt;img.width=photo.width;img.height=photo.height;img.draggable=false;img.decoding='async';img.loading='eager';img.fetchPriority=index===0?'high':'auto';
    const status=document.createElement('span');status.className='orbit-image-status';status.setAttribute('role','status');
    frame.append(img,status);
    function imageState(state){
      photoStates[index]=state;card.dataset.imageState=state;
      card.setAttribute('aria-busy',String(state==='loading'));
      card.setAttribute('aria-label',(state==='error'?'重新加载照片：':'查看大图：')+photo.label);
      status.textContent=state==='loading'?'照片加载中…':state==='error'?'加载失败，点击重试':'';
      status.hidden=state==='ready';
    }
    img.addEventListener('load',async()=>{try{await img.decode();}catch{}if(img.naturalWidth)imageState('ready');else imageState('error');});
    img.addEventListener('error',()=>imageState('error'));
    retryPhotos[index]=()=>{imageState('loading');img.src=photo.src+(photo.src.includes('?')?'&':'?')+'retry='+Date.now();};
    imageState('loading');img.src=photo.src;
    const caption=document.createElement('span');caption.className='orbit-caption';
    const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
    const label=document.createElement('span');label.textContent=photo.label;
    const icon=document.createElement('span');icon.textContent='⤢';icon.setAttribute('aria-hidden','true');
    caption.append(number,label,icon);card.append(frame,caption);
    card.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return;}showPhoto(index);});
    card.addEventListener('mouseenter',()=>{if(fine.matches){hovered=true;drawGallery();}});
    card.addEventListener('mouseleave',()=>{hovered=false;});
    container.append(card);cardNodes.push(card);
    const dot=document.createElement('button');dot.type='button';dot.className='orbit-dot';dot.setAttribute('aria-label','转到照片：'+photo.label);dot.textContent=String(index+1).padStart(2,'0');dot.addEventListener('click',()=>select(index));$('#orbit-selection').append(dot);selectors.push(dot);
  });
  function updateControls(){selectors.forEach((dot,index)=>{const selected=index===active;dot.classList.toggle('selected',selected);dot.setAttribute('aria-pressed',String(selected));});}
  function drawGallery(){
    const radius=Math.min(width*.285,173),depthRadius=radius*.75;
    let front=-Infinity;
    cardNodes.forEach((card,index)=>{
      const theta=angle+index*step,z=Math.cos(theta)*depthRadius;
      const x=Math.sin(theta)*radius,y=-Math.cos(theta)*9;
      card.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${(-Math.sin(theta)*23).toFixed(2)}deg)`;
      card.style.opacity=(.67+(Math.cos(theta)+1)*.165).toFixed(3);
      card.style.zIndex=String(Math.round(z+200));
      card.classList.toggle('front',Math.cos(theta)>.8);
      if(z>front){front=z;active=index;}
    });
    stage.style.setProperty('--orbit-angle',(-angle*180/Math.PI).toFixed(2)+'deg');updateControls();
  }
  function select(index){
    const delta=Math.atan2(Math.sin(-index*step-angle),Math.cos(-index*step-angle));
    targetAngle=angle+delta;
    if(paused()||!galleryVisible()){angle=targetAngle;targetAngle=null;drawGallery();}
    else if(!raf)synchronize();
  }
  $('#orbit-prev').addEventListener('click',()=>select(mod(active-1,CONFIG.images.length)));
  $('#orbit-next').addEventListener('click',()=>select(mod(active+1,CONFIG.images.length)));
  stage.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(mod(active+(event.key==='ArrowRight'?1:-1),CONFIG.images.length));}});
  container.addEventListener('focusin',()=>{focused=true;});
  container.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=container.contains(document.activeElement);});});
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;dragStart=event.clientX;dragAngle=angle;dragMoved=false;targetAngle=null;});
  window.addEventListener('pointermove',event=>{
    pointer.x=event.clientX;pointer.y=event.clientY;
    if(!dragging)return;const dx=event.clientX-dragStart;
    if(Math.abs(dx)>7){dragMoved=true;angle=dragAngle+dx/Math.max(width,200)*Math.PI*1.6;drawGallery();}
  },{passive:true});
  function finishDrag(){if(!dragging)return;dragging=false;if(dragMoved){suppressClick=true;setTimeout(()=>{suppressClick=false;},350);}dragMoved=false;}
  window.addEventListener('pointerup',finishDrag);
  window.addEventListener('pointercancel',finishDrag);
  document.documentElement.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-10000;hovered=false;finishDrag();});
  $('#photo-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',synchronize);

  function resizeParticles(){
    viewportWidth=innerWidth;viewportHeight=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(viewportWidth*dpr);canvas.height=Math.round(viewportHeight*dpr);
    if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=viewportWidth<650?CONFIG.particles.mobile:CONFIG.particles.desktop;
    particles=Array.from({length:count},()=>({x:Math.random()*viewportWidth,y:Math.random()*viewportHeight,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*12,r:Math.random()*1.4+.5,phase:Math.random()*Math.PI*2}));
    drawParticles(0,0);
  }
  function drawParticles(dt,time){
    if(!ctx)return;ctx.clearRect(0,0,viewportWidth,viewportHeight);
    const link=viewportWidth<650?90:CONFIG.particles.linkDistance;
    particles.forEach((p,index)=>{
      if(dt){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0)p.x+=viewportWidth;if(p.x>viewportWidth)p.x-=viewportWidth;if(p.y<0)p.y+=viewportHeight;if(p.y>viewportHeight)p.y-=viewportHeight;}
      const alpha=.35+(Math.sin(time*.0006+p.phase)+1)*.2;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(184,241,133,${alpha})`;ctx.fill();
      for(let j=index+1;j<particles.length;j++){
        const q=particles[j],distance=Math.hypot(p.x-q.x,p.y-q.y);
        if(distance<link){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(142,196,122,${(1-distance/link)*.17})`;ctx.lineWidth=.65;ctx.stroke();}
      }
      if(fine.matches&&Math.hypot(p.x-pointer.x,p.y-pointer.y)<CONFIG.particles.pointerDistance){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.strokeStyle='rgba(194,255,107,.23)';ctx.lineWidth=.6;ctx.stroke();}
    });
  }
  function frame(now){
    raf=0;if(!canAnimate())return;const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
    if(galleryVisible()){
      if(targetAngle!==null&&!dragging){angle+=(targetAngle-angle)*Math.min(1,dt*9);if(Math.abs(targetAngle-angle)<.002){angle=targetAngle;targetAngle=null;}drawGallery();}
      else if(galleryRunning()){angle-=dt*Math.PI*2/CONFIG.cycleSeconds;if(Math.abs(angle)>Math.PI*20)angle=mod(angle,Math.PI*2);drawGallery();}
    }
    drawParticles(dt,now);raf=requestAnimationFrame(frame);
  }
  function synchronize(){
    if(raf){cancelAnimationFrame(raf);raf=0;}last=0;
    const stopped=paused();document.body.classList.toggle('motion-disabled',stopped);
    toggle.disabled=reduced.matches;toggle.title=reduced.matches?'系统已开启减少动态效果，可通过左右按钮手动切图。':'';
    toggle.setAttribute('aria-pressed',String(stopped));toggle.setAttribute('aria-label',stopped?'播放页面动效':'暂停页面动效');toggle.textContent=stopped?'▶ 播放动效':'Ⅱ 暂停动效';
    $('#motion-label').textContent=stopped?'ORBIT / STILL':'ORBIT / AUTO ROTATE';
    drawGallery();drawParticles(0,performance.now());if(canAnimate())raf=requestAnimationFrame(frame);
  }
  toggle.addEventListener('click',()=>{if(reduced.matches){toggle.textContent='系统已开启减少动态效果';return;}userPaused=!userPaused;try{sessionStorage.setItem('cj-lab-motion-paused',String(userPaused));}catch{}synchronize();});
  reduced.addEventListener('change',synchronize);document.addEventListener('visibilitychange',synchronize);window.addEventListener('hashchange',()=>requestAnimationFrame(synchronize));
  const resize=new ResizeObserver(()=>{width=stage.clientWidth;drawGallery();});resize.observe(stage);
  window.addEventListener('resize',resizeParticles,{passive:true});
  const visibility=new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;},{threshold:.05});visibility.observe(stage);
  resizeParticles();synchronize();
})();
