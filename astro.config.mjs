import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://chukfi.dev',
  integrations: [
    starlight({
      title: 'Chukfi CMS',
      description: 'Documentation for the Chukfi CMS platform — a high-performance, lightweight headless CMS built with Rust, Astro, and AWS.',

      customCss: [
        './src/styles/custom.css',
      ],
      social: [
        { label: 'GitHub', icon: 'github', href: 'https://github.com/smattera/chukfi-docs' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', link: '/guides/overview/' },
            { label: 'Quick Start', link: '/guides/quick-start/' },
            { label: 'Content Types', link: '/guides/content-types/' },
            { label: 'Media Library', link: '/guides/media/' },
            { label: 'Migration Guide', link: '/guides/migration/' },
            { label: 'Security & RBAC', link: '/guides/security/' },
            { label: 'CLI Reference', link: '/guides/cli/' },
          ],
        },
        {
          label: 'Architecture',
          items: [{ autogenerate: { directory: 'architecture' } }],
        },
        {
          label: 'Backend',
          items: [{ autogenerate: { directory: 'backend' } }],
        },
        {
          label: 'Frontend',
          items: [{ autogenerate: { directory: 'frontend' } }],
        },
        {
          label: 'Teams Bot',
          items: [
            { label: 'Overview', link: '/teams-bot/overview/' },
            { label: 'Setup Guide', link: '/teams-bot/setup/' },
            { label: 'Bedrock Integration', link: '/teams-bot/bedrock/' },
            { label: 'Deployment', link: '/teams-bot/deployment/' },
            { label: 'Development', link: '/teams-bot/development/' },
            { label: 'Model Agnostic', link: '/teams-bot/model-agnostic/' },
            { label: 'Cost Estimation', link: '/teams-bot/costs/' },
            { label: 'Demo Script', link: '/teams-bot/demo/' },
            { label: 'Troubleshooting', link: '/teams-bot/troubleshooting/' },
          ],
        },
        {
          label: 'Deployment',
          items: [{ autogenerate: { directory: 'deployment' } }],
        },
        {
          label: 'Project',
          items: [
            { label: 'Roadmap', link: '/project/roadmap/' },
            { label: 'Lessons Learned', link: '/project/lessons/' },
          ],
        },
      ],

    }),
  ],
});
