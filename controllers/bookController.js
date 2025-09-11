var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Book = require("../models/book");
var User = require("../models/user");

exports.getBooks = function(req, res, next) {
    var userId = req.user_id;
    // Book.find(function (err, books) {
    //     if (err) return next(err);
    //     res.json(books);
    //   });
    Book.aggregate([
      { $lookup:
        {
          from: "users",
          localField: 'author',
          foreignField: '_id',
          as: 'authorList'
        }
      }
    ], function(err, books) {
      if (err) return next(err);
      res.json(books);
    });

  };

  exports.saveBooks = function(req, res, next) {
    var userId = req.user_id;
  
    var newBook = new Book({
      isbn: req.body.isbn,
      title: req.body.title,
      author: userId,
      publisher: req.body.publisher
    });

    newBook.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Save book failed.'});
      }
      res.json({success: true, msg: 'Successful created new book.'});
    });
  };