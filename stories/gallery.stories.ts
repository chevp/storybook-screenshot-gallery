import type { Meta, StoryObj } from '@storybook/html';

/**
 * Screenshot gallery — renders PNGs produced by Playwright specs in
 * e2e/scenarios/*. PNGs are mounted via staticDirs (.storybook/main.ts)
 * under /scenarios/ and grouped by their two-digit prefix.
 */

interface Screenshot {
  group: string;
  name: string;
  label: string;
}

const ALL_SCREENSHOTS: Screenshot[] = [
  // 01 — Navigation
  { group: '01-navigation', name: '01a-sidebar-default', label: 'Sidebar (default)' },
  { group: '01-navigation', name: '01b-dark-mode', label: 'Dark mode' },
  { group: '01-navigation', name: '01c-light-mode', label: 'Light mode' },

  // 02 — Dashboard
  { group: '02-dashboard', name: '02a-dashboard', label: 'Dashboard' },

  // 03 — Clients
  { group: '03-clients', name: '03a-clients-list', label: 'Clients list' },

  // 04 — Reports
  { group: '04-reports', name: '04a-reports-list', label: 'Reports list' },
];

function groupBy(items: Screenshot[]): Record<string, Screenshot[]> {
  const out: Record<string, Screenshot[]> = {};
  for (const item of items) (out[item.group] ??= []).push(item);
  return out;
}

function renderGallery(screenshots: Screenshot[]): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  `;

  for (const [groupName, items] of Object.entries(groupBy(screenshots))) {
    const section = document.createElement('section');
    section.style.marginBottom = '48px';

    const heading = document.createElement('h2');
    heading.textContent = groupName;
    heading.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      color: #1f2937;
    `;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    `;

    for (const item of items) {
      const card = document.createElement('div');
      card.style.cssText = `
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;

      const img = document.createElement('img');
      // Resolve relative to document.baseURI so the gallery works under a
      // non-root deploy prefix (e.g. /my-gallery/). Absolute "/scenarios/…"
      // would escape the prefix and 404.
      img.src = new URL(`scenarios/${item.group}/${item.name}.png`, document.baseURI).href;
      img.alt = item.label;
      img.style.cssText = `
        width: 100%;
        height: auto;
        display: block;
        background: #f3f4f6;
        min-height: 200px;
      `;

      const caption = document.createElement('div');
      caption.style.cssText = `
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      `;
      const labelSpan = document.createElement('span');
      labelSpan.textContent = item.label;
      caption.appendChild(labelSpan);

      const codeSpan = document.createElement('code');
      codeSpan.textContent = `${item.name}.png`;
      codeSpan.style.cssText = `
        float: right;
        font-size: 11px;
        color: #9ca3af;
        font-family: 'SF Mono', Monaco, monospace;
      `;
      caption.appendChild(codeSpan);

      img.onerror = () => {
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Screenshot missing — run `npm run e2e:scenarios`';
        placeholder.style.cssText = `
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          font-style: italic;
          background: #f9fafb;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        card.insertBefore(placeholder, caption);
      };

      card.appendChild(img);
      card.appendChild(caption);
      grid.appendChild(card);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }

  return container;
}

const meta: Meta = { title: 'Gallery/Scenario Screenshots' };
export default meta;

export const AllScenarios: StoryObj = {
  render: () => renderGallery(ALL_SCREENSHOTS),
};

export const Navigation: StoryObj = {
  render: () => renderGallery(ALL_SCREENSHOTS.filter((s) => s.group === '01-navigation')),
};

export const Dashboard: StoryObj = {
  render: () => renderGallery(ALL_SCREENSHOTS.filter((s) => s.group === '02-dashboard')),
};

export const Clients: StoryObj = {
  render: () => renderGallery(ALL_SCREENSHOTS.filter((s) => s.group === '03-clients')),
};

export const Reports: StoryObj = {
  render: () => renderGallery(ALL_SCREENSHOTS.filter((s) => s.group === '04-reports')),
};