export const ROUTES = {
  HOME: '/',
  BLOG_DETAIL: '/blog/:id',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ADD_ARTICLE: '/admin/add-article',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_COMMENTS: '/admin/comments'
}

export const getBlogDetailPath = (id) => `/blog/${id}`
