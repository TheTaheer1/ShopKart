import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addProductToCart, getCart, removeProductFromCart, updateCartQuantity } from '../services/api'

export const fetchCart = createAsyncThunk('cart/fetchCart', getCart)
export const addToCart = createAsyncThunk('cart/addToCart', addProductToCart)
export const updateQuantity = createAsyncThunk('cart/updateQuantity', ({ productId, quantity }) => updateCartQuantity(productId, quantity))
export const removeFromCart = createAsyncThunk('cart/removeFromCart', removeProductFromCart)

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: true, error: '' },
  reducers: { clearCart: (state) => { state.items = [] } },
  extraReducers: (builder) => {
    // `loading` is reserved for the first/full cart fetch. Mutations should
    // keep the existing cart rendered so quantity changes don't flash the
    // whole page with “Loading your cart...”. CartItem owns its small
    // per-row updating state while the request is in flight.
    const fetchPending = (state) => { state.loading = true; state.error = '' }
    const mutationPending = (state) => { state.error = '' }
    const fulfilled = (state, action) => { state.loading = false; state.items = action.payload }
    const rejected = (fallback) => (state, action) => { state.loading = false; state.error = action.payload || fallback }
    builder.addCase(fetchCart.pending, fetchPending).addCase(fetchCart.fulfilled, fulfilled).addCase(fetchCart.rejected, rejected('Unable to load your cart.'))
      .addCase(addToCart.pending, mutationPending).addCase(addToCart.fulfilled, fulfilled).addCase(addToCart.rejected, rejected('Unable to update your cart. Please try again.'))
      .addCase(updateQuantity.pending, mutationPending).addCase(updateQuantity.fulfilled, fulfilled).addCase(updateQuantity.rejected, rejected('Unable to update your cart. Please try again.'))
      .addCase(removeFromCart.pending, mutationPending).addCase(removeFromCart.fulfilled, fulfilled).addCase(removeFromCart.rejected, rejected('Unable to update your cart. Please try again.'))
  }
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer

export const selectCart = (state) => state.cart.items
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error
export const selectTotalItems = (state) => state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectSubtotal = (state) => state.cart.items.reduce((total, item) => total + ((Number(item.product?.price) || 0) * item.quantity), 0)
