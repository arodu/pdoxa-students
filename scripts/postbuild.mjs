import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');

if (!existsSync(dist)) {
    console.error('postbuild: dist/ not found — run vite build first.');
    process.exit(1);
}

copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
writeFileSync(resolve(dist, '.nojekyll'), '');

console.log('postbuild: wrote dist/404.html and dist/.nojekyll');
