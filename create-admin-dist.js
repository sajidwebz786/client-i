import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const adminDir = path.join(distDir, 'admin');

if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

const assetsDir = path.join(distDir, 'assets');
const allFiles = fs.readdirSync(assetsDir);
const jsFiles = allFiles.filter(f => f.endsWith('.js'));
const cssFiles = allFiles.filter(f => f.endsWith('.css'));

const mainJs = jsFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
const mainCss = cssFiles.find(f => f.startsWith('index-') && f.endsWith('.css'));

const adminHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Luminate Ads Promotion Network</title>
    ${mainJs ? `<script type="module" crossorigin src="/assets/${mainJs}"></script>` : ''}
    ${mainCss ? `<link rel="stylesheet" crossorigin href="/assets/${mainCss}">` : ''}
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml);

const mainHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule . /index.html [L]
</IfModule>`;

fs.writeFileSync(path.join(distDir, '.htaccess'), mainHtaccess);

const adminHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule . /index.html [L]
</IfModule>`;

fs.writeFileSync(path.join(adminDir, '.htaccess'), adminHtaccess);

console.log('Created admin/index.html and .htaccess files');