const assets = [
  { file: "Slide 16_9 - 43.png", title: "Marka kimliği çalışması 01" },
  { file: "Slide 16_9 - 44.png", title: "Marka kimliği çalışması 02" },
  { file: "Slide 16_9 - 45.png", title: "Marka kimliği çalışması 03" },
  { file: "Slide 16_9 - 46.png", title: "Marka kimliği çalışması 04" },
  { file: "Slide 16_9 - 47.png", title: "Marka kimliği çalışması 05" },
  { file: "Frame 427318251.png", title: "Marka kimliği çalışması 06" },
].map((asset) => ({ ...asset, src: encodeURI(`/portfolio/pages/marka-kimligi/${asset.file}`) }));

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateClock = () => {
  $("#clock").textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
};
updateClock();
setInterval(updateClock, 30_000);

const track = $("#brand-track");
track.replaceChildren(...assets.map((asset, index) => {
  const figure = document.createElement("figure");
  figure.className = "character-print";
  figure.innerHTML = `<span class="character-peg" aria-hidden="true"></span><button class="character-paper" type="button" aria-label="${asset.title} görselini büyüt"><img src="${asset.src}" alt="${asset.title}" ${index < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" /></button>`;
  $("button", figure).addEventListener("click", () => openDialog(index));
  return figure;
}));

const world = $("#brand-world");
const prints = $$(".character-print").map((element, index) => ({
  element,
  angle: 0,
  velocity: 0,
  phase: index * 1.37 + .4,
  speed: .72 + (index % 3) * .13,
}));
let distance = 0;
let currentX = 0;
let previousX = 0;

function layout() {
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 92;
  const viewportHeight = innerHeight - headerHeight;
  const headHeight = $(".character-world-head").offsetHeight;
  const footerHeight = $(".character-progress").offsetHeight;
  const printHeight = Math.max(280, Math.min(innerWidth < 720 ? 430 : 540, viewportHeight - headHeight - footerHeight - 66));
  world.style.setProperty("--print-height", `${printHeight}px`);
  const lastPrint = prints.at(-1).element;
  const rightPadding = parseFloat(getComputedStyle(track).paddingRight) || 0;
  distance = Math.max(0, lastPrint.offsetLeft + lastPrint.offsetWidth + rightPadding - innerWidth);
  world.style.setProperty("--world-height", `${viewportHeight + distance * (innerWidth < 720 ? 1.12 : 1)}px`);
}

addEventListener("resize", layout, { passive: true });
document.fonts?.ready.then(layout);
Promise.all($$(".character-paper img").map((image) => image.decode?.().catch(() => undefined))).then(layout);
layout();

let previousTime = 0;
function animate(time) {
  const delta = Math.min(48, time - (previousTime || time)) / 16.67;
  previousTime = time;
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 92;
  const rect = world.getBoundingClientRect();
  const span = Math.max(1, rect.height - (innerHeight - headerHeight));
  const progress = Math.min(1, Math.max(0, (headerHeight - rect.top) / span));
  currentX = -progress * distance;
  const scrollVelocity = (currentX - previousX) / Math.max(delta, .5);
  previousX = currentX;
  track.style.transform = `translate3d(${currentX.toFixed(1)}px,0,0)`;
  $("#brand-progress-bar").style.transform = `scaleX(${progress.toFixed(4)})`;
  const isVisible = rect.top < innerHeight && rect.bottom > headerHeight;
  if (isVisible && !reducedMotion) {
    prints.forEach((print) => {
      const idle = Math.sin(time / 1000 * print.speed + print.phase) * 1.1;
      const target = Math.max(-11, Math.min(11, scrollVelocity * .55)) + idle;
      print.velocity += (target - print.angle) * .045 * delta;
      print.velocity *= Math.pow(.88, delta);
      print.angle += print.velocity * delta;
      print.element.style.setProperty("--angle", `${print.angle.toFixed(2)}deg`);
    });
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

const dialog = $(".character-dialog");
const dialogImage = $(".character-dialog-stage img");
let activeIndex = 0;

function renderDialog() {
  const asset = assets[activeIndex];
  dialogImage.src = asset.src;
  dialogImage.alt = asset.title;
  $("#dialog-count").textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(assets.length).padStart(2, "0")}`;
  $("#dialog-dots").innerHTML = assets.map((_, index) => `<i class="${index === activeIndex ? "is-active" : ""}"></i>`).join("");
}
function openDialog(index) {
  activeIndex = index;
  renderDialog();
  if (!dialog.open) dialog.showModal();
}
function moveDialog(direction) {
  activeIndex = (activeIndex + direction + assets.length) % assets.length;
  renderDialog();
}

$("#dialog-close").addEventListener("click", () => dialog.close());
$$('.character-dialog-nav button').forEach((button) => button.addEventListener("click", () => moveDialog(Number(button.dataset.direction))));
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") moveDialog(-1);
  if (event.key === "ArrowRight") moveDialog(1);
});
