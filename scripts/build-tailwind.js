// Small script to build Tailwind CSS using PostCSS API so we don't rely on the CLI shim
import fs from 'fs';
import postcss from 'postcss';
import tailwindPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const inputPath = './app/tailwind.css';
const outPath = './public/assets/css/tailwind.css';

const input = fs.readFileSync(inputPath, 'utf8');

postcss([tailwindPostcss, autoprefixer])
  .process(input, { from: inputPath, to: outPath })
  .then((result) => {
    fs.mkdirSync('./public/assets/css', { recursive: true });
    fs.writeFileSync(outPath, result.css);
    if (result.map) fs.writeFileSync(outPath + '.map', result.map.toString());
    console.log('Wrote', outPath);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
