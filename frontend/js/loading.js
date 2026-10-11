(() => {
  const main = document.querySelector('#main');
  const panel = main.querySelector('.app-loading');
  if (!panel) return;
  let slowTimer, failureTimer, observer;
  function finish() {
    clearTimeout(slowTimer); clearTimeout(failureTimer);
    observer?.disconnect(); main.removeAttribute('aria-busy');
  }
  function message(text) {
    const label = main.querySelector('.loading-message');
    if (label && !panel.classList.contains('loading-failed')) label.textContent = text;
  }
  function fail(text = 'La página está tardando demasiado en responder. Comprueba la conexión y vuelve a intentarlo.') {
    if (!panel.isConnected) return;
    finish(); panel.classList.add('loading-failed');
    panel.querySelector('.loading-title').textContent = 'No pudimos abrir la Cabaña';
    panel.querySelector('.loading-message').textContent = text;
    panel.querySelector('.loading-track').hidden = true;
    panel.querySelector('.loading-retry').hidden = false;
  }
  panel.querySelector('.loading-retry').addEventListener('click', () => location.reload());
  main.setAttribute('aria-busy', 'true');
  slowTimer = setTimeout(() => message('Está tardando un poco. Seguimos preparando tus historias…'), 6000);
  failureTimer = setTimeout(() => fail(), 30000);
  observer = new MutationObserver(() => { if (!panel.isConnected) finish(); });
  observer.observe(main, {childList:true});
  window.CabanaLoading = Object.freeze({message, fail, finish});
})();
