const root = "/portfolio/pages/tubitak-staji/";
const pages = [
  { file: "Frame 427318393.png", project: "Popüler Bilim Yayınları", kind: "Sosyal medya tasarımı", group: 1 },
  { file: "Frame 427318394.png", project: "Popüler Bilim Yayınları", kind: "Sosyal medya serisi", group: 1 },
  { file: "Frame 427318395.png", project: "TÜBİTAK Mağaza", kind: "Ürün iletişimi", group: 2 },
  { file: "Frame 427318396.png", project: "TÜBİTAK Mağaza", kind: "Patch tasarımları", group: 2 },
  { file: "Frame 427318397.png", project: "KİBİ", kind: "İkon sistemi", group: 3 },
  { file: "Frame 427318398.png", project: "KİBİ", kind: "Karakter ve rozet tasarımı", group: 3 },
  { file: "Frame 427318399.png", project: "KİBİ", kind: "Kitap illüstrasyonları", group: 3 },
  { file: "Frame 427318400.png", project: "KİBİ", kind: "Uygulama arayüzü", group: 3 },
].map((page) => ({ ...page, src: encodeURI(root + page.file) }));

const $ = (selector, scope = document) => scope.querySelector(selector);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const updateClock = () => {
  $("#clock").textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
};

updateClock();
setInterval(updateClock, 30_000);
$("#year").textContent = new Date().getFullYear();
$("#page-total").textContent = String(pages.length).padStart(2, "0");

const book = $("#book");
const pageElements = pages.map((page, index) => {
  const figure = document.createElement("figure");
  figure.className = "book-page";
  figure.style.zIndex = pages.length - index;
  figure.innerHTML = `<img src="${page.src}" alt="${page.project} — ${page.kind}" ${index < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false" /><span class="book-page-shade" aria-hidden="true"></span>`;
  book.append(figure);
  return figure;
});

const flipbook = $("#flipbook");
let targetProgress = 0;
let displayProgress = 0;
let lastActive = -1;

function readScroll() {
  const rect = flipbook.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - innerHeight);
  targetProgress = clamp(-rect.top / scrollable);
}

function render() {
  displayProgress += (targetProgress - displayProgress) * (reducedMotion ? 1 : 0.16);
  if (Math.abs(targetProgress - displayProgress) < 0.0001) displayProgress = targetProgress;

  const journey = displayProgress * (pages.length - 1);
  const active = Math.min(pages.length - 1, Math.floor(journey + 0.48));
  pageElements.forEach((element, index) => {
    if (reducedMotion) {
      element.classList.toggle("is-current", index === active);
      return;
    }
    const turn = clamp(journey - index);
    const eased = turn * turn * (3 - 2 * turn);
    element.style.transform = `rotateY(${(-179.6 * eased).toFixed(3)}deg)`;
    element.style.setProperty("--brightness", (1 - Math.sin(eased * Math.PI) * 0.42).toFixed(3));
    element.style.setProperty("--turn-shadow", (Math.sin(eased * Math.PI) * 0.72).toFixed(3));
    element.style.zIndex = turn >= 0.999 ? index + 1 : pages.length * 2 - index;
  });

  $("#progress-bar").style.transform = `scaleX(${displayProgress.toFixed(4)})`;
  if (active !== lastActive) {
    const page = pages[active];
    $("#page-current").textContent = String(active + 1).padStart(2, "0");
    $("#project-index").textContent = String(page.group).padStart(2, "0");
    $("#project-name").textContent = page.project;
    $("#project-kind").textContent = page.kind;
    lastActive = active;
  }
  requestAnimationFrame(render);
}

addEventListener("scroll", readScroll, { passive: true });
addEventListener("resize", readScroll, { passive: true });
readScroll();
requestAnimationFrame(render);

document.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
  const rect = flipbook.getBoundingClientRect();
  if (rect.top > innerHeight * 0.15 || rect.bottom < innerHeight * 0.85) return;
  event.preventDefault();
  const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
  const step = (flipbook.offsetHeight - innerHeight) / (pages.length - 1);
  scrollBy({ top: direction * step, behavior: reducedMotion ? "auto" : "smooth" });
});
