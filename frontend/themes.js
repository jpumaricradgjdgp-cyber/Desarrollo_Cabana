(() => {
  const base = new URL('.', document.currentScript.src);
  const root = document.documentElement;
  const choices = [
    {value:'dark', label:'Azul noche'},
    {value:'light', label:'Claro'},
    {value:'halloween', label:'Halloween'}
  ];
  const button = document.querySelector('#theme-toggle');
  const icon = document.querySelector('#theme-icon');
  const picker = document.createElement('div');
  picker.className = 'theme-picker';
  button.before(picker);
  picker.append(button);
  button.type = 'button';
  button.setAttribute('aria-label', 'Elegir tema');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'theme-options');
  const label = document.createElement('span');
  label.className = 'theme-label';
  label.textContent = 'Temas';
  button.append(label);
  const menu = document.createElement('div');
  menu.id = 'theme-options';
  menu.className = 'theme-options';
  menu.hidden = true;
  menu.setAttribute('role', 'group');
  menu.setAttribute('aria-label', 'Elige tu ambiente');
  const heading = document.createElement('p');
  heading.className = 'theme-options-title';
  heading.textContent = 'Elige tu ambiente';
  menu.append(heading);
  for (const choice of choices) {
    const option = document.createElement('button');
    option.type = 'button';
    option.dataset.themeChoice = choice.value;
    option.setAttribute('aria-label', choice.label);
    const swatch = document.createElement('span');
    swatch.className = `theme-swatch theme-swatch-${choice.value}`;
    swatch.setAttribute('aria-hidden', 'true');
    option.append(swatch, document.createTextNode(choice.label));
    option.addEventListener('click', () => { close(); button.focus(); set(choice.value); });
    menu.append(option);
  }
  picker.append(menu);
  function close() { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  function sync() {
    const theme = root.dataset.theme;
    icon.src = new URL(`assets/${theme==='light'?'fire':'bonfire'}.png`, base).href;
    const current = choices.find(choice => choice.value===theme);
    button.title = `Tema actual: ${current.label}. Elegir tema`;
    menu.querySelectorAll('[data-theme-choice]').forEach(option => {
      option.setAttribute('aria-pressed', String(option.dataset.themeChoice===theme));
    });
    document.querySelector('meta[name="theme-color"]').content = theme==='light'?'#f3f7ff':theme==='halloween'?'#110d18':'#0b101b';
  }
  function set(theme, persist=true) {
    if (!choices.some(choice => choice.value===theme)) theme='dark';
    const previous = root.dataset.theme;
    root.dataset.theme = theme;
    if (persist) {
      try {
        if (theme==='halloween' && previous!=='halloween') localStorage.setItem('cabana-base-theme', previous==='light'?'light':'dark');
        localStorage.setItem('cabana-theme', theme);
      } catch {}
    }
    sync();
    if (previous!==theme) document.dispatchEvent(new CustomEvent('cabana:theme-change', {detail:{theme}}));
  }
  button.addEventListener('click', () => { menu.hidden=!menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', event => { if (!picker.contains(event.target)) close(); });
  picker.addEventListener('keydown', event => { if (event.key==='Escape') { close(); button.focus(); } });
  picker.addEventListener('focusout', event => { if (!picker.contains(event.relatedTarget)) close(); });
  window.addEventListener('storage', event => { if (event.key==='cabana-theme') set(event.newValue, false); });
  window.CabanaTheme = Object.freeze({set, sync});
  set(root.dataset.theme, false);
})();
