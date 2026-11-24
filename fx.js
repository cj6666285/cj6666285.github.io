'use strict';
(() => {
  // Replace the local image paths below with your own project photos when ready.
  const CONFIG = {
    cycleSeconds: 32,
    scrollBoost: 3.2,
    parallax: 17,
    perspective: 760,
    images: [
      {src:'./assets/images/chip.svg', label:'01 / MICROCONTROLLER'},
      {src:'./assets/images/circuit.svg', label:'02 / PCB DESIGN'},
      {src:'./assets/images/signal.svg', label:'03 / SIGNAL ANALYSIS'},
      {src:'./assets/images/firmware.svg', label:'04 / FIRMWARE'},
      {src:'./assets/images/system.svg', label:'05 / SYSTEM DESIGN'},
      {src:'./assets/images/schematic.svg', label:'06 / HARDWARE'}
    ]
  };
  const stage=document.querySelector('#tunnel');
  const container=document.querySelector('#tunnel-cards');
  const button=document.querySelector('#motion-toggle');
  if(!stage||!container||!button)return;
  stage.style.perspective=CONFIG.perspective+'px';
  container.style.perspective=CONFIG.perspective+'px';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(pointer: fine)');
  let paused=reduced.matches;
  try { paused=paused||sessionStorage.getItem('cj-lab-motion-paused')==='true'; }catch{}
  let width=stage.clientWidth,height=stage.clientHeight,raf=0,last=0,phase=0,visible=false;
  let targetX=0,targetY=0,pointerX=0,pointerY=0,velocity=0,scrollTime=0;
  let previousScroll=window.scrollY;
  const positionX=[-1,1,-1,1,-1,1];
  const positionY=[-.22,.21,.25,-.25,-.12,.12];
  const cards=CONFIG.images.map((image,index)=>{
    const figure=document.createElement('figure');figure.className='depth-card';
    const img=document.createElement('img');img.src=image.src;img.alt='';img.width=720;img.height=480;
    img.loading=index<2?'eager':'lazy';img.decoding='async';
    const caption=document.createElement('figcaption');caption.append(document.createTextNode(image.label));
    const marker=document.createElement('span');marker.textContent='↗';caption.append(marker);
    figure.append(img,caption);container.append(figure);return figure;
  });
  function draw(){
    const mobile=width<420;
    cards.forEach((card,index)=>{
      const p=(.87-index/6+phase)%1;
      const z=-920+p*1100;
      const spread=width*(mobile?.265:.265);
      const x=positionX[index]*(spread+Math.sin(p*Math.PI*2+index)*width*.035)+pointerX*CONFIG.parallax;
      const y=positionY[index]*height+Math.cos(p*Math.PI*2+index)*height*.04+pointerY*CONFIG.parallax*.7;
      const rotation=positionX[index]*(-7+Math.sin(p*Math.PI*2)*4);
      const stretch=1+Math.min(velocity*.05,.09);
      const fadeIn=Math.min(1,p/.13),fadeOut=Math.min(1,(1-p)/.12);
      card.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateZ(${rotation.toFixed(2)}deg) scaleY(${stretch.toFixed(3)})`;
      card.style.opacity=(Math.max(0,fadeIn*fadeOut)*(.48+p*.52)).toFixed(3);
      card.style.zIndex=String(Math.floor(p*100));
      card.style.filter=mobile?'none':`blur(${Math.min(1.3,velocity*.18+Math.max(0,.25-p)*1.8).toFixed(2)}px)`;
    });
    document.querySelector('#coordinate-x').textContent=pointerX.toFixed(2);
    document.querySelector('#coordinate-y').textContent=pointerY.toFixed(2);
  }
  function canRun(){return !paused&&!document.hidden&&visible&&!document.querySelector('#view-overview').hidden;}
  function frame(now){
    raf=0;if(!canRun())return;
    const delta=Math.min(.06,last?(now-last)/1000:1/60);last=now;
    velocity*=Math.exp(-delta*4.5);
    pointerX+=(targetX-pointerX)*Math.min(1,delta*5);
    pointerY+=(targetY-pointerY)*Math.min(1,delta*5);
    phase=(phase+delta/CONFIG.cycleSeconds*(1+velocity*CONFIG.scrollBoost))%1;
    draw();raf=requestAnimationFrame(frame);
  }
  function synchronize(){
    if(raf){cancelAnimationFrame(raf);raf=0;}last=0;
    document.body.classList.toggle('motion-disabled',paused);
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'播放画廊动效':'暂停画廊动效');
    button.textContent=paused?'▶ 播放动效':'Ⅱ 暂停动效';
    document.querySelector('#motion-label').textContent=paused?'DEPTH FIELD / STILL':'DEPTH FIELD / ACTIVE';
    if(canRun())raf=requestAnimationFrame(frame);else draw();
  }
  button.addEventListener('click',()=>{paused=!paused;try{sessionStorage.setItem('cj-lab-motion-paused',String(paused));}catch{}synchronize();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;velocity=0;synchronize();});
  stage.addEventListener('pointermove',event=>{if(paused||!finePointer.matches)return;const bounds=stage.getBoundingClientRect();targetX=(event.clientX-bounds.left)/bounds.width*2-1;targetY=(event.clientY-bounds.top)/bounds.height*2-1;});
  stage.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  window.addEventListener('scroll',()=>{const now=performance.now();const delta=Math.abs(window.scrollY-previousScroll);const elapsed=Math.max(16,now-scrollTime);previousScroll=window.scrollY;scrollTime=now;if(canRun())velocity=Math.min(2,velocity+delta/elapsed*.28);},{passive:true});
  document.addEventListener('visibilitychange',synchronize);
  window.addEventListener('hashchange',()=>{velocity=0;previousScroll=0;requestAnimationFrame(synchronize);});
  const resize=new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;if(!canRun())draw();});resize.observe(stage);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;synchronize();},{threshold:.05});observer.observe(stage);
  draw();synchronize();
})();
