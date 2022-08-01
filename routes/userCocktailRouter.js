const express = require("express");
const UserCocktail = require("../models/userCocktails");

const userCocktailRouter = express.Router();

userCocktailRouter
  .route("/")
  .get((req, res, next) => {
    UserCocktail.find()
      .then((cocktails) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(cocktails);
      })
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    UserCocktail.create(req.body)
      .then((cocktail) => {
        console.log("Cocktail created", cocktail);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(cocktail);
      })
      .catch((err) => next(err));
  });

module.exports = userCocktailRouter;
