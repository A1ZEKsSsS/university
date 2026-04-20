const express = require("express");
const { tokenAccess, isAdmin } = require("../middlewares/tokenizer");
const admin = require("../controllers/admin");

const Router = express.Router();

Router.post("/login", admin.adminLogin);
Router.get("/users", isAdmin, admin.getUsers);
Router.delete("/users/:id", isAdmin, admin.deleteUser);


module.exports = Router;