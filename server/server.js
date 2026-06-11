const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "https://iyybookssa-star.github.io",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
      // 7 days persistent cookie so session doesn't clear when browser closes
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Partify API is running 🚗" });
});

// Serve React client in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
} else {
  // 404 handler (dev only — in prod the client handles routing)
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Partify server running on http://localhost:${PORT}`);
});
