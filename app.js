'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const source = window.LAB_DATA || {projects:[]};
  const projects = Array.isArray(source.projects) ? source.projects : [];
  const previews = Array.isArray(source.projectTemplates) ? source.projectTemplates : [];
  const configuredCategories = Array.isArray(source.categories) ? source.categories : [];
  const categoryNames = [...new Set([...configuredCategories.map(c=>c.name), ...projects.map(p=>p.category), ...previews.map(p=>p.category)].filter(Boolean))];
  let tocObserver=null,currentProject=null,currentSectionIds=[];
  const dateFormat = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
  let category=categoryNames[0]||'';
  function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
  function url(value){if(typeof value!=='string')return null;try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
  function external(value,text,className){const href=url(value);if(!href)return null;const a=node('a',className,text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function internal(hash,text,className){const a=node('a',className,text);a.href=hash;return a;}
  function tags(values){const list=node('div','tags');(Array.isArray(values)?values:[]).forEach(v=>list.append(node('span','',v)));return list;}
  function imageUrl(value){
    if(typeof value!=='string'||!value.trim())return null;
    try{const parsed=new URL(value,location.href);return ['http:','https:'].includes(parsed.protocol)||(location.protocol==='file:'&&parsed.protocol==='file:')?parsed.href:null;}catch{return null;}
  }
  function makeImage(src,alt,className){const safe=imageUrl(src);if(!safe)return null;const img=node('img',className);img.src=safe;img.alt=alt||'';img.loading='lazy';img.decoding='async';return img;}
  function sectionBody(container,section){
    if(section.text)container.append(node('p','',section.text));
    if(Array.isArray(section.items)){const ul=node('ul');section.items.forEach(item=>ul.append(node('li','',item)));container.append(ul);}
    if(section.image){const figure=node('figure','article-figure'),img=makeImage(section.image,section.imageAlt||section.title||'项目配图');if(img){const a=node('a');a.href=img.src;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','打开原图：'+img.alt);a.append(img);figure.append(a);if(section.caption)figure.append(node('figcaption','',section.caption));container.append(figure);}}
    if(section.table&&Array.isArray(section.table.columns)&&Array.isArray(section.table.rows)){const wrap=node('div','article-table-wrap'),table=node('table'),head=node('thead'),row=node('tr');section.table.columns.forEach(value=>{const th=node('th','',value);th.scope='col';row.append(th);});head.append(row);const body=node('tbody');section.table.rows.forEach(values=>{if(!Array.isArray(values))return;const tr=node('tr');section.table.columns.forEach((_,i)=>tr.append(node('td','',values[i]??'')));body.append(tr);});table.append(head,body);wrap.append(table);container.append(wrap);}
    if(section.code){const pre=node('pre'),code=node('code','',section.code);pre.append(code);container.append(pre);}
    if(Array.isArray(section.links)){const links=node('div','article-links');section.links.forEach(link=>{const a=external(link.url,link.label||'查看资料','text-link');if(a)links.append(a);});if(links.childElementCount)container.append(links);}
  }
  function isPreview(p){return previews.includes(p);}
  function cover(p){return p.cover||configuredCategories.find(c=>c.name===p.category)?.cover||'./assets/images/circuit.svg';}
  function minutes(p){if(Number.isFinite(p.readMinutes)&&p.readMinutes>0)return Math.ceil(p.readMinutes);const text=[p.title,p.summary,JSON.stringify(p.sections||[])].join('');return Math.max(1,Math.ceil(text.length/450));}
  function articleDate(p){const value=p.date||p.updated;if(!value)return '日期待填写';if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return '日期待填写';const d=new Date(value+'T00:00:00Z');return Number.isNaN(d.valueOf())?'日期待填写':dateFormat.format(d);}
  function projectCard(p){
    const card=node('article','project-card article-card'),href='#project/'+encodeURIComponent(p.id);
    const visual=internal(href,'','article-cover');visual.tabIndex=-1;visual.setAttribute('aria-hidden','true');const img=makeImage(cover(p),'');if(img)visual.append(img);if(isPreview(p))visual.append(node('span','preview-badge','框架预览'));
    const content=node('div','article-card-body');content.append(tags(p.tags));const title=node('h3');title.append(internal(href,p.title));content.append(title);const meta=node('div','article-card-meta');meta.append(node('span','',isPreview(p)?'框架 · 待填写':articleDate(p)),node('span','',`约 ${minutes(p)} 分钟`));content.append(meta);card.append(visual,content);return card;
  }
  function setCategory(value){category=value;renderProjects();}
  function renderCategoryCards(){
    const categories=configuredCategories.length?configuredCategories:categoryNames.map(name=>({name}));
    $('#project-categories').replaceChildren(...categories.map(c=>{
      const button=node('button','category-card'+(category===c.name?' selected':''));button.type='button';button.setAttribute('aria-pressed',String(category===c.name));
      const img=makeImage(c.cover||'./assets/images/circuit.svg','');if(img)button.append(img);const body=node('span','category-card-content'),icon=node('span','category-icon '+(c.accent==='amber'?'amber':''),c.icon||c.name.slice(0,1));const copy=node('span','category-card-copy');copy.append(node('strong','',c.name),node('span','',projects.filter(p=>p.category===c.name).length+' 篇记录'),node('small','',c.description||'项目实践与设计记录'));body.append(icon,copy,node('span','category-arrow','↗'));button.append(body);button.onclick=()=>{setCategory(c.name);};return button;
    }));
  }
  function renderProjects(){
    renderCategoryCards();
    $('#filters').replaceChildren(...categoryNames.map(name=>{const b=node('button',name===category?'selected':'',name);b.type='button';b.dataset.category=name;b.setAttribute('aria-pressed',String(name===category));b.onclick=()=>setCategory(name);return b;}));
    const query=$('#project-search').value.trim().toLocaleLowerCase();const usingPreviews=projects.length===0;
    const pool=usingPreviews?previews:projects;
    const filtered=pool.filter(p=>p.category===category&&[p.title,p.summary,...(p.tags||[])].join(' ').toLocaleLowerCase().includes(query));
    $('#project-grid').replaceChildren(...filtered.map(projectCard));$('#projects-empty').hidden=filtered.length>0;
    $('#projects-empty h2').textContent=query?'没有找到符合条件的记录':'这里还没有记录';
    $('#projects-empty p').textContent=query?'试试其他关键词，或切换专题。':'后续会在这里记录自己的设计与实践。';
    $('#preview-notice').hidden=!usingPreviews||!filtered.length;
    $('#archive-title').textContent=category?category+'专题':'项目记录';
    $('#archive-count').textContent=usingPreviews?`0 篇项目记录 · ${filtered.length} 份框架预览`:`${filtered.length} 篇记录`;
  }
  function clearToc(){if(tocObserver){tocObserver.disconnect();tocObserver=null;}currentSectionIds=[];}
  function renderDetail(id){
    clearToc();currentProject=id;
    const target=$('#project-detail'),p=projects.find(p=>p.id===id)||previews.find(p=>p.id===id);target.replaceChildren();
    if(!p){const empty=node('div','not-found');empty.append(node('h1','','暂时找不到这个项目'),internal('#projects','返回项目档案 ↗','button primary'));target.append(empty);return '项目未找到';}
    const head=node('header','detail-header article-header'),crumb=node('div','article-crumb');crumb.append(node('span','',p.category||'项目记录'),node('span','','/'),node('span','',isPreview(p)?'文章框架预览':p.status||'项目文章'));head.append(crumb,node('h1','',p.title));
    const meta=node('div','detail-meta');meta.append(node('span','',isPreview(p)?'框架预览 · 内容待填写':articleDate(p)),node('span','',`约 ${minutes(p)} 分钟`));head.append(meta,tags(p.tags));
    const layout=node('div','article-layout'),body=node('div','detail-body article-body'),aside=node('aside','article-toc');aside.setAttribute('aria-label','文章目录');
    if(isPreview(p))body.append(node('div','article-preview-note','这是可复用的文章框架，所有内容为填写提示与示意素材，不代表已完成的项目。'));
    if(p.summary)body.append(node('blockquote','article-summary',p.summary));
    const tocHeading=node('div','toc-heading');tocHeading.append(node('strong','','目录'),node('span','toc-progress-text','0%'));aside.append(tocHeading);const progress=node('div','toc-progress'),bar=node('span');progress.append(bar);aside.append(progress);const nav=node('nav','toc-links');nav.setAttribute('aria-label','文章章节');
    function appendSection(section,parent,indexPath,depth){
      const id='article-section-'+indexPath.join('-'),wrap=node('section',depth?'article-subsection':'detail-section');wrap.id=id;wrap.style.scrollMarginTop='25px';const title=node('h'+Math.min(6,2+depth),'',section.title||'未命名章节');wrap.append(title);sectionBody(wrap,section);
      const link=internal('#project/'+encodeURIComponent(p.id)+'/'+id,section.title||'未命名章节','toc-link');link.style.setProperty('--toc-depth',Math.min(depth,3));nav.append(link);currentSectionIds.push(id);
      if(Array.isArray(section.children))section.children.forEach((child,i)=>appendSection(child,wrap,[...indexPath,i+1],depth+1));parent.append(wrap);
    }
    (Array.isArray(p.sections)?p.sections:[]).forEach((section,i)=>appendSection(section,body,[i+1],0));
    if(!currentSectionIds.length){body.append(node('p','article-no-content','正文待补充。'));nav.append(node('p','toc-empty','暂时没有章节'));}
    aside.append(nav);
    const links=node('div','actions');[external(p.repository,'项目源码 ↗','button primary'),external(p.designUrl,'设计文件 ↗','button secondary')].filter(Boolean).forEach(a=>links.append(a));if(links.childElementCount)body.append(links);
    layout.append(body,aside);target.append(head,layout);
    const tocLinks=[...nav.querySelectorAll('a')];
    if(currentSectionIds.length){tocLinks[0].classList.add('active');tocLinks[0].setAttribute('aria-current','location');
      tocObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(!visible.length)return;const chosen=visible[0].target.id;tocLinks.forEach(a=>{const selected=a.hash.endsWith('/'+chosen);a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-5% 0px -65% 0px',threshold:0});currentSectionIds.forEach(id=>tocObserver.observe(document.getElementById(id)));}
    updateProgress();return p.title;
  }
  function updateProgress(){if($('#view-project').hidden)return;const layout=$('.article-layout');if(!layout)return;const rect=layout.getBoundingClientRect(),available=Math.max(1,rect.height-innerHeight*.6),progress=Math.max(0,Math.min(100,(-rect.top+innerHeight*.2)/available*100));const bar=$('.toc-progress>span'),text=$('.toc-progress-text');if(bar)bar.style.width=progress.toFixed(1)+'%';if(text)text.textContent=Math.round(progress)+'%';}
  window.addEventListener('scroll',updateProgress,{passive:true});
  $('#project-search').oninput=renderProjects;
  function navigate(){
    let parts;try{parts=location.hash.slice(1).split('/').map(decodeURIComponent);}catch{parts=['overview'];}
    let view=parts[0]||'overview';if(!['overview','projects','project','about'].includes(view))view='overview';
    const previousDetailVisible=!$('#view-project').hidden;
    $$('.view').forEach(v=>v.hidden=v.id!=='view-'+view);
    let title={overview:'嵌入式项目记录',projects:'项目档案',project:'项目详情',about:'关于'}[view];
    if(view==='project'){
      const id=parts[1]||'';
      if(currentProject!==id||!previousDetailVisible)title=renderDetail(id);else title=$('#project-detail h1')?.textContent||'项目详情';
    }else{clearToc();currentProject=null;}
    $$('.header nav a').forEach(a=>{const selected=a.hash==='#'+(view==='project'?'projects':view);a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=title+' · 曼波大王';
    const anchor=view==='project'&&currentSectionIds.includes(parts[2])?document.getElementById(parts[2]):null;
    if(anchor)requestAnimationFrame(()=>anchor.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));else window.scrollTo(0,0);
    updateProgress();
  }
  const contactDialog=$('#contact-dialog');
  const contacts={
    qq:{title:'添加 QQ 好友',instructions:'QQ：824869715 · 使用 QQ 扫一扫添加好友。',image:'./assets/images/qq-qr.png',alt:'QQ 824869715 的好友二维码'},
    wechat:{title:'添加微信好友',instructions:'使用微信扫一扫，添加我为好友。',image:'./assets/images/wechat-qr.png',alt:'微信好友二维码'}
  };
  let contactToastTimer;
  function contactStatus(message){
    $('#toast').textContent=message;$('#toast').hidden=false;
    clearTimeout(contactToastTimer);contactToastTimer=setTimeout(()=>$('#toast').hidden=true,4000);
  }
  $$('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.contact,contact=contacts[key];if(!contact)return;
    $('#contact-title').textContent=contact.title;
    $('#contact-instructions').textContent=contact.instructions;
    $('#contact-image-error').hidden=true;
    $('#contact-qr').src=contact.image;$('#contact-qr').alt=contact.alt;
    $('#copy-qq').hidden=key!=='qq';$('#open-qq').hidden=key!=='qq';
    $('#save-contact-qr').href=contact.image;$('#save-contact-qr').download=key+'-qr.png';
    if(!contactDialog.open)contactDialog.showModal();
  }));
  $('#contact-qr').addEventListener('error',()=>$('#contact-image-error').hidden=false);
  $('#contact-close').addEventListener('click',()=>contactDialog.close());
  contactDialog.addEventListener('click',event=>{
    if(event.target!==contactDialog)return;
    const rect=contactDialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)contactDialog.close();
  });
  $('#copy-qq').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText('824869715');contactStatus('QQ 号已复制：824869715');}
    catch{contactStatus('请长按或选中上方 QQ 号复制：824869715');}
  });
  window.addEventListener('hashchange',()=>{if(contactDialog.open)contactDialog.close();navigate();});renderProjects();navigate();
})();
