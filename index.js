const express = require('express')
const serverless = require('serverless-http');
const app = express()
const cors = require('cors')
const JWT = require('jsonwebtoken')
const Signup = require('./models/Signup.models')
const { taskManagementData } = require('./db/db.connect')

taskManagementData()
app.use(express.json())

app.use(cors({
  origin: ["http://localhost:5173",
  "https://task-management-frontend-taupe-eight.vercel.app/"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type",  "Authorization"]
}))

// app.listen(5001, () => {
//   console.log('Database running on 5001')
// })

const JWT_SECRET = "Your_jwt_secret"


// ✅ Signup Route
async function getNewSignUp(newUser) {
  try {
    const newSignup = new Signup(newUser)
    return await newSignup.save() 
  } catch (error) {
    console.log('Error while Signing Up!', error)
    throw error
  }
}


app.post('/v1/signup/user', async (req, res) => {
  const { fullname, useremail, userpassword } = req.body;

  if (!fullname || !useremail || !userpassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newUserAdded = await getNewSignUp(req.body);

    const token = JWT.sign(
      { email: newUserAdded.useremail }, 
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ 
      message: "User Created Successfully.", 
      user: newUserAdded, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed To Create User!" });
  }
});


// ✅ Login Route
app.post('/v1/login/user', async (req, res) => {
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

    const token = JWT.sign(
      { email: user.useremail },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

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


const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "No token provided!" });
  }

  try {
    const decodedToken = JWT.verify(token, JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("JWT Verify Error:", error.message);
    return res.status(403).json({ message: "Invalid Token!" });
  }
};



module.exports = app;
module.exports.handler = serverless(app);