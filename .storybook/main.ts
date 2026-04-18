import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: '@storybook/html-vite',
  // Mount the Playwright screenshot output as a static dir so the gallery
  // story can reference the PNGs via <img src="/scenarios/…">.
  staticDirs: [
    { from: '../e2e/screenshots/scenarios', to: '/scenarios' },
  ],
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  features: {
    sidebarOnboardingChecklist: false,
  },
  // Project-pages deploys (e.g. GitHub Pages) live under /<repo>/ — pass that
  // prefix via STORYBOOK_BASE so assets and <base href> resolve correctly.
  // Root deploys (FTPS, user/org pages, custom domain) leave this unset.
  viteFinal: async (config) => {
    const base = process.env.STORYBOOK_BASE;
    if (base) config.base = base;
    return config;
  },
};

export default config;