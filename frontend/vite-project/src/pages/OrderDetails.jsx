import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrderById } from '../services/api'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getOrderById(id).then(setOrder).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load this order.')) }, [id])
  return <main className="catalog-page"><Navbar /><section className="orders-page"><Link className="back-link" to="/orders">← Back to orders</Link>{!order && !error && <p className="catalog-message">Loading your order...</p>}{error && <div className="wishlist-state"><h2>Unable to load order.</h2><p>{error}</p></div>}{order && <><div className="checkout-heading"><p className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</p><h1>Order details</h1><p>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} · {order.status}</p></div><div className="order-details-layout"><div className="order-items-detail">{order.items.map((item) => <article className="order-detail-item" key={item.product}><img src={item.image} alt={item.name} /><div><h2>{item.name}</h2><p>₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p></div><strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong></article>)}</div><aside className="order-summary"><p className="eyebrow">DELIVERY ADDRESS</p><h2>{order.shippingAddress.fullName}</h2><p className="summary-note">{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p><div><span>Total paid</span><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong></div><div><span>Payment</span><strong>{order.paymentStatus}</strong></div></aside></div></>}</section></main>
}

export default OrderDetails
