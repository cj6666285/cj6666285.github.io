'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const source = window.LAB_DATA || {projects:[],logs:[]};
  const projects = Array.isArray(source.projects) ? source.projects : [];
  const logs = Array.isArray(source.logs) ? source.logs : [];
  const previews = Array.isArray(source.projectTemplates) ? source.projectTemplates : [];
  const configuredCategories = Array.isArray(source.categories) ? source.categories : [];
  const categoryNames = [...new Set([...configuredCategories.map(c=>c.name), ...projects.map(p=>p.category), ...previews.map(p=>p.category)].filter(Boolean))];
  let tocObserver=null,currentProject=null,currentSectionIds=[];
  const dateFormat = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
  const templates = {
    software:{name:'嵌入式软件项目',description:'让需求、架构、实现和测试形成一条完整的线索。',sections:[
      ['项目概述',['项目目标与使用场景','核心功能、当前进度与预期结果']],
      ['开发环境',['MCU / 开发板、工具链和 SDK 版本','编译、烧录与调试步骤']],
      ['软件架构',['模块划分与调用关系','任务调度、状态机与数据流']],
      ['关键实现',['外设驱动与通信协议','关键代码、配置与设计理由']],
      ['测试与调试',['测试用例、预期结果与实际结果','日志、波形与异常处理']],
      ['问题与复盘',['遇到的问题、定位过程与解决方案','当前限制、下一步计划与源码链接']]
    ]},
    hardware:{name:'硬件设计项目',description:'从设计依据到实测结果，留下每一版电路的来龙去脉。',sections:[
      ['需求与约束',['功能、供电、接口与机械尺寸','工作环境、预算和关键指标']],
      ['方案与选型',['系统框图与关键器件','替代方案、选型依据与数据手册']],
      ['原理图设计',['电源、时钟、复位与调试接口','信号连接、保护措施与设计检查']],
      ['PCB 与制造',['板层、布局布线与关键规则','BOM、生产文件与版本说明']],
      ['上电与验证',['电源检查、上电顺序与测试点','实测数据、波形与功能验证']],
      ['问题与迭代',['焊接、噪声、信号完整性与可靠性问题','改板原因、版本差异与后续计划']]
    ]},
    debug:{name:'调试与复盘记录',description:'把“试了什么”写清楚，让下一次定位更有方向。',sections:[
      ['背景与现象',['关联项目、硬件版本与固件版本','操作步骤、异常表现与出现频率']],
      ['复现条件',['最小复现步骤、输入与环境','预期行为与实际行为']],
      ['分析与假设',['可能原因与判断依据','排查优先级与需要补充的证据']],
      ['实验与观测',['每次修改的变量、测试方法与工具','串口日志、示波器或逻辑分析仪的观测结果']],
      ['根因与修复',['根因证据、修复方案与代码或电路变更','修复后的回归测试与结果']],
      ['经验与后续',['可以复用的检查清单','未解决的问题与下一步验证计划']]
    ]}
  };
  let category='全部',currentTemplate='software',toastTimer;
  function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
  function url(value){if(typeof value!=='string')return null;try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
  function external(value,text,className){const href=url(value);if(!href)return null;const a=node('a',className,text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function internal(hash,text,className){const a=node('a',className,text);a.href=hash;return a;}
  function tags(values){const list=node('div','tags');(Array.isArray(values)?values:[]).forEach(v=>list.append(node('span','',v)));return list;}
  function dateText(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value:'日期待补充';}
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
    const visual=internal(href,'','article-cover');visual.tabIndex=-1;visual.setAttribute('aria-hidden','true');const img=makeImage(cover(p),'');if(img)visual.append(img);if(isPreview(p))visual.append(node('span','preview-badge','模板预览'));
    const content=node('div','article-card-body');content.append(tags(p.tags));const title=node('h3');title.append(internal(href,p.title));content.append(title);const meta=node('div','article-card-meta');meta.append(node('span','',isPreview(p)?'模板 · 待填写':articleDate(p)),node('span','',`约 ${minutes(p)} 分钟`));content.append(meta);card.append(visual,content);return card;
  }
  function setCategory(value){category=value;renderProjects();}
  function renderCategoryCards(){
    const categories=configuredCategories.length?configuredCategories:categoryNames.map(name=>({name}));
    $('#project-categories').replaceChildren(...categories.map(c=>{
      const button=node('button','category-card'+(category===c.name?' selected':''));button.type='button';button.setAttribute('aria-pressed',String(category===c.name));
      const img=makeImage(c.cover||'./assets/images/circuit.svg','');if(img)button.append(img);const body=node('span','category-card-content'),icon=node('span','category-icon '+(c.accent==='amber'?'amber':''),c.icon||c.name.slice(0,1));const copy=node('span','category-card-copy');copy.append(node('strong','',c.name),node('span','',projects.filter(p=>p.category===c.name).length+' 篇记录'),node('small','',c.description||'项目实践与设计记录'));body.append(icon,copy,node('span','category-arrow','↗'));button.append(body);button.onclick=()=>{setCategory(category===c.name?'全部':c.name);};return button;
    }));
  }
  function renderProjects(){
    renderCategoryCards();
    $('#filters').replaceChildren(...['全部',...categoryNames].map(name=>{const b=node('button',name===category?'selected':'',name);b.type='button';b.dataset.category=name;b.setAttribute('aria-pressed',String(name===category));b.onclick=()=>setCategory(name);return b;}));
    const query=$('#project-search').value.trim().toLocaleLowerCase();const usingPreviews=projects.length===0;
    const pool=usingPreviews?previews:projects;
    const filtered=pool.filter(p=>(category==='全部'||p.category===category)&&[p.title,p.summary,...(p.tags||[])].join(' ').toLocaleLowerCase().includes(query));
    $('#project-grid').replaceChildren(...filtered.map(projectCard));$('#projects-empty').hidden=filtered.length>0;
    $('#projects-empty h2').textContent=query?'没有找到符合条件的记录':'这里还没有记录';
    $('#projects-empty p').textContent=query?'试试其他关键词，或切换专题。':'从一份模板开始，留下自己的设计与实践。';
    $('#preview-notice').hidden=!usingPreviews||!filtered.length;
    $('#archive-title').textContent=category==='全部'?'全部记录':category+'专题';
    $('#archive-count').textContent=usingPreviews?`0 篇项目记录 · ${filtered.length} 份模板预览`:`${filtered.length} 篇记录`;
    $('#recent-projects').replaceChildren(...projects.slice(0,3).map(projectCard));$('#home-empty').hidden=projects.length>0;
    $('#count-projects').textContent=projects.length;
    $('#count-software').textContent=projects.filter(p=>['软件','软硬件'].includes(p.discipline||p.category)).length;
    $('#count-hardware').textContent=projects.filter(p=>['硬件','软硬件'].includes(p.discipline||p.category)).length;
  }
  function renderLogs(){
    $('#logs-empty').hidden=logs.length>0;$('#count-logs').textContent=logs.length;
    $('#logs-list').replaceChildren(...logs.map(log=>{const card=node('article','log-card'),time=node('time','log-date',dateText(log.date));if(/^\d{4}-\d{2}-\d{2}$/.test(log.date))time.dateTime=log.date;const body=node('div');body.append(tags(log.tags),node('h2','',log.title),node('p','',log.body||''));const project=projects.find(p=>p.id===log.projectId);if(project)body.append(internal('#project/'+encodeURIComponent(project.id),'关联项目：'+project.title+' ↗'));card.append(time,body);return card;}));
  }
  function clearToc(){if(tocObserver){tocObserver.disconnect();tocObserver=null;}currentSectionIds=[];}
  function renderDetail(id){
    clearToc();currentProject=id;
    const target=$('#project-detail'),p=projects.find(p=>p.id===id)||previews.find(p=>p.id===id);target.replaceChildren();
    if(!p){const empty=node('div','not-found');empty.append(node('h1','','暂时找不到这个项目'),internal('#projects','返回项目档案 ↗','button primary'));target.append(empty);return '项目未找到';}
    const head=node('header','detail-header article-header'),crumb=node('div','article-crumb');crumb.append(node('span','',p.category||'项目记录'),node('span','','/'),node('span','',isPreview(p)?'记录模板预览':p.status||'项目文章'));head.append(crumb,node('h1','',p.title));
    const meta=node('div','detail-meta');meta.append(node('span','',isPreview(p)?'模板预览 · 内容待填写':articleDate(p)),node('span','',`约 ${minutes(p)} 分钟`));head.append(meta,tags(p.tags));
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
  function renderTemplate(key){currentTemplate=templates[key]?key:'software';const t=templates[currentTemplate];$('#template-name').textContent=t.name;$('#template-description').textContent=t.description;$$('[data-template]').forEach(b=>{const selected=b.dataset.template===currentTemplate;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});$('#template-sections').replaceChildren(...t.sections.map(([title,items],index)=>{const s=node('article','template-section'),h=node('h3');h.append(node('span','',String(index+1).padStart(2,'0')),document.createTextNode(title));const ul=node('ul');items.forEach(item=>ul.append(node('li','',item)));s.append(h,ul);return s;}));}
  function markdown(){const t=templates[currentTemplate];return '# '+t.name+'\n\n> 项目名称：\n> 日期：\n> 状态：\n\n'+t.sections.map(([title,items])=>'## '+title+'\n\n'+items.map(item=>'- '+item+'：').join('\n')).join('\n\n')+'\n';}
  function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
  function downloadTemplate(){const blob=new Blob([markdown()],{type:'text/markdown;charset=utf-8'}),href=URL.createObjectURL(blob),a=node('a');a.href=href;a.download=currentTemplate+'-template.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);}
  $('#copy-template').onclick=async()=>{try{await navigator.clipboard.writeText(markdown());toast('Markdown 模板已复制。');}catch{downloadTemplate();toast('浏览器未允许复制，已改为下载模板。');}};
  $('#download-template').onclick=downloadTemplate;
  $$('[data-template]').forEach(b=>b.onclick=()=>{location.hash='templates/'+b.dataset.template;});
  $('#project-search').oninput=renderProjects;
  function navigate(){
    let parts;try{parts=location.hash.slice(1).split('/').map(decodeURIComponent);}catch{parts=['overview'];}
    let view=parts[0]||'overview';if(!['overview','projects','project','logs','templates','about'].includes(view))view='overview';
    const previousDetailVisible=!$('#view-project').hidden;
    $$('.view').forEach(v=>v.hidden=v.id!=='view-'+view);
    let title={overview:'嵌入式项目记录',projects:'项目档案',project:'项目详情',logs:'开发日志',templates:'记录模板',about:'关于'}[view];
    if(view==='project'){
      const id=parts[1]||'';
      if(currentProject!==id||!previousDetailVisible)title=renderDetail(id);else title=$('#project-detail h1')?.textContent||'项目详情';
    }else{clearToc();currentProject=null;}
    if(view==='templates')renderTemplate(parts[1]);
    $$('.header nav a').forEach(a=>{const selected=a.hash==='#'+(view==='project'?'projects':view);a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=title+' · CJ LAB';
    const anchor=view==='project'&&currentSectionIds.includes(parts[2])?document.getElementById(parts[2]):null;
    if(anchor)requestAnimationFrame(()=>anchor.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));else window.scrollTo(0,0);
    updateProgress();
  }
  window.addEventListener('hashchange',navigate);renderProjects();renderLogs();navigate();
})();
