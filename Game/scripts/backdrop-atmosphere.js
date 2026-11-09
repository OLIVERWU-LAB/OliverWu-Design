// CSS owns motion. Visibility changes are events, not a timer/RAF loop.
(() => {
  const sync = () => document.documentElement.classList.toggle('backdrop-paused', document.hidden);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
