const root = "/portfolio/pages/dergi-ve-kitap/";
const pages = [
  { file: "Group 1458.png", project: "STR8 · In the City", kind: "Dergi tasarımı", group: 1, portrait: true },
  { file: "image 30.png", project: "STR8 · In the City", kind: "Editoryal sayfa", group: 1 },
  { file: "image 33.png", project: "STR8 · In the City", kind: "Editoryal sayfa", group: 1 },
  { file: "Group 1461.png", project: "Piyonun Düşüncesi", kind: "Kitap tasarımı", group: 2 },
  { file: "image 36.png", project: "Piyonun Düşüncesi", kind: "Kitap sayfası", group: 2 },
  { file: "image 37.png", project: "Piyonun Düşüncesi", kind: "Kitap sayfası", group: 2 },
  { file: "image 38.png", project: "Piyonun Düşüncesi", kind: "Kitap sayfası", group: 2 },
  { file: "Group 1462.png", project: "Megalofobi", kind: "Kitap tasarımı", group: 3 },
  { file: "image 67.png", project: "Megalofobi", kind: "Görsel anlatı", group: 3 },
  { file: "image 68.png", project: "Megalofobi", kind: "Görsel anlatı", group: 3 },
  { file: "image 69.png", project: "Megalofobi", kind: "Görsel anlatı", group: 3 },
  { file: "Group 1459.png", project: "ESPAS", kind: "Tipografik kitap", group: 4 },
  { file: "image 42.png", project: "ESPAS", kind: "Tipografik sayfa", group: 4 },
  { file: "image 43.png", project: "ESPAS", kind: "Tipografik sayfa", group: 4 },
  { file: "image 73.png", project: "ESPAS", kind: "Kapanış sayfası", group: 4 },
].map((page) => ({ ...page, src: encodeURI(root + page.file) }));
const $ = (selector, scope = document) => scope.querySelector(selector);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const updateClock = () => { $("#clock").textContent = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" }).format(new Date()); };
updateClock();setInterval(updateClock,30_000);$("#year").textContent=new Date().getFullYear();$("#page-total").textContent=String(pages.length).padStart(2,"0");
const book=$("#book");
const pageElements=pages.map((page,index)=>{const figure=document.createElement("figure");figure.className=`book-page${page.portrait?" is-portrait":""}`;figure.style.zIndex=pages.length-index;figure.innerHTML=`<img src="${page.src}" alt="${page.project} — ${page.kind}" ${index<2?'fetchpriority="high"':'loading="lazy"'} decoding="async" draggable="false" /><span class="book-page-shade" aria-hidden="true"></span>`;book.append(figure);return figure;});
const flipbook=$("#flipbook");let targetProgress=0;let displayProgress=0;let lastActive=-1;
function readScroll(){const rect=flipbook.getBoundingClientRect();const scrollable=Math.max(1,rect.height-innerHeight);targetProgress=clamp(-rect.top/scrollable);}
function render(){displayProgress+=(targetProgress-displayProgress)*(reducedMotion?1:.16);if(Math.abs(targetProgress-displayProgress)<.0001)displayProgress=targetProgress;const journey=displayProgress*(pages.length-1);const active=Math.min(pages.length-1,Math.floor(journey+.48));pageElements.forEach((element,index)=>{if(reducedMotion){element.classList.toggle("is-current",index===active);return;}const turn=clamp(journey-index);const eased=turn*turn*(3-2*turn);const angle=-179.6*eased;const brightness=1-Math.sin(eased*Math.PI)*.42;element.style.transform=`rotateY(${angle.toFixed(3)}deg)`;element.style.setProperty("--brightness",brightness.toFixed(3));element.style.setProperty("--turn-shadow",(Math.sin(eased*Math.PI)*.72).toFixed(3));element.style.zIndex=turn>=.999?index+1:pages.length*2-index;});$("#progress-bar").style.transform=`scaleX(${displayProgress.toFixed(4)})`;if(active!==lastActive){const page=pages[active];$("#page-current").textContent=String(active+1).padStart(2,"0");$("#project-index").textContent=String(page.group).padStart(2,"0");$("#project-name").textContent=page.project;$("#project-kind").textContent=page.kind;lastActive=active;}requestAnimationFrame(render);}
addEventListener("scroll",readScroll,{passive:true});addEventListener("resize",readScroll,{passive:true});readScroll();requestAnimationFrame(render);
document.addEventListener("keydown",(event)=>{if(!["ArrowDown","ArrowRight","ArrowUp","ArrowLeft"].includes(event.key))return;const rect=flipbook.getBoundingClientRect();if(rect.top>innerHeight*.15||rect.bottom<innerHeight*.85)return;event.preventDefault();const direction=["ArrowDown","ArrowRight"].includes(event.key)?1:-1;const step=(flipbook.offsetHeight-innerHeight)/(pages.length-1);scrollBy({top:direction*step,behavior:reducedMotion?"auto":"smooth"});});
