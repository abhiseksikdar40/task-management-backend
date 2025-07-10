const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    projectname: {type: String, required: true, unique: true},
    description: { type: String}
},
{
    timestamps: true
}
)

const Project