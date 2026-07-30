# Ghorer Bazar - E-Commerce Platform

A complete, production-ready e-commerce platform built with **Next.js 16**, **Tailwind CSS 4**, and **token-based authentication** (Sanctum-like). All data is managed through dummy JSON files, making it perfect for demos, testing, and learning.

## Features

### Authentication System
- **Token-based JWT authentication** with localStorage persistence
- Login and registration with demo accounts
- Protected checkout and order pages
- User context provider with auth state management
- Demo credentials: `ayesha@example.com` / `password123`

### Product Management
- **200+ products** across 10 categories
- Complete product details with images, ratings, and reviews
- Advanced filtering by category, price, and rating
- Search functionality across all products
- Product reviews and customer testimonials

### Shopping Experience
- Dynamic shopping cart with quantity management
- Real-time cart total calculations
- Persistent cart state using localStorage
- One-click add to cart from product listings
- Wishlist and share buttons

### Checkout System
- Complete checkout flow with address validation
- Multiple payment methods (Cash on Delivery, Online, bKash)
- Order review and confirmation
- Shipping cost calculation
- Order summary with itemized breakdown

### Testimonials & Reviews
- 10+ customer testimonials with rotating carousel
- Product reviews with ratings
- Customer details with professions
- Real customer feedback from dummy data

### Responsive Design
- Mobile-first design approach
- Fully responsive layouts for all screen sizes
- Touch-friendly navigation and buttons
- Optimized performance for all devices

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Homepage with hero, categories, products, testimonials
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts     # Login endpoint
│   │   │   └── register/route.ts  # Registration endpoint
│   │   ├── products/
│   │   │   ├── route.ts           # Products list with filters
│   │   │   └── [id]/route.ts      # Product details with reviews
│   │   ├── categories/route.ts    # Categories endpoint
│   │   └── testimonials/route.ts  # Testimonials endpoint
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Registration page
│   ├── products/page.tsx          # Products listing with filters
│   ├── product/[id]/page.tsx      # Product detail page
│   ├── cart/page.tsx              # Shopping cart page
│   └── checkout/page.tsx          # Checkout page
├── components/
│   ├── header.tsx                 # Navigation header with cart icon
│   └── footer.tsx                 # Footer with links and social
├── lib/
│   ├── auth-context.tsx           # Authentication context provider
│   ├── cart-context.tsx           # Shopping cart context provider
│   └── data/
│       ├── users.json             # 10 demo users
│       ├── products.json          # 200+ products
│       ├── categories.json        # 10 product categories
│       ├── brands.json            # 10 product brands
│       ├── reviews.json           # 10 product reviews
│       └── testimonials.json      # 10 customer testimonials
├── app/globals.css                # Theme configuration with design tokens
└── package.json                   # Dependencies
```

## Dummy Data

The project includes comprehensive dummy data for realistic testing:

- **10 Users**: Different roles, locations, and profiles
- **200+ Products**: Across 10 categories with pricing, ratings, and reviews
- **10 Categories**: Oil & Ghee, Honey, Dates, Spices, Nuts & Seeds, etc.
- **10 Brands**: Glarvest, Khejuri, Shomi, Honeyraj, and more
- **50+ Reviews**: Product ratings and customer feedback
- **10 Testimonials**: Customer stories and experiences

## Authentication

### Login Flow
1. User enters credentials (email/password)
2. API validates against dummy users.json
3. Token generated and stored in localStorage
4. User redirected to homepage with authenticated state

### Demo Accounts
Use any of these to test:
- Email: `ayesha@example.com` | Password: `password123` (Banker)
- Email: `fariha@example.com` | Password: `password123` (Entrepreneur)
- Email: `shahriar@example.com` | Password: `password123` (Service Holder)

### Registration
- New accounts are simulated (not persisted)
- All validation works with dummy data
- Perfect for demo and testing purposes

## API Routes

### Authentication
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List products with filters (category, search, sort, limit)
- `GET /api/products/[id]` - Get product details with reviews

### Categories & Testimonials
- `GET /api/categories` - List all categories
- `GET /api/testimonials` - List customer testimonials

## State Management

### Authentication Context
- Global auth state with useAuth hook
- Token persistence in localStorage
- Login/register/logout functions
- User session management

### Cart Context
- Global cart state with useCart hook
- Add/remove/update items
- Calculate totals and item count
- Cart persistence using localStorage

## Styling

- **Color Scheme**: Orange primary (#F97316) with warm, inviting palette
- **Typography**: Geist Sans for modern, clean appearance
- **Layout**: Flexbox-based responsive design
- **Theme**: Light background with high contrast for accessibility

## Getting Started

### Prerequisites
- Node.js 18+ with pnpm

### Installation
```bash
pnpm install
pnpm dev
```

### Access the Application
- Homepage: `http://localhost:3000`
- Products: `http://localhost:3000/products`
- Cart: `http://localhost:3000/cart`
- Login: `http://localhost:3000/auth/login`
- Register: `http://localhost:3000/auth/register`

## Demo Flow

1. **Browse Products**: Visit homepage or products page to see all items
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Check shopping cart with totals
4. **Checkout**: Login or register, then complete checkout
5. **Confirm Order**: See order confirmation page

## Technologies Used

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4 with semantic design tokens
- **State**: React Context API for auth and cart
- **Data**: JSON files with dummy data
- **Icons**: Lucide React for UI icons
- **Image**: Next.js Image component for optimization
- **Routing**: Next.js dynamic routing with parameters

## API Response Examples

### Login
```json
{
  "token": "eyJpZCI6MSwiZW1haWwiOiJheWVzaGFAZXhhbXBsZS5jb20ifQ==",
  "user": {
    "id": 1,
    "name": "Ayesha Khan",
    "email": "ayesha@example.com",
    "phone": "+880 1712345678",
    "role": "customer",
    "address": "Dhaka, Bangladesh"
  }
}
```

### Products List
```json
{
  "products": [
    {
      "id": 1,
      "name": "Deshi Mustard Oil 5 liter",
      "price": 1700,
      "originalPrice": 1750,
      "rating": 4.5,
      "reviews": 124,
      "badge": "Best Selling",
      ...
    }
  ],
  "total": 200
}
```

## Notes

- All data is dummy and not persisted to a real database
- Perfect for prototyping, demos, and learning
- No real payments are processed (demo mode)
- Orders are simulated and not stored
- Great starting point for a real e-commerce platform

## Future Enhancements

- Integrate real database (Neon, Supabase)
- Add payment gateway (Stripe, SSLCommerz)
- Implement admin dashboard
- Add inventory management
- Email notifications
- Order tracking
- User profile management
- Wishlist persistence

## License

Created with v0.app for demonstration purposes.
