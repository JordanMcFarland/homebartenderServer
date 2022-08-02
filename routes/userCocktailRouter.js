const express = require("express");
const UserCocktailList = require("../models/userCocktails");
const authenticate = require("../authenticate");

const userCocktailRouter = express.Router();

userCocktailRouter
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
    UserCocktailList.find({ user: req.user._id })
      .populate("user")
      .populate("userCocktails")
      .then((userCocktailList) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(userCocktailList);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    UserCocktailList.findOne({ user: req.user._id })
      .then((userCocktailList) => {
        if (userCocktailList) {
          req.body.author = req.user._id;
          userCocktailList.userCocktails.push(req.body);
          userCocktailList
            .save()
            .then((userCocktailList) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(userCocktailList);
            })
            .catch((err) => next(err));
        } else {
          UserCocktailList.create({ user: req.user._id })
            .then((userCocktailList) => {
              req.body.author = req.user._id;
              userCocktailList.userCocktails.push(req.body);
              userCocktailList
                .save()
                .then((userCocktailList) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(userCocktailList);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    UserCocktailList.findOneAndDelete({ user: req.user._id })
      .then((userCocktailList) => {
        res.statusCode = 200;
        if (userCocktailList) {
          res.setHeader("Content-Type", "application/json");
          res.json(userCocktailList);
        } else {
          res.setHeader("Content-Type", "application/json");
          res.end("You do not have a cocktail list to delete");
        }
      })
      .catch((err) => next(err));
  });

userCocktailRouter
  .route("/:userCocktailId")
  .get(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 200;
    UserCocktailList.findOne({ user: req.user._id })
      .then((userCocktailList) => {
        const cocktailToSend = userCocktailList.userCocktails.filter(
          (cocktail) => {
            return cocktail._id.toString() === req.params.userCocktailId;
          }
        )[0];
        if (cocktailToSend) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(cocktailToSend);
        } else {
          err = new Error(`Cocktail ${req.params.userCocktailId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    UserCocktailList.findOne({ user: req.user._id })
      .then((userCocktailList) => {
        const editedCocktail = userCocktailList.userCocktails.id(
          req.params.userCocktailId
        );
        if (
          editedCocktail &&
          editedCocktail.author === req.user._id.toString()
        ) {
          if (req.body.name) {
            userCocktailList.userCocktails.id(req.params.userCocktailId).name =
              req.body.name;
          }
          if (req.body.ingredients) {
            userCocktailList.userCocktails.id(
              req.params.userCocktailId
            ).ingredients = req.body.ingredients;
          }
          if (req.body.recipe) {
            userCocktailList.userCocktails.id(
              req.params.userCocktailId
            ).recipe = req.body.recipe;
          }
          userCocktailList
            .save()
            .then((userCocktailList) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(userCocktailList);
            })
            .catch((err) => next(err));
        } else if (!editedCocktail) {
          err = new Error(
            "Cannot perform action because the cocktail was not found."
          );
          err.status = 404;
          return next(err);
        } else if (!editedCocktail.author === req.user._id) {
          err = new Error(
            "Cannot perform this action because you are not the author of this cocktail."
          );
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    UserCocktailList.findOne({ user: req.user._id })
      .then((userCocktailList) => {
        const cocktailToBeDeleted = userCocktailList.userCocktails.id(
          req.params.userCocktailId
        );
        if (
          cocktailToBeDeleted &&
          cocktailToBeDeleted.author === req.user._id.toString()
        ) {
          userCocktailList.userCocktails.id(req.params.userCocktailId).remove();
          userCocktailList
            .save()
            .then((userCocktailList) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(userCocktailList);
            })
            .catch((err) => next(err));
        } else if (!cocktailToBeDeleted) {
          err = new Error(
            "Cannot perform action because the cocktail was not found."
          );
          err.status = 404;
          return next(err);
        } else if (!cocktailToBeDeleted.author === req.user._id) {
          err = new Error(
            "Cannot perform this action because you are not the author of this cocktail."
          );
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = userCocktailRouter;
