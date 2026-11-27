'use strict';
(() => {
  const CONFIG={intervalMs:2000};
  const backdrop=document.getElementById('home-backgrounds');
  const overview=document.getElementById('view-overview');
  const controls=document.getElementById('background-controls'),status=document.getElementById('background-status'),play=document.getElementById('background-play');
  if(!backdrop||!overview||!controls||!status||!play)return;
  const slides=[...backdrop.querySelectorAll('.background-slide')];
  if(!slides.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ready=slides.map(()=>false),failed=slides.map(()=>false);
  let current=0,timer=0,initialized=false,userPaused=false,allowReduced=false;
  const paused=()=>userPaused||(reduced.matches&&!allowReduced)||document.body.classList.contains('motion-disabled')&&!(reduced.matches&&allowReduced);
  const running=()=>initialized&&!overview.hidden&&!document.hidden&&!paused()&&!document.querySelector('dialog[open]');
  function update(){
    const number=slides[current].dataset.number;
    if(backdrop.dataset.activeSlide!==number)backdrop.dataset.activeSlide=number;
    let next=(current+1)%slides.length;
    for(let offset=1;offset<slides.length&&failed[next];offset++)next=(next+1)%slides.length;
    const state=!initialized?'正在加载背景':!ready[next]?'正在加载下一张':'每 2 秒切换';
    status.textContent='背景 '+number+' / 06 · '+(paused()?'已暂停':state);
    if(reduced.matches&&!allowReduced)status.textContent+='（系统减少动态效果）';
    play.textContent=paused()?'▶':'Ⅱ';
    play.setAttribute('aria-label',paused()?'播放背景轮播':'暂停背景轮播');
    play.setAttribute('aria-pressed',String(paused()));
  }

  function schedule(){
    clearTimeout(timer);timer=0;update();
    if(running())timer=setTimeout(advance,CONFIG.intervalMs);
  }
  function select(index){
    slides[current].classList.remove('is-active');
    current=index;slides[current].classList.add('is-active');
    update();
  }
  function step(direction){
    // Keep the current image while the next one is loading; skip failed files.
    for(let offset=1;offset<slides.length;offset++){
      const next=(current+direction*offset+slides.length)%slides.length;
      if(failed[next])continue;
      if(ready[next])select(next);
      break;
    }
  }
  function advance(){timer=0;if(!running())return;step(1);schedule();}
  function synchronize(){
    backdrop.hidden=controls.hidden=overview.hidden;
    const active=!overview.hidden;
    if(document.body.classList.contains('has-home-background')!==active)
      document.body.classList.toggle('has-home-background',active);
    schedule();
  }
  async function load(slide,index){
    try{
      if(slide.dataset.src){slide.src=slide.dataset.src;delete slide.dataset.src;}
      await slide.decode();ready[index]=true;
      if(!initialized&&(index===0||failed[0])){select(index);initialized=true;schedule();}
    }catch{failed[index]=true;}
    update();
  }
  // Prioritize the next photo so the first transition does not compete with all five.
  (async()=>{
    slides[1].fetchPriority='high';
    const next=load(slides[1],1);
    await load(slides[0],0);
    await next;
    if(!initialized&&ready[1]){select(1);initialized=true;schedule();}
    await Promise.allSettled(slides.slice(2).map((slide,index)=>{
      slide.fetchPriority='auto';
      return load(slide,index+2);
    }));
    backdrop.dataset.loaded=String(ready.filter(Boolean).length);
  })();
  document.getElementById('background-prev').onclick=()=>{step(-1);schedule();};
  document.getElementById('background-next').onclick=()=>{step(1);schedule();};
  play.onclick=()=>{
    if(paused()){
      userPaused=false;allowReduced=true;
      const global=document.getElementById('motion-toggle');
      if(!reduced.matches&&document.body.classList.contains('motion-disabled')&&global)global.click();
    }else userPaused=true;
    schedule();
  };
  new MutationObserver(synchronize).observe(overview,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  for(const dialog of document.querySelectorAll('dialog'))
    new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{allowReduced=false;schedule();});
  synchronize();
})();
