import { Navigate, Outlet, useOutletContext } from 'react-router-dom'

function AdminRoute() {
  const { customer } = useOutletContext()

  if (!customer.isAdmin) {
    return <Navigate to="/products" replace state={{ message: 'Admin access is required to add products.' }} />
  }

  return <Outlet context={{ customer }} />
}

export default AdminRoute
