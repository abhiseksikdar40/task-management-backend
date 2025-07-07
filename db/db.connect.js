const mongoose = require('mongoose')
require('dotenv').config()

const mongoUrl = process.env.MONGODB

const taskManagementData = async () => {
   try {
    await mongoose.connect(mongoUrl)
    console.log('Database Connected.')
   } catch (error) {
    console.log('Failed To Connected Database!', error)
   }
}

module.exports = { taskManagementData }
