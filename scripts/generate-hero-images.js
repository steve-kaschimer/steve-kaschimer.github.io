#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const matter = require('gray-matter');

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const POSTS_DIR = path.join(process.cwd(), 'src/posts');
const IMAGES_DIR = path.join(process.cwd(), 'src/images/posts');

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env');
  process.exit(1);
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function generateImage(prompt, fileName) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      prompt,
      model: 'gpt-image-2',
      n: 1,
      size: '1024x1024',
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`OpenAI API error: ${res.statusCode} ${data}`));
        } else {
          try {
            const result = JSON.parse(data);
            resolve(result.data[0].url);
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
      } else {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      }
    }).on('error', reject);
  });
}

function createResponsiveVariants(sourceFile) {
  const baseName = path.basename(sourceFile, path.extname(sourceFile));
  const dir = path.dirname(sourceFile);

  const sizes = [
    { width: 400, suffix: '-400w' },
    { width: 600, suffix: '-600w' },
    { width: 800, suffix: '-800w' },
  ];

  for (const { width, suffix } of sizes) {
    const outputFile = path.join(dir, `${baseName}${suffix}.webp`);
    const cmd = `convert "${sourceFile}" -resize ${width}x -quality 95 -auto-orient "${outputFile}"`;
    try {
      execSync(cmd, { stdio: 'pipe' });
      console.log(`  ✓ Created ${path.basename(outputFile)}`);
    } catch (err) {
      console.error(`  ✗ Failed to create ${path.basename(outputFile)}: ${err.message}`);
    }
  }
}

async function findMissingImages() {
  const posts = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const missing = [];

  for (const post of posts) {
    const filePath = path.join(POSTS_DIR, post);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    if (data.image_prompt && data.image) {
      const imagePath = path.join(process.cwd(), 'src', data.image);
      if (!fs.existsSync(imagePath)) {
        missing.push({
          post,
          date: data.date,
          title: data.title,
          imagePath,
          imagePrompt: data.image_prompt,
          imageAlt: data.image_alt,
        });
      }
    }
  }

  return missing.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function generateAllImages() {
  const missing = await findMissingImages();

  if (missing.length === 0) {
    console.log('✓ All posts have hero images!');
    return;
  }

  const limit = process.argv[2] ? parseInt(process.argv[2]) : missing.length;
  const toProcess = missing.slice(0, limit);

  console.log(`\n📸 Found ${missing.length} posts missing hero images`);
  console.log(`🚀 Processing ${toProcess.length} images\n`);

  for (const item of toProcess) {
    console.log(`\n📝 ${item.date} - ${item.title}`);
    console.log(`   Prompt: ${item.imagePrompt.substring(0, 80)}...`);

    try {
      console.log('   Generating image...');
      const imageUrl = await generateImage(item.imagePrompt, path.basename(item.imagePath));

      console.log('   Downloading...');
      const pngPath = item.imagePath.replace('.webp', '.png');
      await downloadImage(imageUrl, pngPath);

      console.log('   Converting to WebP...');
      const cmd = `convert "${pngPath}" -quality 95 -auto-orient "${item.imagePath}"`;
      execSync(cmd, { stdio: 'pipe' });

      console.log('   Creating responsive variants...');
      createResponsiveVariants(item.imagePath);

      console.log(`   ✓ Complete!`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
    }
  }

  console.log('\n✨ Image generation complete!');
}

generateAllImages().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
