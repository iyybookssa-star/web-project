# Partify System Architecture

Partify is a full-stack, web-based e-commerce platform for purchasing car parts. It uses a decoupled client-server architecture built on the MERN stack (MongoDB, Express, React, Node.js).

---

## 📂 Project Directory Structure

```text
javap/
├── client/                 # Frontend React Application (Vite + Tailwind CSS)
│   ├── public/             # Static public assets (images, logos, etc.)
│   ├── src/
│   │   ├── api/            # Axios API config
│   │   ├── components/     # Reusable layout and UI components (Navbar, Footer, etc.)
│   │   ├── context/        # React Context providers for global state management
│   │   ├── pages/          # Individual screen/page views
│   │   ├── utils/          # Client-side helper functions (PDF receipts, cookies)
│   │   ├── App.jsx         # App routing and layout root
│   │   ├── index.css       # Tailwind directives and custom global styles
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Backend REST API (Node.js + Express + MongoDB)
│   ├── config/             # Database connection setups
│   ├── middleware/         # Custom authentication and security middleware
│   ├── models/             # Mongoose schemas for MongoDB
│   ├── routes/             # REST API endpoint routers grouped by entity
│   ├── seed/               # Initial database seed data and scripts
│   ├── uploads/            # Local directory for uploaded product image files
│   ├── server.js           # Server application entry point
│   └── package.json
│
├── Dockerfile              # Containerization recipe
├── render.yaml             # Render deployment configuration
└── README.md               # Main setup and run guide
```

---

## 🗄️ Database Models & Relationships

Partify uses MongoDB with Mongoose object modeling to represent the e-commerce data:

### 1. User (`server/models/User.js`)
* **Purpose**: Stores registration details, authentication data, and privileges.
* **Fields**: `name`, `email`, `password` (hashed with bcryptjs), and `isAdmin` (boolean flag for admin panels).
* **Hooks**: `pre('save')` automatically hashes password modifications.

### 2. Product (`server/models/Product.js`)
* **Purpose**: Defines individual auto parts, categories, and vehicle compatibility.
* **Fields**: `name`, `partNumber` (unique string key), `category` (enum of parts categories), `price`, `originalPrice` (for discounts), `description`, `image` (file path URL), `stock` (inventory limit), `rating`/`numReviews`, `compatibleMakes` (array of compatible manufacturers), and `compatibleYears` (array of years).

### 3. Order (`server/models/Order.js`)
* **Purpose**: Records completed purchases, payment statuses, and shipping addresses.
* **Fields**:
  * `user`: Mongoose ObjectId referencing a `User`.
  * `items`: Embedded array of `orderItemSchema` (contains product ID, name, image, price, and quantity).
  * `shippingAddress`: Nested object (`street`, `city`, `state`, `zip`, `country`).
  * `paymentMethod`: Usually `'Card'`.
  * Pricing fields: `itemsPrice`, `shippingPrice`, `taxPrice`, `totalPrice`.
  * Status flags: `isPaid` (boolean + `paidAt`), `isDelivered` (boolean + `deliveredAt`), and `status` (enum: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

---

## 🔐 Authentication & Session Flow

Authentication is built using two complementary mechanisms:
1. **JSON Web Tokens (JWT)**: Passed on login/register to authenticate individual operations.
2. **MongoDB-Backed Sessions (`express-session` + `connect-mongo`)**:
   * Sessions are created on server connection.
   * Session states (including guest cart configurations) are serialized to the `sessions` collection in MongoDB.
   * Persistent cookies are configured with a Time-To-Live (TTL) of 7 days to maintain session state even when the user closes their browser.

### Authentication Middleware (`server/middleware/auth.js`)
* `protect`: Verifies that a valid JWT token is sent in the request header (`Bearer token`). If valid, adds the decoded user document to the `req.user` context.
* `admin`: Verifies that the authenticated `req.user` has `isAdmin === true`.

---

## 🌐 Client-Side State Management (React Contexts)

To share data globally across views without prop drilling, the client implements three React Contexts:

### 1. AuthContext (`client/src/context/AuthContext.jsx`)
* Manages the active logged-in user state.
* Syncs the user data to `localStorage` to keep the user authenticated across page refreshes.
* Exposes `login`, `register`, and `logout` operations.

### 2. CartContext (`client/src/context/CartContext.jsx`)
* Manages the shopping cart lifecycle.
* Implements a **dual-state sync logic**:
  * **Guest Users**: Cart items are stored inside the browser's `localStorage` and synchronized with session cookies.
  * **Logged-in Users**: Cart items are persisted directly in the backend database.
  * **Merge Event**: When a guest user logs in, their local guest cart is merged with their database cart automatically.

### 3. FavoritesContext (`client/src/context/FavoritesContext.jsx`)
* Manages the user's bookmarked or favorited products.
* Syncs with the server database endpoints to save user bookmarks persistently.

---

## 🚚 Image Upload Flow
Product images are uploaded dynamically in the admin dashboard:
1. The admin selects a file to upload.
2. The client submits a `multipart/form-data` POST request to `/api/admin/upload`.
3. The server uses **Multer** to validate the file extension (accepts JPEG, PNG, GIF, WebP) and size limit (max 5MB).
4. Valid files are written to the local disk at `server/uploads/` with a unique timestamped filename.
5. The API responds with the file path (`/uploads/unique-name.jpg`), which is then saved in the product document's `image` field.
