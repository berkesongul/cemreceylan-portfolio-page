const assetRoot = "/portfolio/pages/tubitak-staji/tübitak stajındaki işler/";
const sources = Array.from({ length: 8 }, (_, index) => encodeURI(`${assetRoot}${index + 1}.png`));
const journey = document.querySelector("#spread-journey");
const book = document.querySelector("#spread-book");
const current = document.querySelector("#spread-current");
const progressBar = document.querySelector("#spread-progress");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const image = (page, priority = false) => `<img src="${sources[page - 1]}" alt="TÜBİTAK stajı çalışması, sayfa ${page}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false" />`;

book.insertAdjacentHTML("beforeend", `<div class="spread-half spread-left">${image(1, true)}</div>`);
book.insertAdjacentHTML("beforeend", `<div class="spread-half spread-right">${image(8)}</div>`);

const leaves = [
  { front: 2, back: 3 },
  { front: 4, back: 5 },
  { front: 6, back: 7 },
].map(({ front, back }, index) => {
  const leaf = document.createElement("div");
  leaf.className = "turning-leaf";
  leaf.style.zIndex = String(12 - index);
  leaf.innerHTML = `<div class="turning-leaf-face turning-leaf-front">${image(front, front === 2)}<i class="turning-leaf-shade"></i></div><div class="turning-leaf-face turning-leaf-back">${image(back)}<i class="turning-leaf-shade"></i></div>`;
  book.append(leaf);
  return leaf;
});

let target = 0;
let display = 0;
let lastSpread = -1;

function readScroll() {
  const rect = journey.getBoundingClientRect();
  target = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
}

function render() {
  display += (target - display) * (reducedMotion ? 1 : 0.14);
  if (Math.abs(target - display) < 0.0001) display = target;
  const travel = display * leaves.length;

  leaves.forEach((leaf, index) => {
    const amount = clamp(travel - index);
    const eased = amount * amount * (3 - 2 * amount);
    leaf.style.transform = `rotateY(${(-180 * eased).toFixed(2)}deg)`;
    leaf.style.setProperty("--leaf-shadow", (Math.sin(eased * Math.PI) * 0.62).toFixed(3));
    leaf.style.zIndex = amount >= 0.999 ? String(index + 1) : String(12 - index);
  });

  const spread = Math.min(3, Math.floor(travel + 0.5));
  if (spread !== lastSpread) {
    const left = spread * 2 + 1;
    current.textContent = `${String(left).padStart(2, "0")}–${String(left + 1).padStart(2, "0")}`;
    book.setAttribute("aria-label", `TÜBİTAK stajı kitabı, ${left} ve ${left + 1}. sayfalar`);
    lastSpread = spread;
  }
  progressBar.style.transform = `scaleX(${display.toFixed(4)})`;
  requestAnimationFrame(render);
}

addEventListener("scroll", readScroll, { passive: true });
addEventListener("resize", readScroll, { passive: true });
readScroll();
requestAnimationFrame(render);

document.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
  event.preventDefault();
  const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
  const step = (journey.offsetHeight - innerHeight) / leaves.length;
  scrollBy({ top: direction * step, behavior: reducedMotion ? "auto" : "smooth" });
});
