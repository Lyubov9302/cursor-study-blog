import React, { useState } from 'react'
import { Button, Flex, Form, Input, Select, Typography, Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { BLOG_CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { UPLOAD } from '@/constants/ui'
import { blogApi } from '@/api'
import './AddArticle.css'

const { Title } = Typography
const { TextArea } = Input

function AddArticle() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [imageFile, setImageFile] = useState(null)
  const [submittingMode, setSubmittingMode] = useState(null)
  const [generating, setGenerating] = useState(false)

  const categoryOptions = BLOG_CATEGORIES.filter((category) => category !== 'All').map((category) => ({
    label: category,
    value: category
  }))

  const uploadProps = {
    maxCount: 1,
    accept: UPLOAD.ACCEPTED_TYPES,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        toast.error(t('messages.error.imageType'))
        return Upload.LIST_IGNORE
      }

      const isLtMaxSize = file.size / 1024 / 1024 < UPLOAD.MAX_SIZE_MB
      if (!isLtMaxSize) {
        toast.error(t('messages.error.imageSize'))
        return Upload.LIST_IGNORE
      }

      setImageFile(file)
      return false
    },
    onRemove: () => {
      setImageFile(null)
    }
  }

  const buildFormData = (values, isPublished) => {
    const formData = new FormData()
    formData.append('title', values.title.trim())
    formData.append('subTitle', values.subTitle?.trim() || '')
    formData.append('category', values.category)
    formData.append('description', values.description.trim())
    formData.append('isPublished', String(isPublished))
    if (imageFile) {
      formData.append('image', imageFile)
    }
    return formData
  }

  const handleSubmit = async (isPublished) => {
    try {
      const values = await form.validateFields()
      if (!imageFile) {
        toast.error(t('messages.error.blogThumbnail'))
        return
      }

      setSubmittingMode(isPublished ? 'publish' : 'draft')
      const response = await blogApi.create(buildFormData(values, isPublished))
      if (response.data.success) {
        toast.success(response.data.message || t('messages.success.blogCreated'))
        navigate(ROUTES.ADMIN_ARTICLES)
        return
      }
      toast.error(response.data.message || t('messages.error.generic'))
    } catch (error) {
      if (error?.errorFields) return
      toast.error(error.response?.data?.message || error.message || t('messages.error.generic'))
    } finally {
      setSubmittingMode(null)
    }
  }

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields(['title', 'category'])
      setGenerating(true)
      const response = await blogApi.generate({
        title: values.title.trim(),
        category: values.category,
        subTitle: values.subTitle?.trim() || ''
      })

      if (!response.data.success) {
        toast.error(response.data.message || t('messages.error.generic'))
        return
      }

      const generated = response.data.data || {}
      form.setFieldsValue({
        title: generated.title || values.title,
        subTitle: generated.subTitle || values.subTitle,
        description: generated.description || form.getFieldValue('description')
      })
      toast.success('Article content generated')
    } catch (error) {
      if (error?.errorFields) return
      toast.error(error.response?.data?.message || error.message || t('messages.error.generic'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="admin-add-article">
      <Title level={1} className="admin-add-article-title">
        {t('admin.addBlog.title')}
      </Title>

      <Form form={form} layout="vertical" className="admin-add-article-form">
        <Form.Item label={t('admin.addBlog.uploadThumbnail')} required>
          <Upload {...uploadProps} listType="picture-card" className="admin-add-article-upload">
            <div>
              <PlusOutlined />
              <div>{t('admin.addBlog.uploadButton')}</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="title"
          label={t('admin.addBlog.titleLabel')}
          rules={[{ required: true, message: t('validation.titleRequired') }]}
        >
          <Input placeholder={t('admin.addBlog.titlePlaceholder')} />
        </Form.Item>

        <Form.Item name="subTitle" label={t('admin.addBlog.subtitleLabel')}>
          <Input placeholder={t('admin.addBlog.titlePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="category"
          label={t('admin.addBlog.categoryLabel')}
          rules={[{ required: true, message: t('validation.categoryRequired') }]}
        >
          <Select
            options={categoryOptions}
            placeholder={t('admin.addBlog.categoryPlaceholder')}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('admin.addBlog.bodyLabel')}
          rules={[{ required: true, message: t('messages.error.blogDescription') }]}
        >
          <TextArea placeholder={t('admin.addBlog.titlePlaceholder')} autoSize={{ minRows: 6, maxRows: 10 }} />
        </Form.Item>

        <Flex justify="space-between" align="center" className="admin-add-article-actions-top">
          <div />
          <Button loading={generating} onClick={handleGenerate}>
            {t('admin.addBlog.generateAI')}
          </Button>
        </Flex>

        <Flex gap="middle" className="admin-add-article-actions-bottom">
          <Button
            type="primary"
            loading={submittingMode === 'publish'}
            onClick={() => handleSubmit(true)}
          >
            {t('admin.addBlog.publishButton')}
          </Button>
          <Button
            loading={submittingMode === 'draft'}
            onClick={() => handleSubmit(false)}
          >
            {t('admin.addBlog.saveDraft')}
          </Button>
        </Flex>
      </Form>
    </div>
  )
}

export default AddArticle
