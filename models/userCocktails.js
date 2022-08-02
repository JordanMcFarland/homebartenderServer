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
    recipe: {
      type: String,
      required: false,
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

const userCocktailListSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userCocktails: [userCocktailSchema],
  },
  {
    timestamps: true,
  }
);

const UserCocktailList = mongoose.model(
  "UserCocktailList",
  userCocktailListSchema
);

module.exports = UserCocktailList;
