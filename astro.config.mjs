import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Chukfi Docs',
      description: 'Documentation for the Chukfi CMS platform — a high-performance, lightweight CMS built with Rust, Astro, and Cloudflare.',
      social: [
        { label: 'GitHub', icon: 'github', href: 'https://github.com/smattera/chukfi-docs' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', link: '/guides/overview/' },
            { label: 'Quick Start', link: '/guides/quick-start/' },
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
