import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/useCart'
import { useWishlist } from '../store/useWishlist'

function ProductCard({ product, isWishlisted = false, onWishlistAdded }) {
  const price = Number(product.price) || 0
  const stock = Number(product.stock) || 0
  const isInStock = stock > 0
  const [wishlistStatus, setWishlistStatus] = useState('idle')
  const [wishlistError, setWishlistError] = useState('')
  const [cartStatus, setCartStatus] = useState('idle')
  const [cartActionError, setCartActionError] = useState('')
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()

  const handleAddToWishlist = async () => {
    setWishlistStatus('saving')
    setWishlistError('')

    try {
      await addToWishlist(product._id)
      setWishlistStatus('added')
      onWishlistAdded?.(product._id)
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistStatus('added')
        onWishlistAdded?.(product._id)
      } else {
        setWishlistStatus('idle')
        setWishlistError(error.response?.data?.message || 'Unable to save product. Please try again.')
      }
    }
  }

  const handleAddToCart = async () => {
    setCartStatus('adding')
    setCartActionError('')
    try {
      await addToCart(product._id)
      setCartStatus('added')
      window.setTimeout(() => setCartStatus('idle'), 1800)
    } catch (error) {
      setCartStatus('idle')
      setCartActionError(error.response?.data?.message || 'Unable to add product to cart. Please try again.')
    }
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{price.toLocaleString('en-IN')}</p>
        <p className={isInStock ? 'stock-status' : 'stock-status out-of-stock'}>
          {isInStock ? `${stock} units left` : 'Out of stock'}
        </p>
        <Link className="button button-primary product-details-link" to={`/products/${product._id}`}>
          View Details <span aria-hidden="true">→</span>
        </Link>
        <button className={`button cart-button ${cartStatus === 'added' ? 'cart-button-added' : ''}`} type="button" onClick={handleAddToCart} disabled={cartStatus === 'adding' || !isInStock} aria-busy={cartStatus === 'adding'}>
          {cartStatus === 'adding' ? 'Adding...' : cartStatus === 'added' ? 'Added to Cart ✓' : isInStock ? 'Add to Cart' : 'Out of stock'} <span aria-hidden="true">{cartStatus === 'added' ? '' : '→'}</span>
        </button>
        {cartActionError && <p className="wishlist-error" role="alert" aria-live="polite">{cartActionError}</p>}
        <button
          className={`button wishlist-button ${wishlistStatus === 'added' || isWishlisted ? 'wishlist-button-added' : ''}`}
          type="button"
          onClick={handleAddToWishlist}
          disabled={wishlistStatus === 'saving' || wishlistStatus === 'added' || isWishlisted}
        >
          {wishlistStatus === 'saving' ? 'Saving...' : wishlistStatus === 'added' || isWishlisted ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
        </button>
        {wishlistError && <p className="wishlist-error" role="alert" aria-live="polite">{wishlistError}</p>}
      </div>
    </article>
  )
}

export default ProductCard
