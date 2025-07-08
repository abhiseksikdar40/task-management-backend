const express = require('express')
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
  allowedHeaders: ["Content-Type"]
}))

app.listen(5001, () => {
  console.log('Database running on 5001')
})

const JWT_SECRET = "Your_jwt_secret"

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


