document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
if (menu && nav) {
  menu.hidden = false;
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      menu.focus();
    }
  });
}
const search = document.querySelector('[data-search]');
if (search) {
  search.hidden = false;
  const field = search.querySelector('input');
  const status = search.querySelector('[data-results]');
  const items = [...document.querySelectorAll('[data-filter-item]')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filter = () => {
    const query = normalize(field.value.trim());
    let count = 0;
    for (const item of items) {
      item.hidden = !normalize(item.textContent).includes(query);
      if (!item.hidden) count++;
    }
    status.textContent = count ? `${count} résultat${count > 1 ? 's' : ''}` : 'Aucun résultat. Essaie un autre terme.';
  };
  field.addEventListener('input', filter);
  filter();
}
