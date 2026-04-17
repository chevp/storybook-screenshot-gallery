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
};

export default config;