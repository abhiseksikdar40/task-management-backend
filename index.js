const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const JWT = require("jsonwebtoken");
const Signup = require("./models/Signup.models");
const { taskManagementData } = require("./db/db.connect");

const app = express();
taskManagementData();
app.use(express.json());

// ✅ CORS Middleware Setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-management-frontend-taupe-eight.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ JWT Secret
const JWT_SECRET = "Your_jwt_secret";

// ✅ Signup Route
app.post("/v1/signup/user", async (req, res) => {
  const { fullname, useremail, userpassword } = req.body;

  if (!fullname || !useremail || !userpassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newUser = new Signup({ fullname, useremail, userpassword });
    await newUser.save();

    const token = JWT.sign({ email: useremail }, JWT_SECRET, {
      expiresIn: "24h"
    });

    res.status(201).json({
      message: "User Created Successfully.",
      user: newUser,
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed To Create User!" });
  }
});

// ✅ Login Route
app.post("/v1/login/user", async (req, res) => {
  const { useremail, userpassword } = req.body;

  if (!useremail || !userpassword) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await Signup.findOne({ useremail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.userpassword !== userpassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = JWT.sign({ email: user.useremail }, JWT_SECRET, {
      expiresIn: "24h"
    });

    res.status(200).json({
      message: "Login successful",
      user,
      token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// ✅ JWT Middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided!" });
  }

  try {
    const decoded = JWT.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verify Error:", error.message);
    return res.status(403).json({ message: "Invalid Token!" });
  }
};

// ✅ Protected Route
app.get("/auth", verifyJWT, (req, res) => {
  res.json({ message: "Secure Route Access Granted", user: req.user });
});

// ✅ Serverless Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
