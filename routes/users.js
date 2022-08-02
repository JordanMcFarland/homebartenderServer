var express = require("express");
const passport = require("passport");
const User = require("../models/user");
const authenticate = require("../authenticate");

const userRouter = express.Router();

userRouter.post("/signup", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

userRouter.post("/login", passport.authenticate("local"), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token: token,
    status: "You are successfully logged in!",
  });
});

//Logout handles serverside?
// userRouter.get("/logout", (req, res, next) => {
//   console.log(req);
//   // if (req.session) {
//   //   req.session.destroy();
//   //   res.clearCookie("jwt");
//   //   res.redirect("/");
//   // } else {
//   //   const err = new Error("You are not logged in!");
//   //   err.status = 401;
//   //   return next(err);
//   // }
// });

module.exports = userRouter;
