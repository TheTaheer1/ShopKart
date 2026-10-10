import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartItem from '../components/CartItem'
import { useCart } from '../store/useCart'

function Cart() {
  const { cartItems, isCartLoading, cartError, totalItems, subtotal, refreshCart, updateQuantity, removeFromCart } = useCart()

  return (
    <main className="catalog-page">
      <Navbar />
      <section className="cart-page">
        <Link className="back-link" to="/products">← Continue shopping</Link>
        <div className="cart-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h1>My Cart</h1></div>{!isCartLoading && !cartError && <p className="catalog-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>}</div>
        {isCartLoading && <p className="catalog-message">Loading your cart...</p>}
        {!isCartLoading && cartError && <div className="wishlist-state"><h2>Unable to load your cart.</h2><p>{cartError}</p><button className="button button-primary" type="button" onClick={refreshCart}>Try Again</button></div>}
        {!isCartLoading && !cartError && cartItems.length === 0 && <div className="wishlist-state"><span className="empty-heart" aria-hidden="true">🛒</span><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="button button-primary" to="/products">Browse Products →</Link></div>}
        {!isCartLoading && !cartError && cartItems.length > 0 && <div className="cart-layout"><div className="cart-items">{cartItems.map((item) => <CartItem key={item.product._id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />)}</div><aside className="order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Order summary</h2><div><span>Items</span><span>{totalItems}</span></div><div><span>Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><p className="summary-note">Taxes and delivery are calculated at checkout.</p><Link className="button button-primary" to="/checkout">Proceed to Checkout →</Link></aside></div>}
      </section>
    </main>
  )
}

export default Cart
