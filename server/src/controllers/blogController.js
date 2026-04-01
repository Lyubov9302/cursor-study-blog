import fs from 'fs'
import path from 'path'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'
import { transformBlogImage, transformBlogsImages } from '../utils/imageUrl.js'
import { asyncHandler } from '../helpers/asyncHandler.js'
import generateWithGemini from '../configs/gemini.js'

// Helper to delete image file
const deleteImageFile = (imagePath) => {
  if (!imagePath) return

  // Extract filename from URL path (handle both relative and full URLs)
  const urlPath = imagePath.replace(/^https?:\/\/[^/]+/, '')
  const filename = urlPath.split('/').pop()
  const fullPath = path.join(process.cwd(), 'uploads', 'blogs', filename)

  // Only delete if file exists and is in uploads directory
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath)
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }
}

export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
  res.json({
    success: true,
    count: blogs.length,
    blogs: transformBlogsImages(blogs, req)
  })
})

export const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params
  const blog = await Blog.findById(blogId)
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' })
  }
  res.json({ success: true, blog: transformBlogImage(blog, req) })
})

export const deleteBlogById = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Find the blog first to get the image path
  const blog = await Blog.findById(id)
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' })
  }
  
  if (blog.image) {
    // Delete the associated image file
    deleteImageFile(blog.image)
  }

  await Blog.findByIdAndDelete(id)

  // Delete all comments associated with the blog
  await Comment.deleteMany({ blog: id })

  res.json({ success: true, message: 'Blog deleted successfully' })
})

export const publishBlog = asyncHandler(async (req, res) => {
  const { id } = req.body
  const blog = await Blog.findById(id)
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' })
  }
  blog.isPublished = true
  await blog.save()
  res.json({ success: true, message: 'Blog published successfully' })
})

export const unpublishBlog = asyncHandler(async (req, res) => {
  const { id } = req.body
  const blog = await Blog.findById(id)
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' })
  }
  blog.isPublished = false
  await blog.save()
  res.json({ success: true, message: 'Blog unpublished successfully' })
})

export const addComment = asyncHandler(async (req, res) => {
  const { blog, name, content } = req.body
  await Comment.create({ blog, name, content })
  res.status(201).json({ success: true, message: 'Comment added for review' })
})

export const getBlogComments = asyncHandler(async (req, res) => {
  const { blogId } = req.body
  const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 })
  res.json({
    success: true,
    count: comments.length,
    comments
  })
})

export const createBlog = asyncHandler(async (req, res) => {
  const { title, subTitle, description, category, isPublished } = req.body

  const imagePath = req.file ? `/uploads/blogs/${req.file.filename}` : ''
  const newBlog = await Blog.create({
    title: title.trim(),
    subTitle: subTitle?.trim() || '',
    description: description.trim(),
    category: category.trim(),
    author: req.user.userId,
    authorName: req.user.name || req.user.email || 'Admin',
    image: imagePath,
    isPublished: isPublished === 'true'
  })

  res.status(201).json({
    success: true,
    message: newBlog.isPublished ? 'Blog published successfully' : 'Blog saved as draft successfully',
    blog: transformBlogImage(newBlog, req)
  })
})

const tryParseJson = (rawText) => {
  try {
    return JSON.parse(rawText)
  } catch {
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  }
}

export const generateBlogContent = asyncHandler(async (req, res) => {
  const { title, subTitle = '', category } = req.body
  const prompt = `
You are a blog writer.
Generate a blog draft in strict JSON format.
Return only valid JSON with keys: title, subTitle, description.

Requirements:
- Title topic: ${title}
- Subtitle hint: ${subTitle || 'Create a concise subtitle'}
- Category: ${category}
- Description must be plain text with headings and paragraphs.
- Keep content around 400-600 words.
`

  const rawResponse = await generateWithGemini(prompt)
  const parsed = tryParseJson(rawResponse)

  res.json({
    success: true,
    data: {
      title: parsed.title || title,
      subTitle: parsed.subTitle || subTitle,
      description: parsed.description || ''
    }
  })
})

