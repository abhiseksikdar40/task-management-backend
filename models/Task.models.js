const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    taskname: { type: String, required: true},
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true},
    team: {type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true},
    taskstatus: { type: String, enum: ["To Do", "In Progress", "Completed", "Closed"], default: "To Do"},
    duedate: { type: Date, required: true}
},
{
    timestamps: true
}
)

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task