type Route = 'dashboard' | 'clients' | 'reports';

const ROUTES: Record<Route, { title: string; body: string }> = {
  dashboard: {
    title: 'Dashboard',
    body: `
      <section class="cards">
        <article><h3>Active</h3><p>42</p></article>
        <article><h3>Pending</h3><p>7</p></article>
        <article><h3>Resolved</h3><p>128</p></article>
      </section>`,
  },
  clients: {
    title: 'Clients',
    body: `
      <table>
        <thead><tr><th>Name</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Alice</td><td>active</td></tr>
          <tr><td>Bob</td><td>inactive</td></tr>
          <tr><td>Carol</td><td>active</td></tr>
        </tbody>
      </table>`,
  },
  reports: {
    title: 'Reports',
    body: `<ul class="reports"><li>Q1 summary</li><li>Q2 summary</li><li>Q3 summary</li></ul>`,
  },
};

function render(route: Route) {
  const { title, body } = ROUTES[route];
  const main = document.getElementById('main')!;
  main.innerHTML = `<h2>${title}</h2>${body}`;
  document.querySelectorAll<HTMLAnchorElement>('#sidebar nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === route);
  });
}

function currentRoute(): Route {
  const hash = location.hash.replace(/^#\//, '') as Route;
  return hash in ROUTES ? hash : 'dashboard';
}

window.addEventListener('hashchange', () => render(currentRoute()));
document.getElementById('theme-toggle')!.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
});

render(currentRoute());