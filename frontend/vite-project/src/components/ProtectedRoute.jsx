import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentCustomer } from '../services/api'
import { preloadInitialProducts } from '../services/productCache'
import { useAppDispatch } from '../store/hooks'
import { fetchCart } from '../store/cartSlice'
import { fetchWishlist } from '../store/wishlistSlice'

function ProtectedRoute() {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const initialPath = useRef(location.pathname)

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const currentCustomer = await getCurrentCustomer()
        setCustomer(currentCustomer)
        const requests = [dispatch(fetchCart()).unwrap(), dispatch(fetchWishlist()).unwrap()]
        if (initialPath.current === '/products') requests.push(preloadInitialProducts())
        // Data prefetch failures are handled by each page's error state; they
        // must not turn a valid authenticated session into a login redirect.
        await Promise.allSettled(requests)
      } catch {
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [dispatch])

  if (isLoading) {
    return <main className="loading-screen"><p>Loading your ShopKart...</p></main>
  }

  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return <Outlet context={{ customer }} />
}

export default ProtectedRoute
