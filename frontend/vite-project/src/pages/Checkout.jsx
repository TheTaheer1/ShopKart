import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../store/useCart'
import { createPaymentOrder, verifyPayment } from '../services/api'
import { loadRazorpay } from '../utils/razorpay'

const initialAddress = { fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }

function Checkout() {
  const { customer } = useOutletContext()
  const { cartItems, subtotal, totalItems, refreshCart, isCartLoading } = useCart()
  const [address, setAddress] = useState({ ...initialAddress, fullName: customer.fullName || '', phone: customer.phone || '' })
  const [errors, setErrors] = useState({})
  const [isPaying, setIsPaying] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const navigate = useNavigate()
  const total = useMemo(() => subtotal.toLocaleString('en-IN'), [subtotal])

  const validate = () => {
    const nextErrors = {}
    Object.entries(address).forEach(([field, value]) => { if (!value.trim()) nextErrors[field] = 'This field is required.' })
    if (address.phone && !/^\d{10}$/.test(address.phone)) nextErrors.phone = 'Phone must contain 10 digits.'
    if (address.pincode && !/^\d{6}$/.test(address.pincode)) nextErrors.pincode = 'Pincode must contain 6 digits.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPaymentError('')
    setIsPaying(true)
    try {
      const paymentOrder = await createPaymentOrder(address)
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Unable to load Razorpay Checkout. Check your connection and try again.')
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'ShopKart',
        description: `${totalItems} item${totalItems === 1 ? '' : 's'} from ShopKart`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#202421' },
        handler: async (response) => {
          setIsConfirming(true)
          try {
            const order = await verifyPayment(response)
            await refreshCart()
            navigate(`/order-success/${order._id}`, { replace: true, state: { order } })
          } catch (error) {
            setPaymentError(error.response?.data?.message || 'We are still confirming your payment. Please check My Orders before trying again.')
          } finally {
            setIsConfirming(false)
            setIsPaying(false)
          }
        },
        modal: { ondismiss: () => { setIsConfirming(false); setIsPaying(false) } }
      })
      razorpay.open()
    } catch (error) {
      setPaymentError(error.response?.data?.message || error.message || 'Unable to start payment. Please try again.')
      setIsConfirming(false)
      setIsPaying(false)
    }
  }

  if (isCartLoading) return <main className="catalog-page"><Navbar /><section className="checkout-page"><p className="catalog-message">Loading checkout...</p></section></main>
  if (isConfirming) return <main className="catalog-page"><Navbar /><section className="success-page payment-confirming" aria-live="polite"><span className="payment-confirming-spinner" aria-hidden="true" /><p className="eyebrow">PAYMENT SUCCESSFUL</p><h1>Confirming your order…</h1><p>We’re securely finalizing your order. Please don’t close this window.</p></section></main>
  if (!cartItems.length) return <main className="catalog-page"><Navbar /><section className="checkout-page wishlist-state"><h1>Your cart is empty</h1><p>Add products before checking out.</p><Link className="button button-primary" to="/products">Browse Products →</Link></section></main>

  return <main className="catalog-page"><Navbar /><section className="checkout-page"><Link className="back-link" to="/cart">← Back to cart</Link><div className="checkout-heading"><p className="eyebrow">SECURE CHECKOUT</p><h1>Shipping & payment</h1></div><form className="checkout-layout" onSubmit={placeOrder}><div className="checkout-form"><h2>Shipping details</h2>{Object.entries({ fullName: 'Full name', phone: 'Phone number', addressLine1: 'Address line', city: 'City', state: 'State', pincode: 'Pincode' }).map(([field, label]) => <label key={field}>{label}<input value={address[field]} inputMode={field === 'phone' || field === 'pincode' ? 'numeric' : undefined} onChange={(event) => setAddress((current) => ({ ...current, [field]: event.target.value }))} />{errors[field] && <span className="field-error">{errors[field]}</span>}</label>)}{paymentError && <p className="form-error" role="alert">{paymentError}</p>}</div><aside className="order-summary checkout-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Review your order</h2>{cartItems.map((item) => <div className="checkout-line" key={item.product._id}><span>{item.product.name} × {item.quantity}</span><strong>₹{((Number(item.product.price) || 0) * item.quantity).toLocaleString('en-IN')}</strong></div>)}<div><span>Total</span><strong>₹{total}</strong></div><p className="summary-note">Payments are securely processed by Razorpay Test Mode.</p><button className="button button-primary" type="submit" disabled={isPaying}>{isPaying ? 'Opening payment…' : 'Pay securely with Razorpay →'}</button></aside></form></section></main>
}

export default Checkout
