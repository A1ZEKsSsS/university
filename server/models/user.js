const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Customers = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
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

module.exports = mongoose.model("customers", Customers);