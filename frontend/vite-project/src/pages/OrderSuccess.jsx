import { Link, useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

function OrderSuccess() {
  const { id } = useParams()
  const { state } = useLocation()
  const order = state?.order

  return <main className="catalog-page"><Navbar /><section className="success-page"><span className="success-icon">✓</span><p className="eyebrow">PAYMENT VERIFIED</p><h1>Order placed successfully</h1><p>Your order has been placed successfully. Thank you for shopping with ShopKart!</p><div className="success-order-meta"><span>Order ID</span><strong>{order?._id || id}</strong>{order && <><span>Total</span><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong><span>Status</span><strong>{order.status}</strong></>}</div><div className="success-actions"><Link className="button button-primary" to="/orders">View My Orders →</Link><Link className="button cart-button" to="/products">Continue Shopping →</Link></div></section></main>
}

export default OrderSuccess
