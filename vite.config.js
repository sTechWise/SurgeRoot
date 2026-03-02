import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        howWeWork: resolve(__dirname, 'how-we-work.html'),
        brands: resolve(__dirname, 'brands.html'),
        portal: resolve(__dirname, 'portal.html'),
        resources: resolve(__dirname, 'resources.html'),
        contact: resolve(__dirname, 'contact.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogPost1: resolve(__dirname, 'blog/why-authorized-distribution-matters.html'),
        privacy: resolve(__dirname, 'legal/privacy.html'),
        terms: resolve(__dirname, 'legal/terms.html'),
        cookies: resolve(__dirname, 'legal/cookies.html'),
        accessibility: resolve(__dirname, 'legal/accessibility.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
