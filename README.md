# Partify 🚗💨

Partify is a modern e-commerce platform dedicated to selling car parts. It features a responsive user interface, secure authentication, and a robust backend for managing products and orders.

## 🚀 Technologies Used

### Frontend
- **React**: Library for building user interfaces.
- **Vite**: Next Generation Frontend Tooling for fast builds.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **React Router**: Declarative routing for React applications.
- **Axios**: Promise based HTTP client for the browser and node.js.
- **React Hot Toast**: Beautiful notifications for React.
- **jsPDF**: Client-side PDF generation (used for receipts).
- **@react-mapox-maps/api**: mapox Maps integration.

### Backend
- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for flexible data storage (using **Mongoose** for modeling).
- **JWT (JSON Web Tokens)**: Securely transmitting information between parties as a JSON object (Authentication).
- **Bcryptjs**: Library for hashing passwords.

## ✨ Key Features
- **User Authentication**: Secure login and registration using JWT.
- **Product Catalog**: Browse and search a wide variety of car parts.
- **Shopping Cart**: easy-to-use cart for managing selected items.
- **Order Management**: Streamlined checkout and order tracking.
- **Admin Dashboard**: Tools for managing products and orders (implied).
- **Receipt Generation**: Downloadable PDF receipts for orders.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠️ Installation & Setup

Prerequisites: Node.js and MongoDB installed locally or valid MongoDB URI.

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd partify
    ```

2.  **Server Setup**
    Navigate to the server directory and install dependencies:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Client Setup**
    Open a new terminal, navigate to the client directory and install dependencies:
    ```bash
    cd ../client
    npm install
    ```
    Start the client application:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📄 Scripts

### Server
- `npm start`: Runs the server in production mode.
- `npm run dev`: Runs the server in development mode with Nodemon.
- `npm run seed`: Seeds the database with initial data.

### Client
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.
"# web-project" 
