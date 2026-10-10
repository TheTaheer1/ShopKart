import { Link, useOutletContext } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Home() {
  const { customer } = useOutletContext()

  return (
    <main className="home-page">
      <Navbar />

      <section className="home-content">
        <p className="eyebrow">YOUR EVERYDAY MARKETPLACE</p>
        <h1>Make room for the good stuff.</h1>
        <p className="home-lede">
          Welcome back, {customer.fullName}. Your next great find is waiting.
        </p>

        <article className="profile-card">
          <div className="profile-avatar" aria-hidden="true">
            {customer.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="eyebrow">SHOPKART MEMBER</p>
            <h2>{customer.fullName}</h2>
          </div>

          <dl className="profile-details">
            <div>
              <dt>Email</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{customer.phone}</dd>
            </div>
          </dl>
        </article>

        <Link className="button button-primary" to="/products">
          Start exploring <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  )
}

export default Home