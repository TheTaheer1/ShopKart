import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'
import { useWishlist } from '../store/useWishlist'

function Wishlist() {
  const { wishlist, isWishlistLoading: isLoading, wishlistError, removeFromWishlist, refreshWishlist } = useWishlist()

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId)
  }

  return (
    <main className="catalog-page">
      <Navbar />
      <section className="catalog-content wishlist-content">
        <Link className="back-link" to="/products">← Back to shop</Link>
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">SAVED FOR LATER</p>
            <h1>My Wishlist</h1>
          </div>
          {!isLoading && !wishlistError && (
            <div className="wishlist-heading-actions">
              <p className="catalog-count">{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p>
              <Link className="continue-shopping-link" to="/products">Continue shopping →</Link>
            </div>
          )}
        </div>

        {isLoading && <p className="catalog-message">Loading your wishlist...</p>}
        {!isLoading && wishlistError && wishlist.length === 0 && (
          <div className="wishlist-state">
            <h2>Something went wrong.</h2>
            <p>We couldn't load your wishlist.</p>
            <button className="button button-primary" type="button" onClick={() => refreshWishlist().catch(() => {})}>Try Again</button>
          </div>
        )}
        {!isLoading && !wishlistError && wishlist.length === 0 && (
          <div className="wishlist-state">
            <span className="empty-heart" aria-hidden="true">♡</span>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link className="button button-primary" to="/products">Browse Products <span aria-hidden="true">→</span></Link>
          </div>
        )}
        {wishlist.length > 0 && (
          <div className="product-grid">
            {wishlist.map((product) => <WishlistCard key={product._id} product={product} onRemove={handleRemove} />)}
          </div>
        )}
        {!isLoading && wishlistError && wishlist.length > 0 && <p className="catalog-refreshing" role="alert">{wishlistError}</p>}
      </section>
    </main>
  )
}

export default Wishlist
