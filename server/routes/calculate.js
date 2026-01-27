const express = require("express");
const calcController = require("../controllers/calcController");


const Router = express.Router();


Router.post('/calculate', calcController.calculateGraph);
module.exports = Router;