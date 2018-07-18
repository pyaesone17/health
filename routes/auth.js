var express = require("express");
var router = express.Router();
var passport = require("passport");

/* GET users listing. */
router.get("/login", function(req, res, next) {
    res.render("auth/login");
});

router.get("/", function(req, res, next) {
    res.render("auth/login");
});

router.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/auth/login" }),
    function(req, res) {
        if (req.user.type === "admin") {
            res.redirect("/backend/health/dashboard");
        }
        res.redirect("/me/dashboard");
    }
);

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
