const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: [allowedOrigin, "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (stored in MongoDB via connect-mongo)
app.use(
  session({
    secret: process.env.JWT_SECRET || "partify_session_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
    },
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Partify API is running 🚗" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Partify server running on http://localhost:${PORT}`);
});
