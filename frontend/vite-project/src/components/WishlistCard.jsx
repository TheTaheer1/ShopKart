import { useState } from 'react'
import { Link } from 'react-router-dom'

function WishlistCard({ product, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState('')
  const stock = Number(product.stock) || 0

  const handleRemove = async () => {
    setIsRemoving(true)
    setError('')

    try {
      await onRemove(product._id)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove product. Please try again.')
      setIsRemoving(false)
    }
  }

  return (
    <article className="product-card wishlist-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{(Number(product.price) || 0).toLocaleString('en-IN')}</p>
        <p className={stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
          {stock > 0 ? `${stock} units left` : 'Out of stock'}
        </p>
        <Link className="button button-primary product-details-link" to={`/products/${product._id}`}>View Details <span aria-hidden="true">→</span></Link>
        <button className="button wishlist-button remove-wishlist-button" type="button" onClick={handleRemove} disabled={isRemoving}>
          {isRemoving ? 'Removing...' : 'Remove from Wishlist'}
        </button>
        {error && <p className="wishlist-error" role="alert">{error}</p>}
      </div>
    </article>
  )
}

export default WishlistCard
