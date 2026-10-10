import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getAllOrders } from '../services/api'
import { createOrderSocket } from '../services/socket'
import { formatStatus } from '../utils/formatStatus'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setIsLoading(true); setError('')
    try { setOrders(await getAllOrders()) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load the admin orders dashboard.') } finally { setIsLoading(false) }
  }

  useEffect(() => {
    let active = true
    getAllOrders().then((items) => { if (active) setOrders(items) }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load the admin orders dashboard.') }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const socket = createOrderSocket()
    const refreshOrders = () => { getAllOrders().then(setOrders).catch(() => {}) }
    socket.on('orders:changed', refreshOrders)
    socket.connect()
    return () => { socket.off('orders:changed', refreshOrders); socket.disconnect() }
  }, [])

  return (
    <main className="catalog-page"><Navbar /><section className="admin-orders-page">
      <Link className="back-link" to="/products">← Back to shop</Link>
      <div className="checkout-heading"><p className="eyebrow">SHOPKART ADMIN</p><h1>All orders</h1><p>Review customer orders, payments, addresses, and item snapshots.</p></div>
      {isLoading && orders.length === 0 && <p className="catalog-message">Loading all orders...</p>}
      {!isLoading && error && orders.length === 0 && <div className="wishlist-state"><h2>Unable to load orders.</h2><p>{error}</p><button className="button button-primary" type="button" onClick={loadOrders}>Try Again</button></div>}
      {!isLoading && !error && orders.length === 0 && <div className="wishlist-state"><h2>No customer orders yet.</h2><p>Placed orders will appear here.</p></div>}
      {orders.length > 0 && <div className="admin-orders-list">{orders.map((order) => <article className="admin-order-card" key={order._id}>
        <div className="admin-order-topline"><div><p className="product-category">ORDER #{order._id.slice(-8).toUpperCase()}</p><h2>{order.user?.fullName || 'Unknown customer'}</h2><p className="admin-customer-email">{order.user?.email || 'No email available'}</p></div><div className="admin-order-badges"><span className="order-status">{formatStatus(order.status)}</span><span className="payment-status">{formatStatus(order.paymentStatus)}</span></div></div>
        <div className="admin-order-grid"><div><span>Placed</span><strong>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div><div><span>Items</span><strong>{order.items.reduce((total, item) => total + item.quantity, 0)}</strong></div><div><span>Total</span><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong></div><div><span>Ship to</span><strong>{order.shippingAddress.city}, {order.shippingAddress.state}</strong></div></div>
        <div className="admin-order-items">{order.items.map((item) => <span key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</span>)}</div>
        <details className="admin-order-details"><summary>View shipping details</summary><p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p></details>
      </article>)}</div>}
      {!isLoading && error && orders.length > 0 && <p className="catalog-refreshing" role="status">We couldn’t refresh orders. Showing the last loaded list.</p>}
    </section></main>
  )
}

export default AdminOrders
