// Static contour shadows reuse the existing paper-geometry layout pass.
// Four non-overlapping narrow SVG tiles bound the blur surface to the perimeter,
// not a full-height image/filter of the whole case study. No scroll listener,
// extra observer, timer, RAF, clones of media, or animation loop.
(() => {
  const NS='http://www.w3.org/2000/svg';
  const shell=document.querySelector('.site-shell');
  const scroller=document.querySelector('.project-scroller');
  const sheets=[...document.querySelectorAll('.page-panel-about,.work-section,.experience-section,.contact-panel,.project-sheet')];
  const roots=new Map();
  let serial=0;
  const svgNode=(name,attributes={})=>{
    const node=document.createElementNS(NS,name);
    for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));
    return node;
  };
  function contour(g,sheet) {
    const {width:w,height:h,depth:d,seams}=g;
    const points=[[0,0],[w,0]];
    for(const y of seams)points.push([w,y-d],[w-d,y],[w,y+d]);
    points.push([w,h],[0,h]);
    for(const y of [...seams].reverse())points.push([0,y+d],[d,y],[0,y-d]);
    let path=points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ')+'Z';
    // Home binding holes are real holes in the backing paper, too.
    if(!sheet.classList.contains('project-sheet')) {
      const style=getComputedStyle(sheet);
      const r=parseFloat(style.getPropertyValue('--binding-hole'))||0;
      const pitch=parseFloat(style.getPropertyValue('--binding-pitch'))||0;
      if(r>0&&pitch>0)for(let x=pitch/2;x<w;x+=pitch)
        path+=` M${x-r} ${r*3} a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 ${-2*r} 0Z`;
    }
    return path;
  }
  function paint(root,g,sheet) {
    const {width:w,height:h,depth}=g;
    const dy=w*15/1696, sigma=w*7.5/1696, pad=Math.ceil(dy+sigma*4);
    const band=Math.min(h/2,depth+pad);
    const tiles=[[-pad,-pad,w+pad*2,band+pad],[-pad,h-band,w+pad*2,band+pad],
      [-pad,band,band+pad,Math.max(0,h-band*2)],[w-band,band,band+pad,Math.max(0,h-band*2)]];
    const path=contour(g,sheet), fragment=document.createDocumentFragment();
    for(const [x,y,width,height] of tiles) {
      if(!height)continue;
      const id=`paper-shadow-${++serial}`;
      const svg=svgNode('svg',{'aria-hidden':'true',viewBox:`${x} ${y} ${width} ${height}`,preserveAspectRatio:'none'});
      Object.assign(svg.style,{left:`${x*g.scale}px`,top:`${y*g.scale}px`,width:`${width*g.scale}px`,height:`${height*g.scale}px`});
      const defs=svgNode('defs');
      const filter=svgNode('filter',{id,filterUnits:'userSpaceOnUse',x:x-pad,y:y-pad,width:width+pad*2,height:height+pad*2,'color-interpolation-filters':'sRGB'});
      filter.append(svgNode('feGaussianBlur',{in:'SourceAlpha',stdDeviation:sigma,result:'soft'}),
        svgNode('feOffset',{in:'soft',dy,result:'offset'}),svgNode('feFlood',{'flood-color':'black','flood-opacity':.25,result:'ink'}),
        svgNode('feComposite',{in:'ink',in2:'offset',operator:'in'}));
      defs.append(filter);svg.append(defs,svgNode('path',{d:path,fill:'black','fill-rule':'evenodd',filter:`url(#${id})`}));
      fragment.append(svg);
    }
    root.replaceChildren(fragment);
  }
  function sync() {
    // Read positions first; write afterwards, only when shared geometry changes.
    const shellRect=shell.getBoundingClientRect(), scrollerRect=scroller.getBoundingClientRect();
    const jobs=sheets.map(sheet=>{
      const g=sheet.paperGeometry;if(!g)return null;
      const detail=sheet.classList.contains('project-sheet');
      const rect=detail?sheet.getBoundingClientRect():null;
      return {sheet,g,detail,left:detail?rect.left-scrollerRect.left:g.pageLeft-shellRect.left-window.scrollX,
        top:detail?rect.top-scrollerRect.top+scroller.scrollTop:g.pageTop-shellRect.top-window.scrollY};
    }).filter(Boolean);
    for(const {sheet,g,detail,left,top} of jobs) {
      let record=roots.get(sheet);
      if(!record) {
        const root=document.createElement('div');root.className='paper-contour-shadow';root.setAttribute('aria-hidden','true');
        (detail?scroller:shell).prepend(root);record={root,signature:''};roots.set(sheet,record);
      }
      const signature=JSON.stringify([g.width,g.height,g.depth,g.seams,g.scale]);
      const {root}=record;
      if(signature!==record.signature){paint(root,g,sheet);record.signature=signature;}
      // Detail root clips only at the scrollable viewport's horizontal edges
      // and document bottom: shadow never increases the case's scroll height.
      Object.assign(root.style,{left:detail?'0':`${left}px`,top:`${top}px`,height:`${g.height*g.scale}px`});
      if(detail)for(const svg of root.children)svg.style.marginLeft=`${left}px`;
      root.dataset.paper=detail?'detail':sheet.matches('.page-panel-about')?'about':sheet.matches('.contact-panel')?'contact':sheet.className.split(' ')[0];
    }
  }
  document.addEventListener('portfolio:paper-geometry',sync);
  sync();
})();
