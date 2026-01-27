const express = require("express");
const Auth = require("./auth");
const Calc = require("./calculate");

const Router = express.Router();

Router.use("/api/auth", Auth);
Router.use("/api/calculate", Calc);

module.exports = Router;