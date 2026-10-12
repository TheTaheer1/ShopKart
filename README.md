# ShopKart

ShopKart is a production-style ecommerce application with authentication, product browsing, Cloudinary image uploads, wishlist, shopping cart, Razorpay checkout, orders, admin order management, and real-time order updates with Socket.IO.

## Features

- Customer registration, login, logout, and protected routes
- Product search, category filtering, sorting, details, and stock status
- Wishlist and cart with quantity controls and live item counts
- Cloudinary-backed product image uploads for administrators
- Razorpay payment flow with payment verification, retry, and cancellation for pending orders
- Customer order history and detailed order pages
- Admin product creation and customer order dashboard
- Socket.IO order updates for admin dashboards
- Responsive desktop and mobile UI with mobile bottom navigation

## Project structure

```text
ShopKart/
├── backend/                 # Express API, MongoDB, authentication, payments
└── frontend/vite-project/   # React + Vite client
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas (or a local MongoDB server)
- Cloudinary account for product images
- Razorpay account for checkout (test keys are sufficient for development)

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/TheTaheer1/ShopKart.git
cd ShopKart

cd backend
npm install

cd ../frontend/vite-project
npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env` locally. Never commit this file:

```env
dbUrl=mongodb+srv://<username>:<password>@<cluster>/<database>
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=<long-random-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
RAZORPAY_KEY_ID=rzp_test_<key>
RAZORPAY_KEY_SECRET=<razorpay-secret>
```

### 3. Configure the frontend

```bash
cd frontend/vite-project
cp .env.example .env.local
```

For local development:

```env
VITE_API_URL=http://localhost:8088
```

### 4. Run both applications

In terminal 1:

```bash
cd backend
npm start
```

In terminal 2:

```bash
cd frontend/vite-project
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API overview

The backend runs on port `8088` by default.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| GET | `/products` | Public | List products |
| GET | `/products/:id` | Public | Product details |
| POST | `/customers/register` | Public | Create an account |
| POST | `/customers/login` | Public | Start a session |
| GET | `/customers/me` | Logged in | Current customer |
| POST | `/customers/logout` | Logged in | End a session |
| GET/POST/DELETE | `/wishlist` | Logged in | Manage wishlist |
| GET/POST/PATCH/DELETE | `/cart` | Logged in | Manage cart |
| GET | `/orders` | Logged in | Customer orders |
| POST | `/orders/create-payment-order` | Logged in | Start Razorpay checkout |
| POST | `/orders/verify-payment` | Logged in | Verify payment |
| POST | `/products` | Admin | Create a product |
| POST | `/products/upload-image` | Admin | Upload image to Cloudinary |
| GET | `/orders/admin` | Admin | View all customer orders |

Authentication uses an HTTP-only cookie. The production cookie is secure, cross-site compatible, and valid for 10 days.

## Production deployment

### Backend on Render

Configure the Render web service with:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Set the backend environment variables from `backend/.env.example` in Render. Use:

```env
NODE_ENV=production
FRONTEND_URL=https://<your-vercel-domain>
```

Add the deployed frontend origin to MongoDB Atlas Network Access and keep all secret values in Render environment variables only.

### Frontend on Vercel

Set the project root directory to `frontend/vite-project` and add:

```env
VITE_API_URL=https://<your-render-service>.onrender.com
```

Build command: `npm run build`  
Output directory: `dist`

After changing Vercel environment variables, redeploy the project.

## Security checklist

- `.env` and `.env.*` files are ignored by Git; only placeholder examples are committed.
- Never put MongoDB, JWT, Cloudinary secret, or Razorpay secret values in frontend code.
- Use test Razorpay keys locally and production keys only in Render secrets.
- Product creation and image upload require an authenticated admin account.
- Wishlist, cart, and order routes require a logged-in customer.
- Keep `FRONTEND_URL` restricted to the real frontend origin instead of allowing every origin.

## Useful commands

```bash
# Frontend production build
cd frontend/vite-project && npm run build

# Frontend lint
cd frontend/vite-project && npm run lint

# Check tracked files for environment files
git ls-files | grep -E '(^|/)(\.env|.*\.env)$' || true
```
