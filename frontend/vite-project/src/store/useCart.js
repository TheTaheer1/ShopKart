import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { addToCart, clearCart, fetchCart, removeFromCart, selectCart, selectCartError, selectCartLoading, selectSubtotal, selectTotalItems, updateQuantity } from './cartSlice'

export const useCart = () => {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(selectCart)
  return {
    cartItems,
    isCartLoading: useAppSelector(selectCartLoading),
    cartError: useAppSelector(selectCartError),
    totalItems: useAppSelector(selectTotalItems),
    subtotal: useAppSelector(selectSubtotal),
    refreshCart: useCallback(() => dispatch(fetchCart()).unwrap(), [dispatch]),
    addToCart: useCallback((productId) => dispatch(addToCart(productId)).unwrap(), [dispatch]),
    updateQuantity: useCallback((productId, quantity) => dispatch(updateQuantity({ productId, quantity })).unwrap(), [dispatch]),
    removeFromCart: useCallback((productId) => dispatch(removeFromCart(productId)).unwrap(), [dispatch]),
    clearCart: useCallback(() => dispatch(clearCart()), [dispatch])
  }
}
