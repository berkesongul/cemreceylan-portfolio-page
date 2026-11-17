import "./tubitak-page.js";

const assetRoot = "/portfolio/pages/tubitak-staji/tübitak için kitap/";
const groups = { a: 5, b: 5, c: 5, d: 5, e: 4 };
const tilts = [-1.6, 1.1, -0.7, 1.5, -1.1];
const gallery = document.querySelector("#clothesline-gallery");

Object.entries(groups).forEach(([letter, count], rowIndex) => {
  const row = document.createElement("article");
  row.className = `clothesline-row${letter === "e" ? " is-portrait" : ""}`;
  row.style.setProperty("--line-tilt", `${rowIndex % 2 ? -0.15 : 0.15}deg`);
  row.innerHTML = `<h2 class="clothesline-label"><strong>${letter.toUpperCase()}</strong> Tasarım Serisi</h2><div class="pinned-grid"></div>`;
  const grid = row.querySelector(".pinned-grid");

  for (let index = 1; index <= count; index += 1) {
    const figure = document.createElement("figure");
    figure.className = "pinned-work";
    figure.style.setProperty("--tilt", `${tilts[(index + rowIndex) % tilts.length]}deg`);
    const src = encodeURI(`${assetRoot}${letter}.${index}.png`);
    figure.innerHTML = `<img src="${src}" alt="${letter.toUpperCase()} tasarım serisi, çalışma ${index}" ${rowIndex > 0 ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" /><figcaption>${letter}.${String(index).padStart(2, "0")}</figcaption>`;
    grid.append(figure);
  }
  gallery.append(row);
});
