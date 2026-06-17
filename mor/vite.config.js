import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(root, 'index.html'),
        about: path.resolve(root, 'src/about.html'),
        menu: path.resolve(root, 'src/menu.html'),
        cakeJars: path.resolve(root, 'src/cake-jars.html'),
        order: path.resolve(root, 'src/order.html'),
        checkout: path.resolve(root, 'src/checkout.html'),
        paymentCallback: path.resolve(root, 'src/payment-callback.html'),
      },
    },
  },
  plugins: [
    {
      // Vite's bundler only processes <script type="module">; these pages use
      // classic <script src="..."> tags so cartManager/cartUI/etc. keep sharing
      // the same global scope as they do in dev. Vite leaves those references
      // untouched and never copies the files, so we copy them ourselves.
      // navigation.html/footer.html are fetched as raw HTML fragments at
      // runtime (not real pages), so they need to be copied verbatim too.
      name: 'copy-classic-scripts-and-fragments',
      async closeBundle() {
        const outDir = path.resolve(root, 'dist');
        await copyDir(path.resolve(root, 'src/javascript'), path.join(outDir, 'src/javascript'));
        await fs.copyFile(path.resolve(root, 'src/navigation.html'), path.join(outDir, 'src/navigation.html'));
        await fs.copyFile(path.resolve(root, 'src/footer.html'), path.join(outDir, 'src/footer.html'));
      },
    },
  ],
});
