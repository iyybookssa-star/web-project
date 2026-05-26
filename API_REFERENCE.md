# Partify API Reference

This document details the REST API endpoints exposed by the Partify backend server (running by default on `http://localhost:5000/api`).

---

## 🔐 Authorization Tiers

The API enforces access limits using custom Express middlewares (`server/middleware/auth.js`):
* **🟢 Public**: No authentication header required.
* **🔑 Authenticated**: Requires a valid JWT in the HTTP headers under `Authorization: Bearer <TOKEN>`.
* **🚨 Admin**: Requires a valid JWT, and the user's document must satisfy `isAdmin: true`.

---

## 👤 Authentication API (`/api/auth`)

### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Access**: 🟢 Public
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "603d2e9a72b8c92a24fa671a",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### 2. Login User
* **Endpoint**: `POST /api/auth/login`
* **Access**: 🟢 Public
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "603d2e9a72b8c92a24fa671a",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### 3. Get User Profile
* **Endpoint**: `GET /api/auth/profile`
* **Access**: 🔑 Authenticated
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "603d2e9a72b8c92a24fa671a",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  }
  ```

### 4. Logout User
* **Endpoint**: `POST /api/auth/logout`
* **Access**: 🟢 Public
* **Description**: Destroys active session cookies.
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 🚗 Products API (`/api/products`)

### 1. Get All Products
* **Endpoint**: `GET /api/products`
* **Access**: 🟢 Public
* **Query Parameters**:
  * `category` (string, optional): E.g. `'Engines'`, `'Brakes'`, `'Lighting'`, or `'All'`
  * `search` (string, optional): Text keyword matching the name, description, category, or part number.
  * `featured` (string, optional): Set to `'true'` to fetch featured products.
  * `limit` (number, optional): Max items per page (defaults to `20`).
  * `page` (number, optional): Active page offset (defaults to `1`).
  * `ids` (string, optional): Comma-separated list of product ObjectIds.
  * `make` (string, optional): E.g., `'Toyota'`, `'Ford'`. Matches product compatibility.
  * `year` (number, optional): E.g., `2018`. Matches compatibility year.
  * `model` (string, optional): E.g., `'Camry'`. Matches text substring search in name/description.
* **Success Response (200 OK)**:
  ```json
  {
    "products": [
      {
        "_id": "603d2e9a72b8c92a24fa672b",
        "name": "Ceramic Brake Pads Set",
        "partNumber": "BP-7890-C",
        "category": "Brakes",
        "price": 45.99,
        "originalPrice": 59.99,
        "description": "High performance brake pads...",
        "image": "/uploads/1620000000000-brake.png",
        "stock": 14,
        "rating": 4.8,
        "numReviews": 12,
        "compatibleMakes": ["Toyota", "Honda"],
        "compatibleYears": [2015, 2016, 2017, 2018],
        "isFeatured": true,
        "badge": "Sale"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

### 2. Get Single Product
* **Endpoint**: `GET /api/products/:id`
* **Access**: 🟢 Public
* **Success Response (200 OK)**: Product schema object.

---

## 🛒 Session-Based Cart API (`/api/cart`)

All cart routes write/read from the server-managed cookie session (`req.session.cart`).

### 1. Get Cart Items
* **Endpoint**: `GET /api/cart`
* **Access**: 🟢 Public (Session-tied)
* **Success Response (200 OK)**: Array of cart items.

### 2. Add Item to Cart
* **Endpoint**: `POST /api/cart`
* **Access**: 🟢 Public (Session-tied)
* **Request Body**:
  ```json
  {
    "_id": "603d2e9a72b8c92a24fa672b",
    "name": "Ceramic Brake Pads Set",
    "partNumber": "BP-7890-C",
    "price": 45.99,
    "image": "/uploads/1620000000000-brake.png",
    "qty": 2
  }
  ```
* **Success Response (200 OK)**: Updated cart array.

### 3. Update Cart Item Quantity
* **Endpoint**: `PUT /api/cart/:id` (where `:id` is the product ObjectId)
* **Access**: 🟢 Public (Session-tied)
* **Request Body**:
  ```json
  {
    "qty": 3
  }
  ```
* **Success Response (200 OK)**: Updated cart array. If `qty <= 0`, item is removed.

### 4. Remove Cart Item
* **Endpoint**: `DELETE /api/cart/:id`
* **Access**: 🟢 Public (Session-tied)
* **Success Response (200 OK)**: Updated cart array.

### 5. Clear Cart
* **Endpoint**: `DELETE /api/cart`
* **Access**: 🟢 Public (Session-tied)
* **Success Response (200 OK)**: Empty array `[]`.

---

## ❤️ Favorites API (`/api/favorites`)

### 1. Get Favorites
* **Endpoint**: `GET /api/favorites`
* **Access**: 🔑 Authenticated
* **Success Response (200 OK)**: List of populated favorited product objects.

### 2. Toggle Favorite Status
* **Endpoint**: `POST /api/favorites/:productId`
* **Access**: 🔑 Authenticated
* **Success Response (200 OK)**:
  ```json
  {
    "isFavorite": true,
    "favorites": ["603d2e9a72b8c92a24fa672b"]
  }
  ```

### 3. Check if Product is Favorited
* **Endpoint**: `GET /api/favorites/check/:productId`
* **Access**: 🔑 Authenticated
* **Success Response (200 OK)**:
  ```json
  {
    "isFavorite": true
  }
  ```

---

## 📦 Orders API (`/api/orders`)

### 1. Create New Order
* **Endpoint**: `POST /api/orders`
* **Access**: 🔑 Authenticated
* **Request Body**:
  ```json
  {
    "orderItems": [
      {
        "product": "603d2e9a72b8c92a24fa672b",
        "name": "Ceramic Brake Pads Set",
        "image": "/uploads/1620000000000-brake.png",
        "price": 45.99,
        "qty": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101",
      "country": "US"
    },
    "paymentMethod": "Card",
    "itemsPrice": 91.98,
    "shippingPrice": 5.00,
    "taxPrice": 8.28,
    "totalPrice": 105.26
  }
  ```
* **Success Response (201 Created)**: Created order document.

### 2. Get User-Specific Orders
* **Endpoint**: `GET /api/orders/myorders`
* **Access**: 🔑 Authenticated
* **Success Response (200 OK)**: Array of order documents belonging to the authenticated user.

### 3. Get Order by ID
* **Endpoint**: `GET /api/orders/:id`
* **Access**: 🔑 Authenticated
* **Success Response (200 OK)**: Complete order details.

---

## 🚨 Admin API (`/api/admin`)

*All routes require Admin Authorization (`isAdmin === true`).*

### 1. Get Dashboard Stats
* **Endpoint**: `GET /api/admin/stats`
* **Success Response (200 OK)**:
  ```json
  {
    "productCount": 24,
    "orderCount": 18,
    "userCount": 9,
    "revenue": 1420.50,
    "recentOrders": [...]
  }
  ```

### 2. Reset Revenue Stats
* **Endpoint**: `POST /api/admin/reset-revenue`
* **Description**: Sets all `'Delivered'` orders back to `'Pending'` and clears the revenue tracking flag.
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Revenue cleared"
  }
  ```

### 3. Upload Product Image File
* **Endpoint**: `POST /api/admin/upload`
* **Request Header**: `Content-Type: multipart/form-data`
* **Request Payload**: File binary under the key `image`.
* **Success Response (200 OK)**:
  ```json
  {
    "imageUrl": "/uploads/1620000000000-filename.png"
  }
  ```

### 4. Manage Orders Status
* **Endpoint**: `PUT /api/admin/orders/:id/status`
* **Request Body**:
  ```json
  {
    "status": "Delivered"
  }
  ```
* **Success Response (200 OK)**: Updated order document.

### 5. Get All Users
* **Endpoint**: `GET /api/admin/users`
* **Success Response (200 OK)**: Array of all user documents (passwords excluded).

### 6. Toggle User Admin Status
* **Endpoint**: `PUT /api/admin/users/:id/toggle-admin`
* **Success Response (200 OK)**: Updated user document.

### 7. Delete User
* **Endpoint**: `DELETE /api/admin/users/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "message": "User deleted"
  }
  ```

---

## 📧 Newsletter API (`/api/newsletter`)

### 1. Subscribe to Newsletter
* **Endpoint**: `POST /api/newsletter/subscribe`
* **Access**: 🟢 Public
* **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Subscription successful! Check your inbox."
  }
  ```
