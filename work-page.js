import { itemsForCategory, portfolioCategories } from "/portfolio-data.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const categoryKey = document.body.dataset.category;
const category = portfolioCategories[categoryKey];
const items = itemsForCategory(categoryKey);

document.title = `${category.title} — Cemre Ceylan`;
document.documentElement.style.setProperty("--category-accent", category.accent);
$("#work-eyebrow").textContent = category.eyebrow;
$("#work-title").textContent = category.title;
$("#work-summary").textContent = category.summary;
$("#work-count").textContent = `${items.length} çalışma`;
$("#year").textContent = new Date().getFullYear();

const updateClock = () => {
  $("#clock").textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
};
updateClock();
setInterval(updateClock, 30_000);

const categoryNav = $("#category-nav");
categoryNav.replaceChildren(...Object.entries(portfolioCategories).map(([key, item]) => {
  const link = document.createElement("a");
  link.href = item.path;
  link.textContent = item.title;
  if (key === categoryKey) link.className = "is-active";
  return link;
}));

const grid = $("#work-grid");
grid.replaceChildren(...items.map((item, index) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "portfolio-card";
  card.style.setProperty("--card-index", index % 12);
  card.innerHTML = `<span class="portfolio-image"><img loading="lazy" decoding="async" /></span><span class="portfolio-meta"><b></b><small></small><i></i></span>`;
  const image = $("img", card);
  image.src = item.src;
  image.alt = `${item.project}, portfolyo sayfası ${item.page}`;
  $("b", card).textContent = item.project;
  $("small", card).textContent = category.title;
  $("i", card).textContent = String(item.page).padStart(3, "0");
  card.addEventListener("click", () => openWork(item));
  return card;
}));

const dialog = $(".work-dialog");
const dialogImage = $(".work-dialog-stage img");
let activeIndex = 0;

function openWork(item) {
  activeIndex = items.findIndex((candidate) => candidate.page === item.page);
  dialogImage.src = item.src;
  dialogImage.alt = `${item.project}, portfolyo sayfası ${item.page}`;
  $(".work-dialog-category").textContent = category.title;
  $(".work-dialog-title").textContent = item.project;
  $(".work-dialog-count").textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  if (!dialog.open) dialog.showModal();
}

const moveWork = (direction) => openWork(items[(activeIndex + direction + items.length) % items.length]);
$(".work-dialog-close").addEventListener("click", () => dialog.close());
$$('.work-dialog-nav button').forEach((button) => button.addEventListener("click", () => moveWork(Number(button.dataset.direction))));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") moveWork(-1);
  if (event.key === "ArrowRight") moveWork(1);
});
