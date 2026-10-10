import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { logoutCustomer } from '../services/api'
import { useCart } from '../store/useCart'
import { useWishlist } from '../store/useWishlist'

function Navbar() {
  const navigate = useNavigate()
  const { customer } = useOutletContext()
  const { totalItems } = useCart()
  const { wishlistCount } = useWishlist()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?')
    if (!shouldLogout) return

    try {
      await logoutCustomer()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="ShopKart home">
        <span className="brand-mark">S</span>
        <span>ShopKart</span>
      </Link>
      <button className="menu-toggle" type="button" aria-expanded={isMenuOpen} aria-controls="primary-navigation" aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setIsMenuOpen((open) => !open)}>
        <span /><span /><span />
      </button>
      <nav id="primary-navigation" className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`} aria-label="Primary navigation">
        <Link onClick={() => setIsMenuOpen(false)} to="/products">Products</Link>
        <Link onClick={() => setIsMenuOpen(false)} to="/wishlist">Wishlist ({wishlistCount})</Link>
        <Link onClick={() => setIsMenuOpen(false)} to="/cart">Cart ({totalItems})</Link>
        <Link onClick={() => setIsMenuOpen(false)} to="/orders">Orders</Link>
        {customer?.isAdmin && <Link onClick={() => setIsMenuOpen(false)} to="/products/new">Add product</Link>}
        {customer?.isAdmin && <Link onClick={() => setIsMenuOpen(false)} to="/admin/orders">Admin orders</Link>}
      </nav>
      <button className="button button-quiet logout-button" type="button" onClick={handleLogout}>
        Log out <span aria-hidden="true">↗</span>
      </button>
    </header>
  )
}

export default Navbar
