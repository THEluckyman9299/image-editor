const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const $ = id => document.getElementById(id);

let bg = null;
let images = [];
let selected = -1;
let drag = null;

const defaults = () => ({
  x: 0, y: 0, scale: 100, rotation: 0,
  opacity: 100, blur: 0, brightness: 100, saturation: 100,
  shadowEnabled: false, shadowColor: "#000000", shadowOpacity: 65,
  shadowBlur: 20, shadowSpread: 0, shadowX: 0, shadowY: 8,
  neonEnabled: false, neonColor: "#8b5cf6", neonWidth: 3, neonOpacity: 90,
  neonBlur: 18, neonLayers: 3, neonInside: true
});

function loadFile(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file), im=new Image();
    im.onload=()=>resolve({im,url});
    im.onerror=reject;
    im.src=url;
  });
}

$("bgInput").addEventListener("change", async e=>{
  if(!e.target.files[0]) return;
  bg = await loadFile(e.target.files[0]);
  draw();
});

$("imagesInput").addEventListener("change", async e=>{
  const files=[...e.target.files].slice(0,20-images.length);
  for(const file of files){
    const loaded=await loadFile(file);
    images.push({name:file.name, im:loaded.im, url:loaded.url, s:defaults()});
  }
  rebuildList();
  if(selected<0 && images.length) select(0);
  draw();
});

["canvasW","canvasH"].forEach(id=>$(id).addEventListener("input",()=>{
  canvas.width=Math.max(100,+$("canvasW").value||1025);
  canvas.height=Math.max(100,+$("canvasH").value||2160);
  draw();
}));

["cols","rows","gapX","gapY","marginX","marginY","marginBottom","fit","centerLast"].forEach(id=>{
  $(id).addEventListener("input",()=>{rebuildDefaultsForGrid();draw()});
});

function grid(){
  const cols=Math.max(1,+$("cols").value||3), rows=Math.max(1,+$("rows").value||6);
  const gx=Math.max(0,+$("gapX").value||0), gy=Math.max(0,+$("gapY").value||0);
  const mx=Math.max(0,+$("marginX").value||0), my=Math.max(0,+$("marginY").value||0), mb=Math.max(0,+$("marginBottom").value||0);
  const cellW=(canvas.width-2*mx-(cols-1)*gx)/cols;
  const cellH=(canvas.height-my-mb-(rows-1)*gy)/rows;
  return {cols,rows,gx,gy,mx,my,mb,cellW,cellH};
}

function rebuildDefaultsForGrid(){
  const g=grid();
  images.forEach((o,i)=>{
    if(!o.moved){
      const p=cellFor(i,g);
      o.s.x=p.x+g.cellW/2;
      o.s.y=p.y+g.cellH/2;
    }
  });
}

function cellFor(i,g=grid()){
  const row=Math.floor(i/g.cols), col=i%g.cols;
  const countInRow=Math.min(g.cols, Math.max(0,images.length-row*g.cols));
  let offset=0;
  if($("centerLast").checked && countInRow<g.cols) offset=(g.cols-countInRow)*(g.cellW+g.gx)/2;
  return {x:g.mx+col*(g.cellW+g.gx)+offset, y:g.my+row*(g.cellH+g.gy)};
}

function ensurePositions(){
  const g=grid();
  images.forEach((o,i)=>{
    if(o.s.x===0&&o.s.y===0){
      const p=cellFor(i,g);
      o.s.x=p.x+g.cellW/2;
      o.s.y=p.y+g.cellH/2;
    }
  });
}

function select(i){
  selected=i;
  document.querySelectorAll(".image-item").forEach((el,n)=>el.classList.toggle("selected",n===i));
  const ed=$("editor"), empty=$("noSelection");
  if(i<0||!images[i]){
    ed.hidden=true;
    empty.hidden=false;
    return;
  }
  ed.hidden=false;
  empty.hidden=true;
  $("editor").parentElement.parentElement.classList.add("open");
  syncUI();
}

function deselect(){
  drag=null;
  select(-1);
  draw();
}

function rebuildList(){
  const list=$("imageList");list.innerHTML="";
  images.forEach((o,i)=>{
    const d=document.createElement("div");
    d.className="image-item"+(i===selected?" selected":"");
    d.innerHTML=`<img src="${o.url}"><span>${i+1}. ${escapeHtml(o.name)}</span>`;
    d.onclick=()=>select(i);
    list.appendChild(d);
  });
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))
}

const fields={
  posX:"x",posY:"y",scale:"scale",rotation:"rotation",opacity:"opacity",blur:"blur",
  brightness:"brightness",saturation:"saturation",shadowEnabled:"shadowEnabled",
  shadowColor:"shadowColor",shadowOpacity:"shadowOpacity",shadowBlur:"shadowBlur",
  shadowSpread:"shadowSpread",shadowX:"shadowX",shadowY:"shadowY",
  neonEnabled:"neonEnabled",neonColor:"neonColor",neonWidth:"neonWidth",
  neonOpacity:"neonOpacity",neonBlur:"neonBlur",neonLayers:"neonLayers",neonInside:"neonInside"
};

Object.entries(fields).forEach(([id,key])=>{
  $(id).addEventListener("input",()=>{
    if(selected<0)return;
    const el=$(id);
    let v=el.type==="checkbox"?el.checked:
      (el.type==="number"||el.type==="range"?+el.value:el.value);
    images[selected].s[key]=v;
    if(["posX","posY","scale","rotation"].includes(id)) images[selected].moved=true;
    updateOutputs();
    draw();
  });
});

function syncUI(){
  const o=images[selected];if(!o)return;
  $("selectedName").textContent=`${selected+1}. ${o.name}`;
  Object.entries(fields).forEach(([id,key])=>{
    const el=$(id);
    if(el.type==="checkbox") el.checked=!!o.s[key];
    else el.value=o.s[key];
  });
  updateOutputs();
}

function updateOutputs(){
  $("opacityOut").textContent=$("opacity").value+"%";
  $("blurOut").textContent=$("blur").value+"px";
  $("brightnessOut").textContent=$("brightness").value+"%";
  $("saturationOut").textContent=$("saturation").value+"%";
  $("shadowOpacityOut").textContent=$("shadowOpacity").value+"%";
  $("neonOpacityOut").textContent=$("neonOpacity").value+"%";
}

$("deleteSelected").onclick=()=>{
  if(selected<0)return;
  URL.revokeObjectURL(images[selected].url);
  images.splice(selected,1);
  selected=Math.min(selected,images.length-1);
  rebuildList();
  select(selected);
  draw();
};

$("applyAll").onclick=()=>{
  if(selected<0)return;
  const source=JSON.parse(JSON.stringify(images[selected].s));
  images.forEach(o=>o.s={...o.s,...source});
  syncUI();
  draw();
};

$("resetBtn").onclick=()=>{
  if(!confirm("Reset the canvas, background and all images?"))return;
  images.forEach(o=>URL.revokeObjectURL(o.url));
  images=[];
  bg=null;
  selected=-1;
  $("bgInput").value="";
  $("imagesInput").value="";
  rebuildList();
  select(-1);
  draw();
};

$("deselectBtn").onclick=deselect;

/* ---------- Pointer/touch interaction ---------- */

canvas.addEventListener("pointerdown", e=>{
  e.preventDefault();
  const p=canvasPoint(e);
  const hit=hitTest(p.x,p.y);

  if(hit>=0){
    select(hit);
    canvas.setPointerCapture?.(e.pointerId);
    drag={
      pointerId:e.pointerId,
      i:hit,
      startX:p.x,
      startY:p.y,
      ox:images[hit].s.x,
      oy:images[hit].s.y
    };
  }else{
    deselect();
  }
});

canvas.addEventListener("pointermove", e=>{
  if(!drag || drag.pointerId!==e.pointerId)return;
  e.preventDefault();

  const p=canvasPoint(e);
  const o=images[drag.i];
  if(!o)return;

  o.s.x=drag.ox+(p.x-drag.startX);
  o.s.y=drag.oy+(p.y-drag.startY);
  o.moved=true;
  syncUI();
  draw();
});

function endPointer(e){
  if(drag && drag.pointerId===e.pointerId) drag=null;
}
canvas.addEventListener("pointerup",endPointer);
canvas.addEventListener("pointercancel",endPointer);
canvas.addEventListener("pointerleave",e=>{
  if(drag && drag.pointerId===e.pointerId && e.buttons===0) drag=null;
});

/* ---------- Wheel scaling for desktop ---------- */

canvas.addEventListener("wheel",e=>{
  const p=canvasPoint(e),hit=hitTest(p.x,p.y);
  if(hit>=0){
    e.preventDefault();
    select(hit);
    images[hit].s.scale=Math.max(
      1,
      Math.min(500,images[hit].s.scale*(e.deltaY<0?1.05:.95))
    );
    images[hit].moved=true;
    syncUI();
    draw();
  }
},{passive:false});

function canvasPoint(e){
  const r=canvas.getBoundingClientRect();
  return {
    x:(e.clientX-r.left)*canvas.width/r.width,
    y:(e.clientY-r.top)*canvas.height/r.height
  };
}

/*
  Returns the actual rendered rectangle for the image.

  Contain:
    - preserves the original image aspect ratio
    - border/shadow/hit-test use the real rendered width/height

  Cover:
    - fills the grid cell
    - the visible result is the cell, so effects use the cell dimensions
*/
function getRenderBox(o,i,g=grid()){
  const cell=cellFor(i,g);
  const s=o.s;
  const maxW=g.cellW*s.scale/100;
  const maxH=g.cellH*s.scale/100;
  const im=o.im;

  let w,h;

  if($("fit").value==="contain"){
    const scale=Math.min(maxW/im.width,maxH/im.height);
    w=im.width*scale;
    h=im.height*scale;
  }else{
    w=maxW;
    h=maxH;
  }

  return {
    x:s.x,
    y:s.y,
    w,
    h,
    cellX:cell.x,
    cellY:cell.y,
    maxW,
    maxH
  };
}

function hitTest(x,y){
  const g=grid();

  for(let i=images.length-1;i>=0;i--){
    const o=images[i], box=getRenderBox(o,i,g);
    const a=-(o.s.rotation*Math.PI/180);
    const dx=x-box.x,dy=y-box.y;
    const rx=dx*Math.cos(a)-dy*Math.sin(a);
    const ry=dx*Math.sin(a)+dy*Math.cos(a);

    if(Math.abs(rx)<=box.w/2 && Math.abs(ry)<=box.h/2) return i;
  }

  return -1;
}

function draw(showSelection=true){
  ensurePositions();

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(bg) drawBackground();
  else{
    ctx.fillStyle="#11151d";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  const g=grid();
  images.forEach((o,i)=>drawImage(o,i,g));

  if(showSelection && selected>=0 && images[selected]){
    drawSelection(selected,g);
  }
}

function drawBackground(){
  const im=bg.im;
  const scale=Math.max(canvas.width/im.width,canvas.height/im.height);
  const w=im.width*scale,h=im.height*scale;
  ctx.drawImage(im,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
}

function roundedPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawImage(o,i,g){
  const s=o.s;
  const im=o.im;
  const box=getRenderBox(o,i,g);
  const w=box.w,h=box.h;

  ctx.save();
  ctx.translate(s.x,s.y);
  ctx.rotate(s.rotation*Math.PI/180);
  ctx.globalAlpha=s.opacity/100;

  const filter=`blur(${s.blur}px) brightness(${s.brightness}%) saturate(${s.saturation}%)`;

  /*
    Effects are drawn from the SAME rendered dimensions as the image.
    This is the important fix for portrait/landscape images in Contain.
  */

  let drawW=w, drawH=h;
  let drawX=-w/2, drawY=-h/2;

  const drawActualImage = () => {
    ctx.filter=filter;
    ctx.drawImage(im,drawX,drawY,drawW,drawH);
    ctx.filter="none";
  };

  if($("fit").value==="cover"){
    // Cover needs clipping because the image itself extends beyond the cell.
    ctx.save();
    roundedPath(-w/2,-h/2,w,h,Math.min(8,w/10,h/10));
    ctx.clip();

    if(s.shadowEnabled){
      ctx.shadowColor=withAlpha(s.shadowColor,s.shadowOpacity/100);
      ctx.shadowBlur=s.shadowBlur;
      ctx.shadowOffsetX=s.shadowX;
      ctx.shadowOffsetY=s.shadowY;
    }

    const scale=Math.max(w/im.width,h/im.height);
    const iw=im.width*scale,ih=im.height*scale;
    ctx.filter=filter;
    ctx.drawImage(im,-iw/2,-ih/2,iw,ih);
    ctx.filter="none";
    ctx.restore();
  }else{
    // Contain: no square-cell clipping. Everything follows the true aspect ratio.
    if(s.shadowEnabled){
      ctx.shadowColor=withAlpha(s.shadowColor,s.shadowOpacity/100);
      ctx.shadowBlur=s.shadowBlur;
      ctx.shadowOffsetX=s.shadowX;
      ctx.shadowOffsetY=s.shadowY;
    }

    drawActualImage();
  }

  if(s.neonEnabled && s.neonWidth>0){
    const col=withAlpha(s.neonColor,s.neonOpacity/100);
    ctx.shadowOffsetX=0;
    ctx.shadowOffsetY=0;
    ctx.strokeStyle=col;

    const inset=s.neonInside ? s.neonWidth/2 : -s.neonWidth/2;
    const bw=Math.max(1,w-2*inset);
    const bh=Math.max(1,h-2*inset);
    const radius=Math.min(8,bw/10,bh/10);

    for(let n=0;n<s.neonLayers;n++){
      ctx.shadowColor=col;
      ctx.shadowBlur=s.neonBlur*(n+1)/s.neonLayers;
      ctx.lineWidth=s.neonWidth;
      roundedPath(-bw/2,-bh/2,bw,bh,radius);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawSelection(i,g){
  const o=images[i];
  const box=getRenderBox(o,i,g);

  ctx.save();
  ctx.translate(o.s.x,o.s.y);
  ctx.rotate(o.s.rotation*Math.PI/180);
  ctx.strokeStyle="#fff";
  ctx.setLineDash([8,6]);
  ctx.lineWidth=2;
  ctx.strokeRect(-box.w/2,-box.h/2,box.w,box.h);
  ctx.restore();
}

function withAlpha(hex,a){
  const h=hex.replace("#","");
  const r=parseInt(h.slice(0,2),16);
  const g=parseInt(h.slice(2,4),16);
  const b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- Clean export: selection UI is never exported ---------- */

$("exportBtn").onclick=()=>{
  draw(false);

  const a=document.createElement("a");
  a.download=`steam-grid-${canvas.width}x${canvas.height}.png`;
  a.href=canvas.toDataURL("image/png");
  a.click();

  // Put the editor selection back immediately after export.
  draw(true);
};

rebuildDefaultsForGrid();
draw();
