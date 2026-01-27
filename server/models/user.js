const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    }
});

module.exports = mongoose.model("user", User);