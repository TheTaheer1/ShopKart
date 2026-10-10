import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { cancelPendingOrder, getOrders, retryPayment, verifyPayment } from '../services/api'
import { createOrderSocket } from '../services/socket'
import { loadRazorpay } from '../utils/razorpay'
import { formatStatus } from '../utils/formatStatus'

function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryingOrderId, setRetryingOrderId] = useState('')
  const [retryError, setRetryError] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState('')
  const loadOrders = async () => { setIsLoading(true); setError(''); try { setOrders(await getOrders()) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load your orders.') } finally { setIsLoading(false) } }
  useEffect(() => {
    let isCurrentRequest = true
    const loadInitialOrders = async () => {
      try {
        const nextOrders = await getOrders()
        if (isCurrentRequest) setOrders(nextOrders)
      } catch (requestError) {
        if (isCurrentRequest) setError(requestError.response?.data?.message || 'Unable to load your orders.')
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }
    loadInitialOrders()
    return () => { isCurrentRequest = false }
  }, [])

  const handleRetryPayment = async (order) => {
    setRetryingOrderId(order._id)
    setRetryError('')
    try {
      const paymentOrder = await retryPayment(order._id)
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Unable to load Razorpay Checkout. Please check your connection and try again.')
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'ShopKart',
        description: `${order.items.reduce((total, item) => total + item.quantity, 0)} item${order.items.length === 1 ? '' : 's'} from ShopKart`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: { name: order.shippingAddress.fullName, contact: order.shippingAddress.phone },
        theme: { color: '#20b7a3' },
        handler: async (response) => {
          try {
            await verifyPayment(response)
            await loadOrders()
          } catch (requestError) {
            setRetryError(requestError.response?.data?.message || 'Payment could not be verified. You can try again.')
          } finally {
            setRetryingOrderId('')
          }
        },
        modal: { ondismiss: () => setRetryingOrderId('') }
      })
      razorpay.open()
    } catch (requestError) {
      setRetryError(requestError.response?.data?.message || requestError.message || 'Unable to restart payment. Please try again.')
      setRetryingOrderId('')
    }
  }

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Cancel this unpaid order? Your cart will remain unchanged.')) return
    setCancellingOrderId(order._id)
    setRetryError('')
    try {
      await cancelPendingOrder(order._id)
      await loadOrders()
    } catch (requestError) {
      setRetryError(requestError.response?.data?.message || 'Unable to cancel this order. Please try again.')
    } finally {
      setCancellingOrderId('')
    }
  }
  useEffect(() => {
    const socket = createOrderSocket()
    const refreshOrders = () => { getOrders().then(setOrders).catch(() => {}) }
    socket.on('orders:changed', refreshOrders)
    socket.connect()
    return () => { socket.off('orders:changed', refreshOrders); socket.disconnect() }
  }, [])

  return <main className="catalog-page"><Navbar /><section className="orders-page"><Link className="back-link" to="/products">← Continue shopping</Link><div className="checkout-heading"><p className="eyebrow">PURCHASE HISTORY</p><h1>My Orders</h1></div>{retryError && <p className="form-error" role="alert">{retryError}</p>}{isLoading && <p className="catalog-message">Loading your orders...</p>}{!isLoading && error && <div className="wishlist-state"><h2>Unable to load your orders.</h2><p>{error}</p><button className="button button-primary" type="button" onClick={loadOrders}>Try Again</button></div>}{!isLoading && !error && orders.length === 0 && <div className="wishlist-state"><h2>You have not placed any orders yet.</h2><Link className="button button-primary" to="/products">Start Shopping →</Link></div>}{!isLoading && !error && orders.length > 0 && <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div><p className="product-category">ORDER #{order._id.slice(-8).toUpperCase()}</p><h2>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</h2><p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ')}</p></div><div className="order-card-summary"><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong><span className="order-status">{formatStatus(order.status)}</span>{order.paymentStatus === 'PENDING' && order.status === 'PENDING_PAYMENT' && <div className="pending-order-actions"><button className="button button-primary retry-payment-button" type="button" onClick={() => handleRetryPayment(order)} disabled={retryingOrderId === order._id || cancellingOrderId === order._id}>{retryingOrderId === order._id ? 'Opening payment…' : 'Retry payment'}</button><button className="cancel-order-button" type="button" onClick={() => handleCancelOrder(order)} disabled={retryingOrderId === order._id || cancellingOrderId === order._id}>{cancellingOrderId === order._id ? 'Cancelling…' : 'Cancel order'}</button></div>}<Link to={`/orders/${order._id}`}>View details →</Link></div></article>)}</div>}</section></main>
}

export default Orders
