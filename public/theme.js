(() => {
  const storageKey = "portfolio-theme";
  const root = document.documentElement;

  try {
    if (localStorage.getItem(storageKey) === "dark") {
      root.dataset.theme = "dark";
    }
  } catch {
    // The switch still works when browser storage is unavailable.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-switch");

    const syncSwitch = () => {
      toggle.setAttribute("aria-checked", String(root.dataset.theme === "dark"));
    };

    syncSwitch();
    toggle.addEventListener("click", () => {
      const theme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = theme;
      syncSwitch();

      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Keep the active theme for this page.
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === storageKey || event.key === null) {
        root.dataset.theme = event.newValue === "dark" ? "dark" : "light";
        syncSwitch();
      }
    });
  });
})();
