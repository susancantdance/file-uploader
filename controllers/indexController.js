const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

async function getSignup(req, res) {
  res.render("index");
}

async function postSignup(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send(errors.array()[0].msg);
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await db.postSignup(req.body.username, hashedPassword);
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getLogin(req, res, next) {
  res.render("login");
}

async function logout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
}

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  logout,
};
