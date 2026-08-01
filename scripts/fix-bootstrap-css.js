const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules', 'bootstrap-dark-5', 'dist', 'css', 'bootstrap-dark.min.css');

try {
  let css = fs.readFileSync(file, 'utf8');
  const updated = css.replace(/(?<![-\w])color-adjust(?=\s*:)/g, 'print-color-adjust');
  if (updated !== css) {
    fs.writeFileSync(file, updated);
    console.log('Patched bootstrap-dark-5: color-adjust -> print-color-adjust');
  }
} catch (err) {
  console.warn('Skipping bootstrap-dark-5 CSS patch:', err.message);
}
