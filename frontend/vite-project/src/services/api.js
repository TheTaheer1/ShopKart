import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8088/',
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export const getCurrentCustomer = async () => {
  const response = await api.get('/customers/me')
  return response.data.customerData
}

export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout')
  return response.data
}

export const getProducts = async ({ search = '', category = '', sort = '' } = {}) => {
  const response = await api.get('/products', {
    params: { search: search || undefined, category: category || undefined, sort: sort || undefined },
  })
  return response.data.products
}

export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`)
  return response.data.product
}

export const addProductToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`)
  return response.data
}

export const getWishlist = async () => {
  const response = await api.get('/wishlist')
  return response.data.wishlist
}

export const removeProductFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`)
  return response.data
}

export const uploadProductImage = async (imageFile) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  const response = await api.post('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.image
}

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData)
  return response.data.product
}

export const getCart = async () => {
  const response = await api.get('/cart')
  return response.data.cart
}

export const addProductToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`)
  return response.data.cart
}

export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity })
  return response.data.cart
}

export const removeProductFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`)
  return response.data.cart
}

export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', { shippingAddress })
  return response.data
}

export const verifyPayment = async (paymentDetails) => {
  const response = await api.post('/orders/verify-payment', paymentDetails)
  return response.data.order
}

export const retryPayment = async (orderId) => {
  const response = await api.post(`/orders/retry-payment/${orderId}`)
  return response.data
}

export const cancelPendingOrder = async (orderId) => {
  const response = await api.post(`/orders/cancel/${orderId}`)
  return response.data.order
}

export const getOrders = async () => {
  const response = await api.get('/orders')
  return response.data.orders
}

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data.order
}

export const getAllOrders = async () => {
  const response = await api.get('/orders/admin')
  return response.data.orders
}
