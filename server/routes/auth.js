const express = require("express");
const { tokenAccess } = require("../middlewares/tokenizer");
const auth = require("../controllers/auth");

const Router = express.Router();

Router.get("/user", tokenAccess, auth.default.userInfo);
Router.get("/users", tokenAccess, auth.default.ensureAdmin, auth.default.getUsers);
Router.delete("/users/:id", tokenAccess, auth.default.ensureAdmin, auth.default.deleteUser);
Router.post("/signin", auth.default.signIn);
Router.post("/signin-email-code", auth.default.signInEmailCode);
Router.post("/confirm-signin-email", auth.default.confirmSignInEmail);
Router.post("/signup", auth.default.signUp);
Router.post("/verify-email", auth.default.signUpVerifySend);
Router.post("/confirm-verify-email", auth.default.signUpVerifyEnter);
Router.post("/reset-password", auth.default.resetPasswordStart);
Router.post("/reset-password-confirm", auth.default.resetPasswordConfirm);

module.exports = Router;