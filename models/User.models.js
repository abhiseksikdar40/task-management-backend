const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
 username: { type: String, required: true },
 useremail: { type: String, required: true, unique: true },
 team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true}
},
{
    timestamps: true
}
);

const User = mongoose.model('User', UserSchema)

module.exports = User