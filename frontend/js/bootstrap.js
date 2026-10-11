(() => {
  const base = new URL('../', document.currentScript.src);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const liveServer = loopback && (/^55\d{2}$/.test(location.port) || base.pathname.endsWith('/frontend/'));
  if (location.protocol !== 'file:' && !liveServer) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = new URL('js/app.js?v=20261011-3', base).href;
    script.addEventListener('error', () => window.CabanaLoading?.fail('No se pudo cargar la página. Pulsa Reintentar para volver a abrirla.'), {once:true});
    document.body.append(script);
    return;
  }

  // Static previews have CSS and images; data and authentication need Java.
  const pageUrl = name => new URL(`pages/${name}.html`, base).href;
  const pages = [['inicio','Inicio'],['peliculas','Películas'],['series','Series'],['generos','Géneros'],['login','Iniciar sesión'],['registro','Registrarse'],['mi-lista','Mi lista'],['panel-control','Panel de control']];
  document.querySelector('#navigation').innerHTML = pages.map(([file, label]) => `<a class="nav-item" href="${pageUrl(file)}">${label}</a>`).join('');
  document.querySelector('.brand').href = pageUrl('inicio');
  document.querySelector('#mode-label').textContent = `${liveServer ? 'Live Server' : 'Vista local'} · Inicia Java para usar Cabaña`;
  const main = document.querySelector('#main');
  main.innerHTML = '<section class="page-heading"><span class="eyebrow">VISTA LOCAL</span><h1>Enciende la Cabaña</h1><p>El diseño ya está cargado. Para ver el catálogo, iniciar sesión y usar el CRUD, ejecuta <strong>Iniciar_Cabana.cmd</strong> desde la carpeta del proyecto con Java 21. Si eliges otro puerto, abre la dirección que indica el lanzador.</p><p>Después abre Cabaña desde el servidor:</p><a class="button primary" href="http://localhost:8081/pages/inicio.html">Abrir Cabaña en localhost:8081</a></section>';
  if (liveServer) {
    main.querySelector('.eyebrow').textContent = 'LIVE SERVER · VISTA DEL DISEÑO';
    const explanation = document.createElement('p');
    explanation.textContent = 'Live Server sirve los archivos HTML y CSS, pero no ejecuta la API Java. La aplicación completa se abre en localhost:8081.';
    main.querySelector('h1').after(explanation);
  }
  const template = document.querySelector('#auth-layout');
  if (template) {
    main.append(template.content.cloneNode(true));
    main.querySelector('form').addEventListener('submit', event => event.preventDefault());
    main.querySelector('button[type="submit"]').disabled = true;
    main.querySelector('#auth-error').textContent = 'Inicia Java y abre localhost:8081 para acceder a tu cuenta.';
  }
  document.querySelector('#search').disabled = true;
  const season = document.querySelector('#halloween-toggle');
  season.disabled = true;
  season.title = 'Inicia Cabaña para abrir el especial de Halloween';
  const menu = document.querySelector('#menu-toggle');
  menu.textContent = '☰';
  menu.addEventListener('click', () => {
    const open = document.querySelector('#sidebar').classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
})();
