var express = require("express");
const passport = require("passport");
const User = require("../models/user");
const authenticate = require("../authenticate");
const cors = require("./cors");

const userRouter = express.Router();

userRouter.options("*", cors.corsWithOptions, (req, res) =>
  res.sendStatus(200)
);

userRouter.post("/signup", cors.corsWithOptions, (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        console.log(err);
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

userRouter.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!",
      user: req.user,
    });
  }
);

userRouter
  .route("/usercocktails")
  .get(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    User.findOne({ _id: req.user.id })
      .then((user) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(user.userCocktails);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .then((user) => {
        req.body.userId = req.user._id;
        user.userCocktails.push(req.body);
        user
          .save()
          .then((user) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user.userCocktails);
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

userRouter
  .route("/usercocktails/:userCocktailId")
  .put(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .then((user) => {
        if (req.body.name) {
          user.userCocktails.id(req.params.userCocktailId).name = req.body.name;
        }
        if (req.body.requiredIngredients) {
          user.userCocktails.id(req.params.userCocktailId).requiredIngredients =
            req.body.requiredIngredients;
        }
        if (req.body.recipe) {
          user.userCocktails.id(req.params.userCocktailId).recipe =
            req.body.recipe;
        }
        user
          .save()
          .then((user) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user.userCocktails);
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, cors.corsWithOptions, (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .then((user) => {
        user.userCocktails.id(req.params.userCocktailId).remove();
        user
          .save()
          .then((user) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user.userCocktails);
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

module.exports = userRouter;
