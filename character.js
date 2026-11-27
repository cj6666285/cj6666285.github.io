'use strict';
(() => {
  const backdrop=document.getElementById('home-character');
  const image=document.getElementById('character-source');
  const canvas=document.getElementById('character-gaze');
  const overview=document.getElementById('view-overview');
  if(!backdrop||!image||!canvas||!overview)return;
  const context=canvas.getContext('2d');
  if(!context)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mouse=matchMedia('(hover: hover) and (pointer: fine)');
  // Original image coordinates. Move the existing painted iris, fading the
  // displacement to zero at each eye's edge so eyelashes and face stay still.
  const EYES=[
    {cx:431,cy:281,rx:35,ry:39,rotation:-.20,maxX:6,maxY:4},
    {cx:652,cy:197,rx:47,ry:40,rotation:-.24,maxX:7,maxY:4.5}
  ];
  let ready=false,frame=0,last=0,geometry=null;
  const pointer={x:0,y:0,active:false};
  let eyes=[];
  const enabled=()=>ready&&!overview.hidden&&!document.hidden&&mouse.matches&&!reduced.matches&&!document.body.classList.contains('motion-disabled')&&!document.querySelector('dialog[open]');

  function eyePatch(eye){
    const pad=9,x=Math.floor(eye.cx-eye.rx-pad),y=Math.floor(eye.cy-eye.ry-pad);
    const width=Math.ceil((eye.rx+pad)*2),height=Math.ceil((eye.ry+pad)*2);
    const source=context.getImageData(x,y,width,height);
    const output=context.createImageData(width,height);
    const weights=new Float32Array(width*height);
    const cos=Math.cos(eye.rotation),sin=Math.sin(eye.rotation);
    for(let py=0;py<height;py++)for(let px=0;px<width;px++){
      const dx=x+px-eye.cx,dy=y+py-eye.cy;
      const radius=Math.hypot((dx*cos+dy*sin)/eye.rx,(-dx*sin+dy*cos)/eye.ry);
      const t=Math.max(0,Math.min(1,(1-radius)/.70));
      weights[py*width+px]=t*t*(3-2*t);
    }
    return {...eye,x,y,width,height,source,output,weights,dx:0,dy:0};
  }

  function warp(eye){
    const {width,height,source,output,weights}=eye,src=source.data,dest=output.data;
    // Bilinear inverse sampling avoids doubled pupils and moving image cutouts.
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const pixel=y*width+x,weight=weights[pixel],out=pixel*4;
      const sx=Math.max(0,Math.min(width-1.001,x-eye.dx*weight));
      const sy=Math.max(0,Math.min(height-1.001,y-eye.dy*weight));
      const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
      const a=(iy*width+ix)*4,b=a+4,c=a+width*4,d=c+4;
      for(let channel=0;channel<3;channel++)dest[out+channel]=
        src[a+channel]*(1-fx)*(1-fy)+src[b+channel]*fx*(1-fy)+src[c+channel]*(1-fx)*fy+src[d+channel]*fx*fy;
      dest[out+3]=255;
    }
    context.putImageData(output,eye.x,eye.y);
  }

  function measure(){
    const bounds=canvas.getBoundingClientRect();
    const scale=Math.max(bounds.width/canvas.width,bounds.height/canvas.height);
    const mobile=innerWidth<=700;
    geometry={scale,left:bounds.left+(bounds.width-canvas.width*scale)*.5+(mobile?0:innerWidth*.14),top:bounds.top+(bounds.height-canvas.height*scale)*.5};
  }

  function draw(now){
    frame=0;if(!enabled())return;
    const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
    const ease=1-Math.exp(-dt*10);let moving=false;
    for(const eye of eyes){
      let tx=0,ty=0;
      if(pointer.active&&geometry){
        const centerX=geometry.left+eye.cx*geometry.scale,centerY=geometry.top+eye.cy*geometry.scale;
        const vx=(pointer.x-centerX)/Math.max(innerWidth*.28,220),vy=(pointer.y-centerY)/Math.max(innerHeight*.35,200);
        const distance=Math.hypot(vx,vy),normalizer=Math.max(1,distance);
        tx=vx/normalizer*eye.maxX;ty=vy/normalizer*eye.maxY;
      }
      eye.dx+=(tx-eye.dx)*ease;eye.dy+=(ty-eye.dy)*ease;
      if(Math.abs(tx-eye.dx)+Math.abs(ty-eye.dy)>.015)moving=true;
      else{eye.dx=tx;eye.dy=ty;}
      warp(eye);
    }
    if(moving)frame=requestAnimationFrame(draw);else last=0;
  }

  function schedule(){if(enabled()&&!frame){last=0;frame=requestAnimationFrame(draw);}}
  function reset(){
    if(frame)cancelAnimationFrame(frame);frame=0;last=0;
    if(!ready)return;
    for(const eye of eyes){eye.dx=eye.dy=0;context.putImageData(eye.source,eye.x,eye.y);}
  }
  function synchronize(){
    backdrop.hidden=overview.hidden;
    document.body.classList.toggle('has-character-background',!overview.hidden);
    measure();if(enabled())schedule();else reset();
  }
  async function initialize(){
    try{
      await image.decode();
      canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      context.drawImage(image,0,0);eyes=EYES.map(eyePatch);ready=true;
      backdrop.classList.add('gaze-ready');synchronize();
    }catch{backdrop.classList.add('gaze-unavailable');}
  }
  window.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||!enabled())return;
    pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;schedule();
  },{passive:true});
  function leave(){pointer.active=false;schedule();}
  document.documentElement.addEventListener('pointerleave',leave);
  window.addEventListener('blur',leave);
  window.addEventListener('resize',()=>{measure();schedule();},{passive:true});
  window.addEventListener('hashchange',()=>{pointer.active=false;synchronize();});
  document.addEventListener('visibilitychange',synchronize);
  reduced.addEventListener('change',synchronize);mouse.addEventListener('change',synchronize);
  new MutationObserver(synchronize).observe(document.body,{attributes:true,attributeFilter:['class']});
  for(const dialog of document.querySelectorAll('dialog'))new MutationObserver(synchronize).observe(dialog,{attributes:true,attributeFilter:['open']});
  synchronize();initialize();
})();
