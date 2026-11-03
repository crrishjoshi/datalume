// Runs before first paint (loaded synchronously in <head>) so the saved theme
// applies without a flash. Kept out of index.html so the Content-Security-Policy
// can forbid inline scripts.
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem("cwyd-theme");
  } catch (e) {
    // Storage can be blocked (private mode, site data disabled); fall back to the OS preference.
  }
  var theme = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = theme;
})();
