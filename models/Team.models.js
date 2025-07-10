const mongoose = require('mongoose')

const TeamSchema = new mongoose.Schema({
    teamname: { type: String, required: true, unique: true}
},
{
    timestamps: true
}
)

const Team = mongoose.model('Team', TeamSchema)

module.exports = Team