// Links and panels work without JavaScript. Enhance each group independently;
// the Watch controls are a website gallery, not in-app display settings.
const groups = [...document.querySelectorAll('[data-tabs]')].map(tablist => {
  const tabs = [...tablist.querySelectorAll('[data-tab]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panels.some(panel => !panel)) return null;
  const activate = (selected, moveFocus = false) => {
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === selected));
      tab.tabIndex = index === selected ? 0 : -1;
      panels[index].hidden = index !== selected;
    });
    if (moveFocus) tabs[selected].focus();
  };
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', event => { event.preventDefault(); activate(index); });
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); activate(next, true); }
      if (event.key === ' ') { event.preventDefault(); activate(index); }
    });
  });
  panels[0].parentElement.classList.add('enhanced');
  activate(0);
  return { tabs, panels, activate };
}).filter(Boolean);

// A link from outside a tab group must reveal every ancestor panel first.
// This also supports a reload or shared link to #watch / #watch-rest.
const reveal = target => {
  groups.forEach(({ panels, activate }) => {
    const index = panels.findIndex(panel => panel === target || panel.contains(target));
    if (index !== -1) activate(index);
  });
};
const hashTarget = hash => {
  try { return hash && document.getElementById(decodeURIComponent(hash.slice(1))); }
  catch { return null; }
};
document.querySelectorAll('a[href^="#"]:not([data-tab])').forEach(link => {
  link.addEventListener('click', () => {
    const target = hashTarget(link.hash);
    if (target) reveal(target);
  });
});
const revealHash = () => {
  const target = hashTarget(location.hash);
  if (target) { reveal(target); target.scrollIntoView(); }
};
window.addEventListener('hashchange', revealHash);
revealHash();
