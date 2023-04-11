const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  } else {
    res.status(404).json({ message: "provide username and password !" });
  }
});

// Get the book list available in the shop
const allBooksPromise = new Promise((resolve,reject)=>{
resolve(JSON.stringify(books,null,4));
})
public_users.get("/", function (req, res) {
  allBooksPromise
  .then(data=>res.send(data));
});

// Get book details based on ISBN

const booksByIsbnPromise = (param) => new Promise((resolve,reject)=>{
  resolve(JSON.stringify(books[param],null,4));
})

public_users.get("/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  if (isbn > 10 || isbn < 0) {
    res.status(404).json({ message: "choose number between 1 and 10" });
  } else {
    booksByIsbnPromise(isbn)
    .then(data=>res.send(data));
  }
});

// Get book details based on author
const booksByPromise = (param1,param2) => new Promise((resolve,reject)=>{
  let booksToArray = Object.entries(books);
  let bookByAuthor = booksToArray.filter(
    (book) => book[1][param1] === param2
  );
  if (bookByAuthor == []) {
    reject({ message: "try with other title or author" });
  } else {
    let isbn = bookByAuthor[0][0];
    resolve(JSON.stringify(books[isbn]))
  }
})
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author;
  booksByPromise("author",author)
  .then(data=>res.send(data))
  .catch(err=>res.status(404).json(err))
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  booksByPromise("title",title)
  .then(data=>res.send(data))
  .catch(err=>res.status(404).json(err))
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  if(isbn>10 || isbn<0){
    res.status(404).json({ message: "try with numbers btwn 1 and 10" });
  }else{
   res.send(JSON.stringify(books[isbn]["reviews"]));
  }
  
});

module.exports.general = public_users;
