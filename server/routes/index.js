const express = require("express");
const Auth = require("./auth");
const Calc = require("./calculate");
const Graph = require("./graph");

const Router = express.Router();

Router.use("/api/auth", Auth);
Router.use("/api/calculate", Calc);
Router.use("/api/graphs", Graph);


module.exports = Router;