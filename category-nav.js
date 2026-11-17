import { portfolioCategories } from "/portfolio-data.js";

const categoryNav = document.querySelector("#category-nav");

if (categoryNav) {
  const activeCategory = categoryNav.dataset.active;

  categoryNav.replaceChildren(...Object.entries(portfolioCategories).map(([key, category]) => {
    const link = document.createElement("a");
    link.href = category.path;
    link.textContent = category.title;

    if (key === activeCategory) {
      link.className = "is-active";
      link.setAttribute("aria-current", "page");
    }

    return link;
  }));

  requestAnimationFrame(() => {
    const activeLink = categoryNav.querySelector(".is-active");
    if (!activeLink) return;

    categoryNav.scrollLeft = activeLink.offsetLeft
      - (categoryNav.clientWidth - activeLink.clientWidth) / 2;
  });
}
