const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userCocktailSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ingredients: {
      type: Array,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserCocktail = mongoose.model("UserCocktail", userCocktailSchema);

module.exports = UserCocktail;
