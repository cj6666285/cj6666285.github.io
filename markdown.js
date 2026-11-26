'use strict';
(() => {
  const allowed=new Set('p br hr strong em del code pre blockquote ul ol li table thead tbody tr th td a img h1 h2 h3 h4 h5 h6'.split(' '));
  const discarded=new Set('script style iframe object embed svg math form input button textarea link meta base template'.split(' '));
  function safeUrl(value,base){
    try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}
  }
  function slug(value){return value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s+/g,'-');}
  function metadata(text){
    text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    const match=/^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
    if(!match)throw new Error('文章开头缺少 --- 配置信息');
    const meta={};
    for(const line of match[1].split('\n')){
      if(!line.trim()||line.trim().startsWith('#'))continue;
      const entry=/^([a-zA-Z][a-zA-Z0-9]*):\s*(.*?)\s*$/.exec(line);
      if(!entry)throw new Error('配置每行应为 字段名: 内容，标签使用 ["STM32", "C"]');
      let value=entry[2];
      if(/^["\[{]/.test(value)||/^(true|false|null|\d+)$/.test(value)){
        try{value=JSON.parse(value);}catch{throw new Error('配置格式有误：'+entry[1]);}
      }else if(value.startsWith("'")&&value.endsWith("'"))value=value.slice(1,-1).replace(/''/g,"'");
      meta[entry[1]]=value;
    }
    if(typeof meta.title!=='string'||!meta.title.trim())throw new Error('缺少 title 标题');
    if(typeof meta.category!=='string'||!meta.category.trim())throw new Error('缺少 category 分类');
    if(meta.tags!==undefined&&(!Array.isArray(meta.tags)||meta.tags.some(t=>typeof t!=='string')))throw new Error('tags 应为字符串数组');
    for(const field of ['preview','draft'])if(meta[field]!==undefined&&typeof meta[field]!=='boolean')throw new Error(field+' 应为 true 或 false');
    if(meta.date!==undefined&&!/^\d{4}-\d{2}-\d{2}$/.test(String(meta.date)))throw new Error('date 应为 YYYY-MM-DD');
    return {meta,body:text.slice(match[0].length)};
  }
  // Rebuild a small allowed set of Markdown elements; never insert source HTML.
  function cleanMarkdown(markdown,base){
    const parsed=new DOMParser().parseFromString(window.marked.parse(markdown,{gfm:true,breaks:false}),'text/html');
    function clean(source){
      if(source.nodeType===Node.TEXT_NODE)return document.createTextNode(source.textContent);
      if(source.nodeType!==Node.ELEMENT_NODE)return document.createDocumentFragment();
      const tag=source.tagName.toLowerCase();
      if(discarded.has(tag))return document.createDocumentFragment();
      if(!allowed.has(tag)){const fragment=document.createDocumentFragment();source.childNodes.forEach(child=>fragment.append(clean(child)));return fragment;}
      const element=document.createElement(tag);
      if(tag==='a'){
        const href=source.getAttribute('href')||'';
        if(href.startsWith('#'))element.dataset.mdAnchor=href.slice(1);
        else{const safe=safeUrl(href,base);if(safe){element.href=safe;element.target='_blank';element.rel='noopener noreferrer';}}
        if(source.title)element.title=source.title;
      }
      if(tag==='img'){
        const src=safeUrl(source.getAttribute('src')||'',base);
        if(!src)return document.createTextNode(source.alt||'');
        element.src=src;element.alt=source.alt||'';element.loading='lazy';element.decoding='async';
        if(source.title)element.title=source.title;
      }
      if(tag==='ol'&&/^\d+$/.test(source.getAttribute('start')||''))element.start=Number(source.getAttribute('start'));
      source.childNodes.forEach(child=>element.append(clean(child)));
      return element;
    }
    const fragment=document.createDocumentFragment();parsed.body.childNodes.forEach(child=>fragment.append(clean(child)));
    fragment.querySelectorAll('img').forEach(img=>{
      const link=document.createElement('a');link.href=img.src;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','打开原图：'+img.alt);
      img.replaceWith(link);link.append(img);link.className='markdown-image-link';
    });
    fragment.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='article-table-wrap';table.replaceWith(wrap);wrap.append(table);});
    return fragment;
  }
  function sections(fragment,title){
    const roots=[],stack=[],slugs=new Map();
    const first=fragment.firstElementChild;if(first?.tagName==='H1'&&first.textContent.trim()===title.trim())first.remove();
    let current=null;
    for(const child of [...fragment.childNodes]){
      if(child.nodeType===Node.TEXT_NODE&&!child.textContent.trim())continue;
      if(child.nodeType===Node.ELEMENT_NODE&&/^H[1-6]$/.test(child.tagName)){
        const level=Math.max(2,Number(child.tagName.slice(1))),name=child.textContent.trim(),key=slug(name),seen=slugs.get(key)||0;
        slugs.set(key,seen+1);
        current={title:name,anchor:key+(seen?'-'+seen:''),markdownNodes:document.createDocumentFragment(),children:[]};
        while(stack.length&&stack[stack.length-1].level>=level)stack.pop();
        (stack.length?stack[stack.length-1].section.children:roots).push(current);stack.push({level,section:current});
      }else{
        if(!current){current={title:'项目介绍',anchor:'项目介绍',markdownNodes:document.createDocumentFragment(),children:[]};roots.push(current);}
        current.markdownNodes.append(child);
      }
    }
    return roots;
  }
  async function get(url,json=false){
    const response=await fetch(url,{cache:'no-cache',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    return json?response.json():response.text();
  }
  async function load(){
    const manifestUrl=new URL('./projects/index.json',location.href);
    const files=await get(manifestUrl,true);
    if(!Array.isArray(files)||files.some(file=>typeof file!=='string'))throw new Error('projects/index.json 应为文章路径数组');
    const projects=[],previews=[],warnings=[],ids=new Set();
    const results=await Promise.allSettled(files.map(async file=>{
      const sourceUrl=new URL(file,manifestUrl);
      if(sourceUrl.origin!==manifestUrl.origin||!sourceUrl.pathname.startsWith(manifestUrl.pathname.replace(/index\.json$/,''))||!sourceUrl.pathname.endsWith('.md')||sourceUrl.search||sourceUrl.hash)throw new Error('文章路径必须位于 projects/ 文件夹内并以 .md 结尾');
      const {meta,body}=metadata(await get(sourceUrl));
      if(meta.draft===true)return null;
      const folder=decodeURIComponent(sourceUrl.pathname.split('/').slice(-2,-1)[0]);
      const id=meta.id||folder;
      if(typeof id!=='string'||!id||/[\/#?]/.test(id))throw new Error('项目 id 或文件夹名不合法');
      const p={id,title:meta.title.trim(),category:meta.category.trim(),summary:typeof meta.summary==='string'?meta.summary:'',tags:meta.tags||[],date:meta.date,status:meta.status,discipline:meta.discipline,preview:meta.preview===true,sourceUrl:sourceUrl.href};
      p.cover=meta.cover?safeUrl(meta.cover,sourceUrl):undefined;
      p.repository=meta.repository?safeUrl(meta.repository,sourceUrl):undefined;
      p.designUrl=meta.designUrl?safeUrl(meta.designUrl,sourceUrl):undefined;
      p.readMinutes=Math.max(1,Math.ceil(body.replace(/```[\s\S]*?```/g,'').length/450));
      p.sections=sections(cleanMarkdown(body,sourceUrl),p.title);
      return p;
    }));
    results.forEach((result,index)=>{
      if(result.status==='rejected'){warnings.push(files[index]+'：'+result.reason.message);return;}
      const p=result.value;if(!p)return;
      if(ids.has(p.id)){warnings.push(files[index]+'：项目 id 重复');return;}ids.add(p.id);
      (p.preview?previews:projects).push(p);
    });
    return {projects,previews,warnings};
  }
  window.LAB_MARKDOWN={load};
})();
