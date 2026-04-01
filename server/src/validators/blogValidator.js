export const validateComment = (req, res, next) => {
  const { blog, name, content } = req.body
  const errors = []

  if (!blog) errors.push('Blog ID is required')
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters')
  if (!content || content.trim().length < 5) errors.push('Content must be at least 5 characters')

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

export const validateCreateBlog = (req, res, next) => {
  const { title, category, description } = req.body
  const errors = []

  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters')
  if (!category || !category.trim()) errors.push('Category is required')
  if (!description || description.trim().length < 20) errors.push('Description must be at least 20 characters')
  if (!req.file) errors.push('Thumbnail image is required')

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

export const validateGenerateBlog = (req, res, next) => {
  const { title, category } = req.body
  const errors = []

  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters')
  if (!category || !category.trim()) errors.push('Category is required')

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

