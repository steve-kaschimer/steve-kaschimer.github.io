# Content Guide

This guide explains how to create and manage blog posts and other content for the Tech Notes blog.

## Creating a Blog Post

### Step-by-Step Guide

#### 1. Create a New Markdown File

Blog posts are stored in `src/posts/`. File naming convention:

```
YYYY-MM-DD-post-title.md
```

Examples:
- `2025-12-04-getting-started-with-docker.md`
- `2025-01-15-javascript-tips-and-tricks.md`

Create your post:

```bash
touch src/posts/2025-12-04-my-awesome-post.md
```

#### 2. Add Front Matter

Every blog post must start with front matter (YAML format between `---` markers):

```markdown
---
author: Steve Kaschimer
date: 2025-12-04
image: /images/posts/2025-12-04-hero.svg
layout: post.njk
site_title: Tech Notes
summary: A brief description of your post that appears on the homepage
tags: ['javascript', 'tutorial', 'web-development']
title: My Awesome Blog Post
---
```

#### 3. Write Your Content

After the front matter, write your content in Markdown:

```markdown
---
# front matter here
---

Your blog post starts here! You can use all standard Markdown features.

## Section Heading

Here's a paragraph with **bold text** and *italic text*.

### Subsection

- Bullet point 1
- Bullet point 2
- Bullet point 3
```

## Front Matter Fields

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Post title | `Getting Started with Eleventy` |
| `author` | Author name | `Steve Kaschimer` |
| `date` | Publication date (YYYY-MM-DD) | `2025-12-04` |
| `layout` | Template to use | `post.njk` |
| `summary` | Brief description for post cards | `Learn how to build...` |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| `image` | Hero image path | `/images/posts/hero.svg` |
| `tags` | Array of tags | `['javascript', 'tutorial']` |
| `site_title` | Override site title | `Tech Notes` |

### Field Details

#### date
- Format: `YYYY-MM-DD`
- Posts with future dates are **automatically excluded** from builds
- Used for sorting (newest first)
- Controls post scheduling

```yaml
date: 2025-12-04
```

#### tags
- Array format: `['tag1', 'tag2', 'tag3']`
- Use lowercase, hyphenated names
- Keep tags consistent across posts
- Used for filtering on homepage

```yaml
tags: ['javascript', 'web-development', 'tutorial']
```

#### image
- Path relative to site root
- Recommended size: 1200x630px (Open Graph)
- Formats: SVG, PNG, JPG
- Optional - defaults to gradient placeholder

```yaml
image: /images/posts/2025-12-04-my-post.svg
```

#### summary
- 1-2 sentences
- Appears on post cards
- Keep it concise and engaging
- 100-160 characters recommended

```yaml
summary: Learn how to build a modern blog with Eleventy and Tailwind CSS in this step-by-step tutorial.
```

## Markdown Features

### Headings

```markdown
# H1 - Post Title (use once)
## H2 - Major Section
### H3 - Subsection
#### H4 - Minor Heading
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

### Links

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title text")
```

### Images

```markdown
![Alt text](/images/my-image.png)
![Image with title](/images/my-image.png "Image title")
```

### Lists

Unordered:
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

Ordered:
```markdown
1. First item
2. Second item
3. Third item
```

### Code Blocks

Use triple backticks with language identifier:

````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

Supported languages:
- `javascript` / `js`
- `python`
- `bash` / `shell`
- `yaml` / `yml`
- `json`
- `html`
- `css`
- `markdown` / `md`

Features:
- Syntax highlighting (Prism.js)
- Copy button automatically added
- Line numbers available

### Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.

> **Note:** You can use formatting inside quotes.
```

### Horizontal Rules

```markdown
---
```

or

```markdown
***
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

## Working with Images

### Adding Images

1. **Save image to appropriate directory:**
   ```
   src/images/posts/your-image.png
   ```

2. **Reference in front matter or content:**
   ```yaml
   image: /images/posts/your-image.png
   ```

   Or in content:
   ```markdown
   ![Description](/images/posts/your-image.png)
   ```

### Image Best Practices

- **Optimize** images before adding (use tools like ImageOptim, TinyPNG)
- **Size:** Keep under 500KB when possible
- **Dimensions:** 
  - Hero images: 1200x630px
  - Inline images: Max 800px wide
- **Format:**
  - Photos: JPG (80-90% quality)
  - Graphics/logos: SVG or PNG
  - Screenshots: PNG
- **Alt text:** Always provide descriptive alt text

### Image Organization

```
src/images/
├── posts/              # Post-specific images
│   ├── 2025-12-04-hero.svg
│   └── 2025-12-04-diagram.png
├── favicon.svg         # Site favicon
└── apple-touch-icon.svg
```

## Working with Tags

### Tag Guidelines

**Naming:**
- Use lowercase
- Use hyphens for spaces: `web-development`
- Keep consistent across posts
- Be specific but not too granular

**Examples:**
- ✅ `javascript`, `web-development`, `tutorial`, `devsecops`
- ❌ `JavaScript`, `Web Development`, `tuts`, `dev_sec_ops`

### Common Tags

Maintain a consistent set of tags:

- **Languages:** `javascript`, `python`, `go`, `typescript`
- **Topics:** `web-development`, `devops`, `security`, `cloud`
- **Types:** `tutorial`, `guide`, `opinion`, `news`
- **Technologies:** `docker`, `kubernetes`, `aws`, `github-actions`

### Managing Tags

View all tags:
```bash
# List all markdown files and their tags
grep -r "tags:" src/posts/
```

The blog automatically:
- Collects unique tags
- Counts posts per tag
- Displays in sidebar
- Enables filtering

## Scheduling Posts

### Future Posts

Posts with future dates are automatically excluded from builds:

```yaml
date: 2025-12-25  # Won't appear until this date
```

### Publishing Workflow

1. **Write post with future date**
2. **Commit to repository**
3. **Automated builds run daily** (via GitHub Actions cron)
4. **Post appears automatically** when date arrives

## Content Best Practices

### Writing Tips

1. **Start with a hook** - Grab attention in the first paragraph
2. **Use headings** - Break content into scannable sections
3. **Keep paragraphs short** - 2-4 sentences ideal
4. **Add code examples** - Show, don't just tell
5. **Include images** - Visual breaks improve readability
6. **Use lists** - Easier to scan than paragraphs
7. **End with a summary** - Recap key points

### SEO Best Practices

- **Title:** 50-60 characters, include main keyword
- **Summary:** 120-160 characters, compelling and descriptive
- **Headings:** Use logical hierarchy (H2 → H3 → H4)
- **Internal links:** Link to other relevant posts
- **Alt text:** Describe images for accessibility and SEO
- **URL:** Automatic from filename (use descriptive names)

### Accessibility

- **Alt text:** Describe all images
- **Heading structure:** Use proper hierarchy
- **Link text:** Descriptive, not "click here"
- **Color contrast:** Default theme handles this
- **Code blocks:** Always specify language

## Example Post Template

```markdown
---
author: Steve Kaschimer
date: 2025-12-04
image: /images/posts/2025-12-04-hero.svg
layout: post.njk
site_title: Tech Notes
summary: A practical guide to [topic] with code examples and best practices.
tags: ['javascript', 'tutorial', 'web-development']
title: Complete Guide to [Topic]
---

Brief introduction that hooks the reader and explains what they'll learn.

## What You'll Learn

- Key point 1
- Key point 2
- Key point 3

## Prerequisites

What readers should know or have installed before starting.

## Section 1: Getting Started

Explanation with context...

```javascript
// Code example
const example = "code";
```

### Subsection

More detailed explanation...

## Section 2: Advanced Topics

Continue with more sections...

## Conclusion

Recap the key points and next steps.

## Further Reading

- [Related Article 1](/posts/related-post-1/)
- [External Resource](https://example.com)
```

## Previewing Posts

### Local Preview

```bash
# Start development server
npm run dev

# Open in browser
open http://localhost:8080
```

### Check Post Appears

1. Navigate to homepage
2. Look for your post in the grid
3. Click to view full post
4. Check formatting, images, code blocks
5. Test tag filtering

## Editing Existing Posts

1. **Find the post file** in `src/posts/`
2. **Edit content or front matter**
3. **Save file**
4. **Check preview** in browser (auto-reloads)
5. **Commit changes** when satisfied

## Deleting Posts

1. **Delete the markdown file** from `src/posts/`
2. **Remove associated images** (if not used elsewhere)
3. **Rebuild** to remove from site
4. **Commit deletion**

## Content Organization Tips

- Use consistent file naming
- Group images by post date
- Keep drafts in separate directory (outside `src/posts/`)
- Use git branches for work-in-progress posts
- Tag posts consistently for better filtering

---

**Next:** [Customization Guide](CUSTOMIZATION.md) | [Features Documentation](FEATURES.md)
