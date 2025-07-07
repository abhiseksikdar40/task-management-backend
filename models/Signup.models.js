const mongoose = require('mongoose')

const SignupSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    useremail: {type: String, required: true},
    userpassword: {type: String, required: true}
})

const Signup = mongoose.model("Signup", SignupSchema)

module.exports = Signup