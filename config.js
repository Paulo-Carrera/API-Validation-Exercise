/** Common config for bookstore. */

require("dotenv").config();

let DB_URI = `{process.env.DB_URI}/books`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${process.env.DB_URI}/books-test`;
} else {
  DB_URI = `${process.env.DB_URI}/books`;
}


module.exports = { DB_URI };