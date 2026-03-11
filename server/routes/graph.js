const express = require("express");

const { tokenAccess } = require("../middlewares/tokenizer");
const grapthController = require("../controllers/graph");


const Router = express.Router();

Router.post('/create', tokenAccess, grapthController.default.createGraph);
Router.get('/', tokenAccess, grapthController.default.getGraphs);
Router.get('/:id', tokenAccess, grapthController.default.getGraphById);
Router.delete('/:id', tokenAccess, grapthController.default.deleteGraph);


module.exports = Router;