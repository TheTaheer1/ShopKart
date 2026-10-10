import { useState } from 'react'

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const product = item.product
  const price = Number(product.price) || 0

  const changeQuantity = async (quantity) => {
    setIsUpdating(true)
    setError('')
    try {
      await onUpdateQuantity(product._id, quantity)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update quantity. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const remove = async () => {
    setIsUpdating(true)
    setError('')
    try {
      await onRemove(product._id)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove product. Please try again.')
      setIsUpdating(false)
    }
  }

  return (
    <article className="cart-item">
      <img src={product.image} alt={product.name} className="cart-item-image" />
      <div className="cart-item-info">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="cart-item-price">₹{price.toLocaleString('en-IN')}</p>
        <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>{product.stock} units available</p>
        <div className="quantity-controls" aria-label={`Quantity for ${product.name}`}>
          <button type="button" onClick={() => changeQuantity(item.quantity - 1)} disabled={isUpdating || item.quantity <= 1} aria-label={`Decrease ${product.name} quantity`}>−</button>
          <span aria-live="polite">{item.quantity}</span>
          <button type="button" onClick={() => changeQuantity(item.quantity + 1)} disabled={isUpdating || item.quantity >= product.stock} aria-label={`Increase ${product.name} quantity`}>+</button>
        </div>
        <button className="remove-cart-button" type="button" onClick={remove} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Remove'}</button>
        {error && <p className="wishlist-error" role="alert">{error}</p>}
      </div>
      <p className="cart-line-total">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
    </article>
  )
}

export default CartItem
