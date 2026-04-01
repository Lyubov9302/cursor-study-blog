import express from 'express'
import { 
  createBlog,
  addComment, 
  deleteBlogById, 
  generateBlogContent,
  getAllBlogs, 
  getBlogById, 
  getBlogComments, 
  publishBlog,
  unpublishBlog 
} from '../controllers/blogController.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import { commentLimiter, generateLimiter } from '../middleware/rateLimiter.js'
import { validateComment, validateCreateBlog, validateGenerateBlog } from '../validators/blogValidator.js'

const blogRouter = express.Router()

// Public routes
blogRouter.get('/all', getAllBlogs)
blogRouter.get('/:blogId', getBlogById)
blogRouter.post('/add-comment', commentLimiter, validateComment, addComment)
blogRouter.post('/comments', getBlogComments)

// Apply auth middleware to all routes below this point
blogRouter.use(auth)

// Protected routes
blogRouter.post('/add', upload.single('image'), validateCreateBlog, createBlog)
blogRouter.post('/generate', generateLimiter, validateGenerateBlog, generateBlogContent)
blogRouter.post('/delete', deleteBlogById)
blogRouter.post('/publish', publishBlog)
blogRouter.post('/unpublish', unpublishBlog)

export default blogRouter