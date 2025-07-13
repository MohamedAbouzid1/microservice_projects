const mongoose = require('mongoose');

// connect 
mongoose.connect(process.env.MONGO_URI);

// define user schema
const userSchema = new mongoose.Schema( {
    username: {
        type: String, required: true
    }
 });

const User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema( {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: { type: String, required: true },
    duration: { type: Number, required:true },
    date: { type:Date, required:true }
})

const Exercise = mongoose.model('Exercise', exerciseSchema);

// export models

module.exports = { User, Exercise };