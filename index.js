'use strict'

const lodash = require('lodash')
const { v4 : uuidv4 } = require('uuid')
//const jwt = require('jwt-simple');

const express = require('express')

const app = express()
app.use(express.json())

class User {
    constructor(user_id, login, password) {
        this.user_id = user_id
        this.login = login
        this.password = password
    }
    setToken(_token) {
      this.token = _token
    }
}

let userArray = []
let articleArray = []

let user = {
   user_id: "",
   login: "",
   password: "",
   token: "",
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

// Your code starts here.
// Placeholders for all requests are provided for your convenience.
function saveUser(_user) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    if (v.user_id == _user.user_id) {
      console.log("user found")
      return 0
    }
  }

  let uuid = uuidv4()

  userArray.push({
    "user_id": _user.user_id ,
    "login": _user.login ,
    "password": _user.password,
    "token": uuid,
  })

  return 1
}

function checkUser(_user) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    if (v.login == _user.login) {
      console.log("check user found")
      if (v.password == _user.password) {
        // login and password match
        return 1
      }
      else
      // password not match
        return 2
    }
  }
  // login not match
  return 0
}

function saveArticle(_token) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    {
      if (v.token == _token) {
         articleArray.push({
           "article_id": "art1" ,
           "title": "tit1" ,
           "content": "ct1",
           "visibility": "public",
           "user_id": v.user_id,
         })
      }
    }
  }
}

function checkVisibility(_token) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    {
      if (v.token == _token) {
        for (const [k2,v2] of userArray.entries()) {
          console.log(k2,v2)
          if (v.user_id == v2.user_id)
            return 1
        }
        return 0
      }
    }
  }
}

function checkToken(_token) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    {
      if (v.token == _token)
        return 1
    }
  }
  return 0
}

function getToken(_user) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    if (v.user_id == _user.user_id) {
      return v.token
    }
  }
  return "0"
}

function logoutUser(token) {
  for (const [k,v] of userArray.entries()) {
    console.log(k,v)
    if (v.token == token) {
      v.token = "0"
    }
  }
}

app.post('/api/user', (req, res) => {
  console.log("user");console.log(req.body);
  if (isEmptyObject(req.body)) {
    res.status(400);
    res.send('bad request');
  }
  if (req.body) {
    let user = req.body
    if (saveUser(user)) {
      res.status(201)
      res.json({ "result": "success"})
    }
    else {
      res.status(201)
      res.json({ "result": "duplicate user"})
    }
  }
});

app.post('/api/authenticate', (req, res) => {
  console.log("authenticate");console.log(req.body);
  if (isEmptyObject(req.body)) {
    res.status(400);
    res.send('bad request')
  }
  if (req.body) {
    let user = req.body
    let retV = checkUser(user)
    if (retV == 0) {
      res.status(404);
      res.send('not found')
    }
    else if (retV == 2) {
      res.status(401);
      res.send('Unauthorized')
    }
    else if (retV == 1) {
      let token = getToken(user)

      res.status(200);
      //uuid = user.user_id
      //res.json({"token": uuid});
      //res.writeHead(200, {"Content-Type": "application/json"});
      res.json({
        "token": token
      });
    }
  }
})

app.post('/api/logout', (req, res) => {
  //console.log("logout"); console.log(req.body)
  //console.log((req.headers))
  //console.log(req.headers["authentication-header"])
  //console.log(req.headers.connection)
  let token = req.headers["authentication-header"]
  {
    let retV = checkToken(token)
    if (retV == 0) {
      res.status(401)
      res.send('Unauthorized')
    }
    else if (retV == 1) {
      logoutUser(token)
      res.status(200)
      res.send('Response')
    }
  }
})

app.post('/api/articles', (req, res) => {
  //console.log("postarticles"); console.log(req.body)
  let token = req.headers["authentication-header"]
  if (isEmptyObject(req.body)) {
    res.status(400);
    res.send('not found');
  }
  {
    let user = req.body
    let retV = checkToken(token)
    if (retV == 0) {
      res.status(401)
      res.send('Unauthorized')
    }
    else if (retV == 1) {
      saveArticle(token)
      res.status(201)
      res.send('Response')
    }
  }
})

app.get('/api/articles', (req, res) => {
  let token = req.headers["authentication-header"]
  console.log(req.body); console.log(req.headers); console.log(token)
  if (typeof token == 'undefined') {
    console.log("undefined token")
    res.status(200);
    //res.json({"article_id" : "art1", "title": "tit1", "content": "c1", "visibility":"public", "user_id" :"42"});
    res.json([])
  } else {
    if (checkToken(token) == 0) {
      res.status(200);
      res.json([])
    } else if (checkToken(token) == 1) {
      if (checkVisibility(token) == 1) {
        res.status(200);
        res.send('private article');
      } else {
        res.status(200);
        res.send('public article');
      }
    }
    res.status(200);
    res.send('article');
  }
})

exports.default = app.listen(process.env.HTTP_PORT || 3000)
