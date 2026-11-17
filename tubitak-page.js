const clock = document.querySelector("#clock");
const year = document.querySelector("#year");

function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

updateClock();
setInterval(updateClock, 30_000);
if (year) year.textContent = new Date().getFullYear();
