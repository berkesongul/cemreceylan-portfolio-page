import { portfolioCategories } from "/portfolio-data.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const categoryNav = $("#category-nav");
categoryNav.replaceChildren(...Object.entries(portfolioCategories).map(([key, item]) => {
  const link = document.createElement("a");
  link.href = item.path;
  link.textContent = item.title;
  if (key === "web") link.className = "is-active";
  return link;
}));

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

const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
}, { threshold: 0.22, rootMargin: "0px 0px -8%" });

$$('.web-project').forEach((project) => projectObserver.observe(project));
