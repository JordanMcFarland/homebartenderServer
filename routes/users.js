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
        if (!req.body.userId) req.body.userId = req.user._id;
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

userRouter
  .route("/favorites")
  .get(
    authenticate.verifyUser,
    cors.corsWithOptions,
    async (req, res, next) => {
      try {
        const user = await User.findOne({ _id: req.user._id });
        const populatedUserFavorites = await Promise.all(
          user.userFavorites.map(async (item) => {
            console.log(item);
            if (item.userId && item.userId.toString() !== user._id.toString()) {
              const otherUser = await User.findOne({ _id: item.userId });
              const cocktailToAdd = otherUser.userCocktails.id(item._id);
              if (cocktailToAdd) {
                return cocktailToAdd;
              } else {
                console.log("Could not find cocktail");
                return item;
              }
            } else if (
              item.userId &&
              item.userId.toString() === user._id.toString()
            ) {
              const cocktailToAdd = user.userCocktails.id(item._id);
              if (cocktailToAdd) {
                return cocktailToAdd;
              } else {
                console.log("Could not find cocktail");
                return item;
              }
            } else return item;
          })
        );
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(populatedUserFavorites);
      } catch (err) {
        next(err);
      }
    }
  )
  .post(
    authenticate.verifyUser,
    cors.corsWithOptions,
    async (req, res, next) => {
      try {
        const user = await User.findOne({ _id: req.user._id });
        if (
          !user.userFavorites.some(
            (item) => item._id.toString() === req.body._id.toString()
          )
        ) {
          user.userFavorites.push(req.body);
          const savedUser = await user.save();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ userFavorites: savedUser.userFavorites, ok: true });
        } else {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.json({
            err: `Cocktail: ${req.body._id} is already a favorite.`,
            ok: false,
          });
        }
      } catch (err) {
        next(err);
      }
    }
  )
  .delete(
    authenticate.verifyUser,
    cors.corsWithOptions,
    async (req, res, next) => {
      try {
        const user = await User.findOne({ _id: req.user._id });
        if (
          user.userFavorites.some(
            (item) => item._id.toString() === req.body._id.toString()
          )
        ) {
          const filteredFavorites = user.userFavorites.filter(
            (fav) => fav._id.toString() !== req.body._id.toString()
          );
          user.userFavorites = filteredFavorites;
          const savedUser = await user.save();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ userFavorites: savedUser.userFavorites, ok: true });
        } else {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.json({
            err: `Could not find cocktail ${req.body._id} in favorites list.`,
            ok: false,
          });
        }
      } catch (err) {
        next(err);
      }
    }
  );

userRouter
  .route("/userBar")
  .put(
    authenticate.verifyUser,
    cors.corsWithOptions,
    async (req, res, next) => {
      try {
        const user = await User.findOne({ _id: req.user._id });
        console.log(req.body);
        user.userBar = req.body;
        const savedUser = await user.save();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ updatedUserBar: savedUser.userBar, ok: true });
      } catch (err) {
        next(err);
      }
    }
  );

module.exports = userRouter;
