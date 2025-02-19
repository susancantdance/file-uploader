const { Router } = require("express");
const { body } = require("express-validator");
const indexRouter = Router();
const controller = require("../controllers/indexController");
const passport = require("passport");

indexRouter.get("/", controller.getSignup);
indexRouter.post(
  "/",
  body("confirm", "Passwords do not match").custom((value, { req }) => {
    console.log(value);
    console.log(req.body.password);
    return value === req.body.password;
  }),
  controller.postSignup
);

indexRouter.get("/login", controller.getLogin);
indexRouter.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/files",
    failureRedirect: "/login",
  })
);
indexRouter.post("/logout", controller.logout);

module.exports = {
  indexRouter,
};
