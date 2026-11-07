const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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

const menu = $(".menu");
const menuButton = $(".menu-button");
const setMenu = (open) => {
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
};
menuButton.addEventListener("click", () => setMenu(true));
$(".menu-close").addEventListener("click", () => setMenu(false));
$$('.menu a').forEach((link) => link.addEventListener("click", () => setMenu(false)));

const roleWords = ["deneyime", "hikâyeye", "sisteme", "etkiye"];
let roleIndex = 0;
setInterval(() => {
  roleIndex = (roleIndex + 1) % roleWords.length;
  $(".role-word").animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 450 });
  $(".role-word").textContent = roleWords[roleIndex];
}, 2600);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible"));
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => observer.observe(el));

const abilityCard = $(".ability-card");
$(".ability-button").addEventListener("click", () => {
  abilityCard.classList.add("is-open");
  abilityCard.setAttribute("aria-hidden", "false");
});
$(".ability-close").addEventListener("click", () => {
  abilityCard.classList.remove("is-open");
  abilityCard.setAttribute("aria-hidden", "true");
});

const doors = $$(".door");
const activateDoor = (door, index) => {
  doors.forEach((item) => item.classList.toggle("is-active", item === door));
  $(".door-caption > span").textContent = `${String(index + 1).padStart(2, "0")} / 07`;
  $(".door-caption h3").textContent = door.dataset.title;
  $(".door-caption p").textContent = door.dataset.copy;
};
doors.forEach((door, index) => {
  door.addEventListener("mouseenter", () => activateDoor(door, index));
  door.addEventListener("focus", () => activateDoor(door, index));
});

const story = $(".story");
const storyEntries = $$(".story-entry");
const storyYear = $(".story-year");
const storyPeriod = $(".story-period");
const storyCount = $(".story-counter b");
const storyBar = $(".story-counter em");
let activeStoryIndex = 0;

const updateStory = () => {
  if (!story) return;
  if (window.innerWidth <= 900) {
    activeStoryIndex = 0;
    storyEntries.forEach((entry, index) => entry.classList.toggle("is-active", index === 0));
    storyYear.textContent = storyEntries[0].dataset.year;
    storyPeriod.textContent = storyEntries[0].dataset.period;
    storyCount.textContent = "01";
    storyBar.style.width = `${100 / storyEntries.length}%`;
    return;
  }
  const rect = story.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
  const viewportTarget = window.innerHeight * 0.52;
  let closestIndex = 0;
  let closestDistance = Infinity;

  storyEntries.forEach((entry, index) => {
    const entryRect = entry.getBoundingClientRect();
    const distance = Math.abs(entryRect.top + entryRect.height / 2 - viewportTarget);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  story.style.setProperty("--story-progress", `${Math.max(2, progress * 100)}%`);
  story.style.setProperty("--story-marker", `${12 + progress * 76}%`);
  story.style.setProperty("--radar-angle", `${25 + progress * 620}deg`);
  $(".radar-ring-one").style.transform = `rotate(${progress * 105}deg)`;
  $(".radar-ring-two").style.transform = `rotate(${13 - progress * 150}deg)`;
  $(".radar-ring-three").style.transform = `rotate(${-8 + progress * 210}deg)`;

  if (closestIndex !== activeStoryIndex) {
    activeStoryIndex = closestIndex;
    storyEntries.forEach((entry, index) => entry.classList.toggle("is-active", index === activeStoryIndex));
    const activeEntry = storyEntries[activeStoryIndex];
    storyYear.textContent = activeEntry.dataset.year;
    storyPeriod.textContent = activeEntry.dataset.period;
    storyCount.textContent = String(activeStoryIndex + 1).padStart(2, "0");
    storyBar.style.width = `${((activeStoryIndex + 1) / storyEntries.length) * 100}%`;
    $(".counter-icon").style.transform = `rotate(${activeStoryIndex * 120}deg)`;
  }
};

let storyFrame;
window.addEventListener("scroll", () => {
  if (storyFrame) return;
  storyFrame = requestAnimationFrame(() => {
    updateStory();
    storyFrame = null;
  });
}, { passive: true });
window.addEventListener("resize", updateStory);
updateStory();

const dialog = $(".contact-dialog");
const form = $("#contactForm");
let selectedProject = "";
const showStep = (step) => {
  $$(".form-step", form).forEach((item) => item.classList.toggle("is-current", Number(item.dataset.step) === step));
  $(".step-count").textContent = `0${step}`;
  $(".form-progress i").style.width = `${step * 33.333}%`;
};
$$('.contact-open').forEach((button) => button.addEventListener("click", () => {
  showStep(1);
  dialog.showModal();
}));
$(".dialog-close").addEventListener("click", () => dialog.close());
$$('.choice-grid button').forEach((button) => button.addEventListener("click", () => {
  selectedProject = button.dataset.value;
  showStep(2);
}));
$(".form-next").addEventListener("click", () => {
  if (!form.reportValidity()) return;
  showStep(3);
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`${selectedProject || "Yeni proje"} hakkında`);
  const body = encodeURIComponent(`Merhaba Cemre,\n\nBen ${data.get("name")}.\n\n${data.get("message") || "Bir proje hakkında konuşmak istiyorum."}\n\nBana ${data.get("email")} adresinden ulaşabilirsin.`);
  window.location.href = `mailto:hello@cemreceylan.com?subject=${subject}&body=${body}`;
  dialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    abilityCard.classList.remove("is-open");
  }
});
