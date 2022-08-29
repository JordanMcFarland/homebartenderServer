const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userCocktailSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    requiredIngredients: {
      type: [Object],
    },
    recipe: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const userFavoritesSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  userId: { type: Schema.Types.ObjectId },
});

const userSchema = new Schema(
  {
    userCocktails: [userCocktailSchema],
    userBar: {
      type: Object,
    },
    userFavorites: [userFavoritesSchema],
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
