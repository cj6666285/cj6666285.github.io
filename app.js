'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const source = window.LAB_DATA || {projects:[],logs:[]};
  const projects = Array.isArray(source.projects) ? source.projects : [];
  const logs = Array.isArray(source.logs) ? source.logs : [];
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
  function sectionBody(container,section){
    if(section.text)container.append(node('p','',section.text));
    if(Array.isArray(section.items)){const ul=node('ul');section.items.forEach(item=>ul.append(node('li','',item)));container.append(ul);}
    if(section.code){const pre=node('pre'),code=node('code','',section.code);pre.append(code);container.append(pre);}
  }
  function projectCard(p){const card=node('article','project-card'),top=node('div','project-top');top.append(node('span','type',p.category||'未分类'),node('span','status',p.status||'待整理'));const foot=node('div','project-foot');foot.append(node('span','',dateText(p.updated)),internal('#project/'+encodeURIComponent(p.id),'阅读项目 ↗'));card.append(top,node('h3','',p.title),node('p','',p.summary||''),tags(p.tags),foot);return card;}
  function renderProjects(){
    const query=$('#project-search').value.trim().toLocaleLowerCase();
    const filtered=projects.filter(p=>(category==='全部'||p.category===category)&&[p.title,p.summary,...(p.tags||[])].join(' ').toLocaleLowerCase().includes(query));
    $('#project-grid').replaceChildren(...filtered.map(projectCard));$('#projects-empty').hidden=filtered.length>0;
    $('#projects-empty h2').textContent=projects.length?'没有找到符合条件的项目':'项目的第一笔，留给你。';
    $('#projects-empty p').textContent=projects.length?'试试其他分类或关键词。':'框架已经就绪。准备好后，从软件或硬件模板开始记录。';
    $('#recent-projects').replaceChildren(...projects.slice(0,3).map(projectCard));$('#home-empty').hidden=projects.length>0;
    $('#count-projects').textContent=projects.length;$('#count-software').textContent=projects.filter(p=>['软件','软硬件'].includes(p.category)).length;$('#count-hardware').textContent=projects.filter(p=>['硬件','软硬件'].includes(p.category)).length;
  }
  function renderLogs(){
    $('#logs-empty').hidden=logs.length>0;$('#count-logs').textContent=logs.length;
    $('#logs-list').replaceChildren(...logs.map(log=>{const card=node('article','log-card'),time=node('time','log-date',dateText(log.date));if(/^\d{4}-\d{2}-\d{2}$/.test(log.date))time.dateTime=log.date;const body=node('div');body.append(tags(log.tags),node('h2','',log.title),node('p','',log.body||''));const project=projects.find(p=>p.id===log.projectId);if(project)body.append(internal('#project/'+encodeURIComponent(project.id),'关联项目：'+project.title+' ↗'));card.append(time,body);return card;}));
  }
  function renderDetail(id){
    const target=$('#project-detail'),p=projects.find(p=>p.id===id);target.replaceChildren();
    if(!p){const empty=node('div','not-found');empty.append(node('h1','','暂时找不到这个项目'),internal('#projects','返回项目档案 ↗','button primary'));target.append(empty);return '项目未找到';}
    const head=node('header','detail-header'),meta=node('div','detail-meta');meta.append(node('span','type',p.category||'未分类'),node('span','',p.status||'待整理'),node('time','',dateText(p.updated)));head.append(meta,node('h1','',p.title),node('p','',p.summary||''),tags(p.tags));const body=node('div','detail-body');
    (Array.isArray(p.sections)?p.sections:[]).forEach(s=>{const section=node('section','detail-section');section.append(node('h2','',s.title));sectionBody(section,s);body.append(section);});
    const links=node('div','actions');[external(p.repository,'项目源码 ↗','button primary'),external(p.designUrl,'设计文件 ↗','button secondary')].filter(Boolean).forEach(a=>links.append(a));if(links.childElementCount)body.append(links);target.append(head,body);return p.title;
  }
  function renderTemplate(key){currentTemplate=templates[key]?key:'software';const t=templates[currentTemplate];$('#template-name').textContent=t.name;$('#template-description').textContent=t.description;$$('[data-template]').forEach(b=>{const selected=b.dataset.template===currentTemplate;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});$('#template-sections').replaceChildren(...t.sections.map(([title,items],index)=>{const s=node('article','template-section'),h=node('h3');h.append(node('span','',String(index+1).padStart(2,'0')),document.createTextNode(title));const ul=node('ul');items.forEach(item=>ul.append(node('li','',item)));s.append(h,ul);return s;}));}
  function markdown(){const t=templates[currentTemplate];return '# '+t.name+'\n\n> 项目名称：\n> 日期：\n> 状态：\n\n'+t.sections.map(([title,items])=>'## '+title+'\n\n'+items.map(item=>'- '+item+'：').join('\n')).join('\n\n')+'\n';}
  function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
  function downloadTemplate(){const blob=new Blob([markdown()],{type:'text/markdown;charset=utf-8'}),href=URL.createObjectURL(blob),a=node('a');a.href=href;a.download=currentTemplate+'-template.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);}
  $('#copy-template').onclick=async()=>{try{await navigator.clipboard.writeText(markdown());toast('Markdown 模板已复制。');}catch{downloadTemplate();toast('浏览器未允许复制，已改为下载模板。');}};
  $('#download-template').onclick=downloadTemplate;
  $$('[data-template]').forEach(b=>b.onclick=()=>{location.hash='templates/'+b.dataset.template;});
  $$('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;$$('[data-category]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});renderProjects();});$('#project-search').oninput=renderProjects;
  function navigate(){let parts;try{parts=location.hash.slice(1).split('/').map(decodeURIComponent);}catch{parts=['overview'];}let view=parts[0]||'overview';if(!['overview','projects','project','logs','templates','about'].includes(view))view='overview';$$('.view').forEach(v=>v.hidden=v.id!=='view-'+view);let title={overview:'嵌入式项目记录',projects:'项目档案',project:'项目详情',logs:'开发日志',templates:'记录模板',about:'关于'}[view];if(view==='project')title=renderDetail(parts.slice(1).join('/'));if(view==='templates')renderTemplate(parts[1]);$$('nav a').forEach(a=>{const selected=a.hash==='#'+(view==='project'?'projects':view);a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});document.title=title+' · CJ LAB';window.scrollTo(0,0);}
  window.addEventListener('hashchange',navigate);renderProjects();renderLogs();navigate();
})();
