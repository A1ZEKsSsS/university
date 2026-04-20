const jwt = require("jsonwebtoken");

const checkToken = (req, res, next, discard) => {
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(" ");
        var token = parts[1];
        jwt.verify(token, process.env.JWT_SECRET, (error, userinfo) => {
            if (error) {
                return res.status(401).send({ error: "Invalid AccessToken" });
            }

            req.user = userinfo;
            req.token = token;
            next();
        });
    } else {
        if (discard) {
            return res.status(401).send({ error: "AccessToken is required" });
        }

        next();
    }
};

const tokenPipe = (req, res, next) => checkToken(req, res, next, false);
const tokenAccess = (req, res, next) => checkToken(req, res, next, true);
const isAdmin = (req, res, next) => checkType(req, res, next, "admin");

module.exports = {
    tokenPipe,
    tokenAccess,
    isAdmin
};