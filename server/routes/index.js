const express = require("express");
const Auth = require("./auth");
const Calc = require("./calculate");
const Graph = require("./graph");
const Admin = require("./admin");

const Router = express.Router();

Router.use("/api/auth", Auth);
Router.use("/api/calculate", Calc);
Router.use("/api/graphs", Graph);
Router.use("/api/admin", Admin);


module.exports = Router;