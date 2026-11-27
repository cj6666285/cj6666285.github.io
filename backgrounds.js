'use strict';
(() => {
  const CONFIG={intervalMs:5000};
  const backdrop=document.getElementById('home-backgrounds');
  const overview=document.getElementById('view-overview');
  if(!backdrop||!overview)return;
  const slides=[...backdrop.querySelectorAll('.background-slide')];
  if(!slides.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ready=slides.map(()=>false),failed=slides.map(()=>false);
  let current=0,timer=0,initialized=false;
  backdrop.dataset.activeSlide='1';
  const running=()=>initialized&&!overview.hidden&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-disabled')&&!document.querySelector('dialog[open]');

  function schedule(){
    clearTimeout(timer);timer=0;
    if(running())timer=setTimeout(advance,CONFIG.intervalMs);
  }
  function select(index){
    slides[current].classList.remove('is-active');
    current=index;slides[current].classList.add('is-active');
    if(backdrop.dataset.activeSlide!==String(current+1))backdrop.dataset.activeSlide=String(current+1);
  }
  function advance(){
    timer=0;if(!running())return;
    // Keep the current image while the next one is loading; skip failed files.
    for(let offset=1;offset<slides.length;offset++){
      const next=(current+offset)%slides.length;
      if(failed[next])continue;
      if(ready[next])select(next);
      break;
    }
    schedule();
  }
  function synchronize(){
    backdrop.hidden=overview.hidden;
    const active=!overview.hidden;
    if(document.body.classList.contains('has-home-background')!==active)
      document.body.classList.toggle('has-home-background',active);
    schedule();
  }
  async function load(slide,index){
    try{
      if(slide.dataset.src){slide.src=slide.dataset.src;delete slide.dataset.src;}
      await slide.decode();ready[index]=true;
      if(!initialized){select(index);initialized=true;schedule();}
    }catch{failed[index]=true;}
  }
  // Decode the first image before starting the clock, then preload all five.
  (async()=>{
    await load(slides[0],0);
    await Promise.allSettled(slides.slice(1).map((slide,index)=>load(slide,index+1)));
    backdrop.dataset.loaded=String(ready.filter(Boolean).length);
  })();
  new MutationObserver(synchronize).observe(overview,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  for(const dialog of document.querySelectorAll('dialog'))
    new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  synchronize();
})();
