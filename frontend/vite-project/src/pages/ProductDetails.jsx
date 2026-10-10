import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getProductById } from '../services/api'
import { useCart } from '../store/useCart'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState('')
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    setCartError('')
    try {
      await addToCart(id)
    } catch (error) {
      setCartError(error.response?.data?.message || 'Unable to add product to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setProduct(await getProductById(id))
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id])

  return (
    <main className="catalog-page">
      <Navbar />
      {isLoading && <p className="catalog-message">Loading products...</p>}
      {!isLoading && hasError && <p className="catalog-message error-message">Something went wrong while loading products.</p>}
      {!isLoading && !hasError && product && (
        <section className="product-detail">
          <Link className="back-link" to="/products">← Back to products</Link>
          <div className="detail-layout">
            <div className="detail-image-wrap"><img src={product.image} alt={product.name} className="detail-image" /></div>
            <div className="detail-copy">
              <p className="product-category">{product.category}</p>
              <h1>{product.name}</h1>
              <p className="detail-price">₹{(Number(product.price) || 0).toLocaleString('en-IN')}</p>
              <p className="detail-description">{product.description}</p>
              <p className={(Number(product.stock) || 0) > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
                {(Number(product.stock) || 0) > 0 ? `${Number(product.stock) || 0} units in stock` : 'Out of stock'}
              </p>
              <button className="button button-primary" type="button" onClick={handleAddToCart} disabled={(Number(product.stock) || 0) === 0 || isAddingToCart}>
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              {cartError && <p className="wishlist-error" role="alert">{cartError}</p>}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetails
