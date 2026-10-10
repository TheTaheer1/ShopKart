import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { addToWishlist, fetchWishlist, removeFromWishlist, selectWishlist, selectWishlistCount, selectWishlistError, selectWishlistLoading } from './wishlistSlice'

export const useWishlist = () => {
  const dispatch = useAppDispatch()
  return {
    wishlist: useAppSelector(selectWishlist),
    wishlistCount: useAppSelector(selectWishlistCount),
    isWishlistLoading: useAppSelector(selectWishlistLoading),
    wishlistError: useAppSelector(selectWishlistError),
    refreshWishlist: useCallback(() => dispatch(fetchWishlist()).unwrap(), [dispatch]),
    addToWishlist: useCallback((productId) => dispatch(addToWishlist(productId)).unwrap(), [dispatch]),
    removeFromWishlist: useCallback((productId) => dispatch(removeFromWishlist(productId)).unwrap(), [dispatch])
  }
}
