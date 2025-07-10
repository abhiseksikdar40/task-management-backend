const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    projectname: {type: String, required: true, unique: true},
    description: { type: String},
    projectstatus: { type: String, enum: ["To Do", "In Progress", "Completed", "Closed"], default: "To Do"}
},
{
    timestamps: true
}
)

const Project = mongoose.model('Project', ProjectSchema)

module.exports = Project