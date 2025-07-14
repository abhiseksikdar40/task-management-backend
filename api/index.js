const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const JWT = require("jsonwebtoken");
const Signup = require("../models/Signup.models");
const Project = require('../models/Project.models')
const Task = require('../models/Task.models')
const Team = require('../models/Team.models')
const User = require('../models/User.models')
const { taskManagementData } = require("../db/db.connect");

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
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided!" });
  }

  const token = authHeader.split(" ")[1]

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



// ✅ Project Route
async function createProject(newProject) {
  try {
    const createNewProject = new Project(newProject)
    const savedProject = await createNewProject.save()
    return savedProject;
  } catch (error) {
    console.log('Error While Creating New Project!', error)
  }
}

app.post('/v1/create/project', verifyJWT, async (req, res) => {
  try {
    const createdProject = await createProject(req.body)
    res.status(201).json({ message: "Project Created Successfully.", project: createdProject})
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Creating New Project!"})
  }
})


app.get('/v1/projects', verifyJWT, async (req, res) => {
  try {
    const allProjects = await Project.find()

    if(allProjects.length !== 0){
      res.json(allProjects)
    } else {
      res.status(404).json({ message: "Project Not Found!"})
    }
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Fetching All Projects!"})
  }
})

app.get('/v1/projects/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const projectDetails = await Project.findById(id);

    if (!projectDetails) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(projectDetails);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching project details" });
  }
});

app.post('/v1/projects/update/:projectid', verifyJWT, async (req, res) => {
  const { projectid } = req.params;
  const dataToUpdate = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(projectid, dataToUpdate, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found!" });
    }

    res.json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});



// ✅ Task Route
async function createTask(newTask) {
  try {
    const createTask = new Task(newTask)
    const savedTask = await createTask.save()
    return savedTask;
  } catch (error) {
    console.log('Error While Creating New Task!', error)
  }
}

app.post('/v1/create/task', verifyJWT, async (req, res) => {
  try {
    const createdTask = await createTask(req.body)
    res.status(201).json({ message: "Task Created Successfully.", task: createdTask})
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Creating New Task!"})
  }
})


app.get('/v1/tasks', verifyJWT, async (req, res) => {
  try {
    const allTasks = await Task.find().populate('project').populate('team')

    if(allTasks.length !== 0){
      res.json(allTasks)
    } else {
      res.status(404).json({ message: "Task Not Found!"})
    }
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Fetching All Tasks!"})
  }
})

app.get('/v1/tasks/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const taskDetails = await Task.findById(id).populate('project').populate('team')

    if (!taskDetails) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(taskDetails);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching task details" });
  }
});

app.post('/v1/tasks/update/:taskid', verifyJWT, async (req, res) => {
  const { taskid } = req.params;
  const dataToUpdate = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate( taskid, dataToUpdate, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found!" });
    }

    res.json({ message: "Task updated successfully", project: updatedTask });
  } catch (error) {
    res.status(500).json({ error: "Failed to update Task!" });
  }
});


// ✅ Team Route
async function createTeam(newTeam) {
  try {
    const createTeam = new Team(newTeam)
    const savedTeam = await createTeam.save()
    return savedTeam;
  } catch (error) {
    console.log('Error While Creating New Team!', error)
  }
}

app.post('/v1/create/team', verifyJWT, async (req, res) => {
  try {
    const createdTeam = await createTeam(req.body)
    res.status(201).json({ message: "Team Created Successfully.", team: createdTeam})
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Creating New Team!"})
  }
})


app.get('/v1/teams', verifyJWT, async (req, res) => {
  try {
    const allTeams = await Team.find()

    if(allTeams.length !== 0){
      res.json(allTeams)
    } else {
      res.status(404).json({ message: "Team Not Found!"})
    }
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Fetching All Team!"})
  }
})

app.get('/v1/teams/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const teamDetails = await Team.findById(id);

    if (!teamDetails) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(teamDetails);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching team details" });
  }
});



// ✅ User Route
async function createUser(newUser) {
  try {
    const createUser = new User(newUser)
    const savedUser = await createUser.save()
    return savedUser;
  } catch (error) {
    console.log('Error While Creating New User!', error)
  }
}

app.post('/v1/create/user', verifyJWT, async (req, res) => {
  try {
    const createdUser = await createUser(req.body)
    res.status(201).json({ message: "User Created Successfully.", user: createdUser})
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Creating New User!"})
  }
})

app.get('/v1/users', verifyJWT, async (req, res) => {
  try {
    const allUsers = await User.find().populate('team')

    if(allUsers.length !== 0){
      res.json(allUsers)
    } else {
      res.status(404).json({ message: "Users Not Found!"})
    }
  } catch (error) {
    res.status(500).json({ error: "Error Occured While Fetching All User!"})
  }
})


// ✅ Serverless Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);