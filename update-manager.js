(() => {
  const CHECK_INTERVAL = 5 * 60 * 1000;
  const currentVersion = document.documentElement.dataset.appVersion || '0.0.0';
  const currentBuild = document.documentElement.dataset.buildId || currentVersion;
  let reloading = false;

  async function activateAndReload() {
    if (reloading) return;
    reloading = true;
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          const worker = reg.waiting || reg.installing;
          if (worker) worker.postMessage({type:'SKIP_WAITING'});
        }
      }
      const url = new URL(location.href);
      url.searchParams.set('update', Date.now());
      location.replace(url.toString());
    } catch (_) { location.reload(); }
  }

  async function check() {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {cache:'no-store', headers:{'Cache-Control':'no-cache'}});
      if (!res.ok) return;
      const info = await res.json();
      const remoteBuild = String(info.build || info.version || '');
      if (remoteBuild && remoteBuild !== String(currentBuild)) await activateAndReload();
    } catch (_) {}
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloading) location.reload(); });
  }
  window.addEventListener('load', () => { setTimeout(check, 1000); setInterval(check, CHECK_INTERVAL); });
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
