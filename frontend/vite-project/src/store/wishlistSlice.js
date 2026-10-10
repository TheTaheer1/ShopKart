import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addProductToWishlist, getWishlist, removeProductFromWishlist } from '../services/api'

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', getWishlist)
export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId, { rejectWithValue }) => {
  try { await addProductToWishlist(productId); return getWishlist() } catch (error) { return rejectWithValue(error.response?.data?.message || 'Unable to save product. Please try again.') }
})
export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', removeProductFromWishlist)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: true, error: '' },
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = '' }
    const fulfilled = (state, action) => { state.loading = false; state.items = action.payload }
    const rejected = (fallback) => (state, action) => { state.loading = false; state.error = action.payload || fallback }
    builder.addCase(fetchWishlist.pending, pending).addCase(fetchWishlist.fulfilled, fulfilled).addCase(fetchWishlist.rejected, rejected("We couldn't load your wishlist."))
      .addCase(addToWishlist.pending, pending).addCase(addToWishlist.fulfilled, fulfilled).addCase(addToWishlist.rejected, rejected('Unable to save product. Please try again.'))
      .addCase(removeFromWishlist.pending, pending).addCase(removeFromWishlist.fulfilled, (state, action) => { state.loading = false; state.items = state.items.filter((product) => product._id !== action.meta.arg) }).addCase(removeFromWishlist.rejected, rejected('Unable to remove product. Please try again.'))
  }
})

export default wishlistSlice.reducer
export const selectWishlist = (state) => state.wishlist.items
export const selectWishlistLoading = (state) => state.wishlist.loading
export const selectWishlistError = (state) => state.wishlist.error
export const selectWishlistCount = (state) => state.wishlist.items.length
