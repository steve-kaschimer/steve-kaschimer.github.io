import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDir = path.join(process.cwd(), 'content', 'posts')

export function getPostSlugs() {
  if (!fs.existsSync(postsDir)) return []
  return fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
}

export function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = path.join(postsDir, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const fm = data || {}
  // normalize Date objects to ISO strings for serialization
  if (fm.date instanceof Date) fm.date = fm.date.toISOString()
  if (fm.publishDate instanceof Date) fm.publishDate = fm.publishDate.toISOString()
  return { slug: realSlug, frontmatter: fm, content: content || '' }
}

export async function markdownToHtml(markdown) {
  const processed = await remark().use(html).process(markdown)
  return processed.toString()
}

export async function getPostData(slug) {
  const post = getPostBySlug(slug)
  const content = await markdownToHtml(post.content)
  return { ...post, content }
}

export function getAllPosts() {
  const slugs = getPostSlugs()
  const posts = slugs.map((s) => getPostBySlug(s))
  // sort by date (descending) if date or publishDate exists
  posts.sort((a, b) => {
    const da = new Date(a.frontmatter.date || a.frontmatter.publishDate || 0)
    const db = new Date(b.frontmatter.date || b.frontmatter.publishDate || 0)
    return db - da
  })
  return posts
}
