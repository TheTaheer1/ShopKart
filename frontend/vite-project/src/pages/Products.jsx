import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/api'
import { useWishlist } from '../store/useWishlist'

const categories = ['Electronics', 'Fashion', 'Books', 'Home']

const sortProducts = (items, selectedSort) => {
  const sorted = [...items]

  if (!selectedSort) {
    return sorted
  }

  return sorted.sort((firstProduct, secondProduct) => {
    const firstPrice = Number(firstProduct.price) || 0
    const secondPrice = Number(secondProduct.price) || 0

    return selectedSort === 'price_asc'
      ? firstPrice - secondPrice
      : secondPrice - firstPrice
  })
}

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { wishlist } = useWishlist()
  const wishlistIds = useMemo(() => new Set(wishlist.map((product) => product._id)), [wishlist])

  useEffect(() => {
    let isCurrentRequest = true

    const loadProducts = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        const nextProducts = await getProducts({ search, category, sort })
        if (isCurrentRequest) setProducts(nextProducts)
      } catch {
        if (isCurrentRequest) setHasError(true)
      } finally {
        if (isCurrentRequest) setIsLoading(false)
      }
    }

    loadProducts()
    return () => { isCurrentRequest = false }
  }, [search, category, sort])

  const visibleProducts = useMemo(() => sortProducts(products, sort), [products, sort])

  return (
    <main className="catalog-page">
      <Navbar />
      <section className="catalog-content">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">THE SHOPKART EDIT</p>
            <h1>Find your next good thing.</h1>
          </div>
          <p className="catalog-count">{products.length} products</p>
        </div>

        <div className="catalog-controls" aria-label="Product filters">
          <label className="search-control">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All Categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort products</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {isLoading && <p className="catalog-message">Loading products...</p>}
        {!isLoading && hasError && <p className="catalog-message error-message">Something went wrong while loading products.</p>}
        {!isLoading && !hasError && visibleProducts.length === 0 && <p className="catalog-message">No products found.</p>}
        {!isLoading && !hasError && visibleProducts.length > 0 && (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Products
