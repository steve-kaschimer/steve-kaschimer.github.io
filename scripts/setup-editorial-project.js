#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');

const POSTS_DIR = path.join(process.cwd(), 'src/posts');
const TODAY = new Date();

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    console.error(err.message);
    throw err;
  }
}

function getRepoInfo() {
  try {
    const origin = runCommand('git config --get remote.origin.url');
    const match = origin.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);
    if (!match) throw new Error('Not a GitHub repo');
    return { owner: match[1], repo: match[2] };
  } catch (err) {
    console.error('❌ Must be run from a GitHub repository');
    process.exit(1);
  }
}

function loadPosts() {
  const posts = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const filePath = path.join(POSTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);

      const imagePath = path.join(process.cwd(), 'src', data.image || '');
      const hasImage = fs.existsSync(imagePath);

      const postDate = new Date(data.date);
      const isPublished = postDate <= TODAY && hasImage;

      let status = 'Staging'; // default for posts in src/posts
      if (isPublished) {
        status = 'Done';
      }

      return {
        date: typeof data.date === 'string' ? data.date : data.date?.toISOString().split('T')[0] || '',
        title: data.title,
        tags: data.tags || [],
        imagePath: data.image,
        hasImage,
        isPublished,
        status,
        file,
        imagePrompt: data.image_prompt,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return posts;
}

async function main() {
  console.log('📋 Setting up Editorial Project Board\n');

  const { owner, repo } = getRepoInfo();
  console.log(`Repository: ${owner}/${repo}\n`);

  // Use existing project
  const projectNumber = 4;
  console.log(`Using project #${projectNumber}\n`);

  // Load posts
  const posts = loadPosts();
  console.log(`Found ${posts.length} posts\n`);

  // Create issues
  console.log('Creating issues...');
  let created = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const labels = [post.status.toLowerCase()];
    if (!post.hasImage) labels.push('hero-image-pending');

    const body = `**Date:** ${post.date}\n**Tags:** ${post.tags.join(', ') || 'none'}\n**Status:** ${post.status}\n\n**File:** ${post.file}\n\n${!post.hasImage && post.imagePrompt ? `**Image Prompt:**\n${post.imagePrompt}` : ''}`;

    // Write body to temp file to avoid escaping issues
    const tempFile = path.join('/tmp', `issue-body-${i}.txt`);
    fs.writeFileSync(tempFile, body);

    try {
      const output = runCommand(
        `gh issue create --repo ${owner}/${repo} --title "${post.title.replace(/"/g, '\\"')}" --body-file "${tempFile}" --label "${labels.join(',')}"`
      );

      // Extract issue number from output
      const match = output.match(/#(\d+)/);
      if (match) {
        const issueNumber = match[1];

        // Add to project
        try {
          runCommand(`gh project item-add ${projectNumber} --owner ${owner} --issue ${issueNumber}`);
        } catch (e) {
          // Might already be added
        }
      }

      created++;
      if ((created % 10) === 0) {
        process.stdout.write(`  ${created}/${posts.length}\r`);
      }

      fs.unlinkSync(tempFile);
    } catch (err) {
      console.error(`\n✗ Failed to create issue for ${post.title}`);
    }
  }

  console.log(`\n✓ Created ${created} issues\n`);
  console.log(`📊 Project ready: https://github.com/${owner}/${repo}/projects/${projectNumber}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
