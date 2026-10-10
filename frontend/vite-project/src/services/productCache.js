import { getProducts } from './api'

let initialProducts = null
let initialProductsRequest = null

export const preloadInitialProducts = () => {
  if (initialProducts) return Promise.resolve(initialProducts)
  if (!initialProductsRequest) {
    initialProductsRequest = getProducts().then((products) => {
      initialProducts = products
      return products
    })
  }
  return initialProductsRequest
}

export const getInitialProducts = () => initialProducts
