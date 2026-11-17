import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const books = {
  str8: { title: "STR8 · In the City", kind: "Dergi tasarımı", file: "str8.pdf", index: "01" },
  espas: { title: "ESPAS", kind: "Tipografik kitap", file: "espaş kitap tasarımı.pdf", index: "02" },
  megalofobi: { title: "Megalofobi", kind: "Görsel anlatı", file: "fobi-kitabı.pdf", index: "03" },
  "altmis-uc": { title: "Altmış Üç", kind: "Kitap tasarımı", file: "altmisuc.pdf", index: "04" },
};

const slug = location.pathname.split("/").filter(Boolean).at(-1);
const currentBook = books[slug] || books.str8;
const assetUrl = encodeURI(`/portfolio/pages/dergi-ve-kitap/${currentBook.file}`);
const $ = (selector) => document.querySelector(selector);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.title = `${currentBook.title} — Cemre Ceylan`;
$("#reader-title").textContent = currentBook.title;
$("#reader-kind").textContent = currentBook.kind;
$("#reader-index").textContent = currentBook.index;
$("#reader-pdf").href = assetUrl;

const reader = $("#reader");
const book = $("#reader-book");
const loader = $("#reader-loader");
let sheets = [];
let targetProgress = 0;
let displayProgress = 0;
let pageTotal = 0;
let spreadRatio = 2;

function layoutBook() {
  const isMobile = innerWidth <= 700;
  const maxWidth = innerWidth * (isMobile ? .96 : .9);
  const maxHeight = Math.max(1, innerHeight - (isMobile ? 175 : 190));
  const height = Math.min(maxHeight, maxWidth / spreadRatio);
  book.style.width = `${height * spreadRatio}px`;
  book.style.height = `${height}px`;
}

function makeFace(side, pageNumber) {
  const face = document.createElement("div");
  face.className = `reader-face reader-face-${side}${pageNumber ? "" : " is-blank"}`;
  if (pageNumber) {
    const canvas = document.createElement("canvas");
    canvas.dataset.page = String(pageNumber);
    face.append(canvas);
  }
  return face;
}

async function renderPage(pdf, canvas) {
  const page = await pdf.getPage(Number(canvas.dataset.page));
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(1.65, 820 / base.width) });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport }).promise;
  canvas.classList.add("is-ready");
}

async function renderQueue(pdf, canvases) {
  const queue = [...canvases];
  const worker = async () => {
    while (queue.length) {
      const canvas = queue.shift();
      await renderPage(pdf, canvas);
      if (canvas.dataset.page === "1") loader.classList.add("is-hidden");
    }
  };
  await Promise.all([worker(), worker()]);
}

async function setupReader() {
  try {
    const pdf = await pdfjs.getDocument(assetUrl).promise;
    pageTotal = pdf.numPages;
    const firstPage = await pdf.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1 });
    spreadRatio = (firstViewport.width * 2) / firstViewport.height;
    book.style.aspectRatio = String(spreadRatio);
    layoutBook();

    const sheetTotal = Math.ceil(pageTotal / 2);
    reader.style.setProperty("--turns", String(sheetTotal));
    sheets = Array.from({ length: sheetTotal }, (_, index) => {
      const sheet = document.createElement("div");
      const frontPage = index * 2 + 1;
      const backPage = frontPage + 1 <= pageTotal ? frontPage + 1 : null;
      sheet.className = "reader-sheet";
      sheet.setAttribute("aria-label", `Sayfa ${frontPage}${backPage ? ` ve ${backPage}` : ""}`);
      sheet.append(makeFace("front", frontPage), makeFace("back", backPage));
      book.append(sheet);
      return sheet;
    });

    $("#reader-count").textContent = `01 / ${String(pageTotal).padStart(2, "0")}`;
    requestAnimationFrame(render);
    await renderQueue(pdf, [...book.querySelectorAll("canvas")]);
  } catch (error) {
    console.error(error);
    loader.innerHTML = `<strong>PDF açılamadı.</strong><a href="${assetUrl}" target="_blank" rel="noopener">PDF'i yeni sekmede aç ↗</a>`;
  }
}

function readScroll() {
  const rect = reader.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - innerHeight);
  targetProgress = clamp(-rect.top / scrollable);
}

function render() {
  displayProgress += (targetProgress - displayProgress) * (reducedMotion ? 1 : .14);
  if (Math.abs(targetProgress - displayProgress) < .0001) displayProgress = targetProgress;
  const journey = displayProgress * sheets.length;
  sheets.forEach((sheet, index) => {
    const turn = clamp(journey - index);
    const eased = reducedMotion ? (turn >= .5 ? 1 : 0) : turn * turn * (3 - 2 * turn);
    sheet.style.transform = `rotateY(${(-180 * eased).toFixed(3)}deg)`;
    sheet.style.zIndex = turn >= .999 ? index + 1 : sheets.length * 2 - index;
    sheet.style.setProperty("--turn-light", String(Math.sin(eased * Math.PI)));
  });
  const visiblePage = Math.min(pageTotal || 1, Math.max(1, Math.floor(journey) * 2 + 1));
  $("#reader-count").textContent = `${String(visiblePage).padStart(2, "0")} / ${String(pageTotal || 0).padStart(2, "0")}`;
  $("#reader-progress").style.transform = `scaleX(${displayProgress.toFixed(4)})`;
  requestAnimationFrame(render);
}

addEventListener("scroll", readScroll, { passive: true });
addEventListener("resize", () => {
  readScroll();
  layoutBook();
}, { passive: true });
document.addEventListener("keydown", (event) => {
  if (!sheets.length || !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
  event.preventDefault();
  const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
  const step = (reader.offsetHeight - innerHeight) / sheets.length;
  scrollBy({ top: direction * step, behavior: reducedMotion ? "auto" : "smooth" });
});

readScroll();
setupReader();
