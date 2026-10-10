import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="eyebrow">ERROR 404</p>
        <p className="not-found-number" aria-hidden="true">404</p>
        <h1>We couldn’t find that page.</h1>
        <p>The page may have moved, or the link may be incorrect. Let’s get you back to something useful.</p>
        <div className="not-found-actions">
          <Link className="button button-primary" to="/">Back home <span aria-hidden="true">→</span></Link>
          <Link className="not-found-secondary" to="/products">Browse products</Link>
        </div>
      </div>
    </main>
  )
}

export default NotFound
