const books = [
  { slug: "str8", title: "STR8", subtitle: "In the City · Dergi", image: "str8-buton.png" },
  { slug: "espas", title: "ESPAS", subtitle: "Tipografik kitap", image: "espas-buton.png" },
  { slug: "megalofobi", title: "Megalofobi", subtitle: "Görsel anlatı", image: "megalofobi-buton.png" },
  { slug: "altmis-uc", title: "Altmış Üç", subtitle: "Kitap tasarımı", image: "altmisuc-buton.png" },
];

const root = "/portfolio/pages/dergi-ve-kitap/";
const grid = document.querySelector("#book-grid");

grid.replaceChildren(...books.map((book, index) => {
  const link = document.createElement("a");
  link.className = "book-button";
  link.href = `/works/dergi-kitap/${book.slug}/`;
  link.setAttribute("aria-label", `${book.title} kitabını aç`);
  link.innerHTML = `
    <span class="book-button-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="book-button-art"><img src="${encodeURI(root + book.image)}" alt="" ${index < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} /></span>
    <span class="book-button-copy"><b>${book.title}</b><small>${book.subtitle}</small></span>
    <span class="book-button-arrow" aria-hidden="true">↗</span>`;
  return link;
}));

const updateClock = () => {
  document.querySelector("#clock").textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit",
  }).format(new Date());
};
updateClock();
setInterval(updateClock, 30_000);
document.querySelector("#year").textContent = new Date().getFullYear();
