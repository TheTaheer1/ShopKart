import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createProduct, uploadProductImage } from '../services/api'

const initialForm = { name: '', description: '', price: '', category: 'Electronics', stock: '' }

function NewProduct() {
  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    setImageFile(file || null)
    setPreviewUrl(file ? URL.createObjectURL(file) : '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!imageFile) {
      setError('Please choose a product image.')
      return
    }

    setIsSubmitting(true)
    try {
      const uploadedImage = await uploadProductImage(imageFile)
      await createProduct({ ...form, image: uploadedImage.url })
      navigate('/products')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="catalog-page">
      <Navbar />
      <section className="new-product-page">
        <Link className="back-link" to="/products">← Back to products</Link>
        <div className="new-product-heading">
          <p className="eyebrow">PRODUCT CATALOG</p>
          <h1>Add a new product</h1>
          <p>Choose an image and it will be stored securely in Cloudinary.</p>
        </div>
        <form className="new-product-form" onSubmit={handleSubmit}>
          <label className="image-upload-control">
            <span>Product image</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            {previewUrl && <img src={previewUrl} alt="Selected product preview" className="image-upload-preview" />}
          </label>
          <label>Product name<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Electronics</option><option>Fashion</option><option>Books</option><option>Home</option>
            </select>
          </label>
          <label className="form-wide">Description<textarea name="description" value={form.description} onChange={handleChange} required rows="4" /></label>
          <label>Price (₹)<input name="price" type="number" min="1" value={form.price} onChange={handleChange} required /></label>
          <label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required /></label>
          {error && <p className="form-error form-wide" role="alert">{error}</p>}
          <button className="button button-primary form-wide" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading image & saving...' : 'Upload & create product →'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default NewProduct
