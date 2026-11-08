import { portfolioCategories } from "/portfolio-data.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const categoryNav = $("#category-nav");
categoryNav.replaceChildren(...Object.entries(portfolioCategories).map(([key, item]) => {
  const link = document.createElement("a");
  link.href = item.path;
  link.textContent = item.title;
  if (key === "uiux") link.className = "is-active";
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

const projects = $$(".app-project");
const progress = $(".uiux-progress");
const progressCount = $(".uiux-progress b");

const setActiveProject = (index) => {
  projects.forEach((project, projectIndex) => project.classList.toggle("is-active", projectIndex === index));
  progressCount.textContent = String(index + 1).padStart(2, "0");
  progress.style.setProperty("--stack-progress", `${((index + 1) / projects.length) * 100}%`);
};

let ticking = false;
const updateActiveProject = () => {
  const activationLine = window.innerHeight * 0.46;
  let activeIndex = 0;
  projects.forEach((project, index) => {
    if (project.getBoundingClientRect().top <= activationLine) activeIndex = index;
  });
  setActiveProject(activeIndex);
  ticking = false;
};

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateActiveProject);
}, { passive: true });
window.addEventListener("resize", updateActiveProject);
updateActiveProject();
