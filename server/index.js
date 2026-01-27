// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const routes = require("./routes");


const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());


app.use(routes);

mongoose.set("strictQuery", false);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (e) {
        console.log("MongoDB connection error...\n", e.message);
        process.exit(1);
    }
};

const start = async () => {
    try {
        await connect();

        app.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();