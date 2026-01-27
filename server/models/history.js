const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const History = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    matrix: {
        type: [[Number]],
        required: true
    },
    result: {
        type: [[Number]],
        required: true
    },
})

module.exports = mongoose.model("history", History);