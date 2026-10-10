import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getCurrentCustomer } from '../services/api'
import { useAppDispatch } from '../store/hooks'
import { fetchCart } from '../store/cartSlice'
import { fetchWishlist } from '../store/wishlistSlice'

function ProtectedRoute() {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const currentCustomer = await getCurrentCustomer()
        setCustomer(currentCustomer)
        dispatch(fetchCart())
        dispatch(fetchWishlist())
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
