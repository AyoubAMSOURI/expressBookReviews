const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}
//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({data:password},'access',{expiresIn:60*60});
    req.session.authorization = {
      accessToken,username
    } 
    ;
    return res.status(200).json({message:'user successfully logged in !'})
  }else{
    return res.status(208).json({message:'invaid login, check username and password !'})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  if(isbn>10 || isbn<0){
    res.status(404).json({ message: "try with numbers btwn 1 and 10" });
  }else{
  let reviews = books[isbn]['reviews'] ;
  let username = req.session.authorization['username'];
  let newReview = req.query.review;
  reviews[username] = newReview;
  res.status(200).send(JSON.stringify(reviews));
  }
  
});
regd_users.delete("/auth/review/:isbn",(req,res)=>{
  let isbn = req.params.isbn;
  if(isbn>10 || isbn<0){
    res.status(404).json({ message: "try with numbers btwn 1 and 10" });
  }else{
  let reviews = books[isbn]['reviews'] ;
  let username = req.session.authorization['username'];
  delete reviews[username];
  res.status(200).send(JSON.stringify(reviews));}
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
