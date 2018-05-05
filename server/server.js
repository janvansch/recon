'use strict';
//=============================================
require('./config/config');
//=============================================
const path = require('path');
const _ = require('lodash');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const ejs = require('ejs'); // const hbs = require('hbs');
const fs = require('fs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
var {processComDataFile} = require('./middleware/processComDataFile');
var {processMIDataFile} = require('./middleware/processMIDataFile');
var {getFileRegData} = require('./middleware/getFileRegData');
var {getReconData} = require('./middleware/getReconData');

const port = process.env.PORT;
const publicPath = path.join(__dirname, '../public');
//const viewPath = path.join(__dirname, '../views');

//console.log(">>>> Port: ", port);
console.log(">>>> Public Path: ", publicPath);
//console.log(">>>> Views: ", viewPath);

//=============================================
// Setup Express app
//=============================================
var app = express();

//=============================================
// Setup view engine - EJS
//=============================================
//app.set('views', viewPath);
app.set('view engine', 'ejs');
//app.engine('ejs', ejs.renderFile);

app.use(express.static(publicPath));
//app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use( bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit:50000
}));

//=============================================
// Setup view engine - HBS
//=============================================
// app.set('view engine', 'hbs');
// //app.set('views', path.join(__dirname +'/views'));
// app.set('views', './views');
// hbs.registerPartials(__dirname + '/views/partials');
//
// hbs.registerHelper('getCurrentYear', () => {
//   return new Date().getFullYear();
// });
//
// hbs.registerHelper('screamIt', (text) => {
//   return text.toUpperCase();
// });

//=============================================
// Log request
//=============================================
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  console.log(log);
  fs.appendFile('server.log', log + '\n');
  next();
});

//============================================
// Routes
//============================================
// /bad - send back json with errorMessage
app.get('/bad', (req, res) => {
  res.send({
    errorMessage: 'Unable to handle request'
  });
});
//---------------------------------------------------------
// Page Presentation Routes
//---------------------------------------------------------
app.get('/', (req, res) => {
  // res.render('index.html');
  console.log (">>>> Get Request", req.query);
  getFileRegData(req, (contents) => {
    console.log(">>>> Content: ", contents);
    res.render('pages/index', {content : contents});
  });
});

app.get('/recon', (req, res) => {
  res.render('pages/recon.ejs', {
    pageTitle: 'Recon Report'
  });
});
//----------------------------------------------------------
// Data Service Routes
//----------------------------------------------------------
//
// Save data extracted from file
//
app.post('/saveFileData', async (req, res) => {
  // console.log("===> File Data: ", req);
  try {
    const fileData = req.body;
    const dataType = fileData.reg.dataType;
    var result = "";
    //console.log("===> File Data Body: ", fileData);
    console.log(">>>> Data Type: ", dataType);

    // Process file data

    // var result = await processFileData(fileData);
    if (dataType == "COM") {
      console.log(">>>> Wait for commission data file processing to complete.");
      var result = await processComDataFile(fileData);
      // var result = await processFileData(fileData);
    }
    else if (dataType == "MI") {
      console.log(">>>> Wait for MI data file processing to complete.");
      var result = await processMIDataFile(fileData);
    }
    console.log(">>>> File data processing result: ", result);
    if (result != "200") {
      var result = "400";
      res.send(result);
    }
    else {
      res.send(result);
    }
  }
  catch (e) {
    console.log(">>>> ERROR - File Processing: ", e.message);
    var result = "400";
    res.send(result);
  }
});
//
// Extract data required for recon report
//
app.post('/reconData', (req, res) => {
  // console.log (">>>> Get Request", req.body);
  getReconData(req, (reconData) => {
    console.log(">>>> Content: ", reconData);
    res.send(reconData);
  });
});


app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id // can only see own todos
  })
  .then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  })
  .catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id // can only delete own todos
  })
  .then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  })
  .catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {$set: body},
    {new: true}
  )
  .then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  })
  .catch((e) => {
    res.status(400).send();
  })
});
//======================================
// User Routes
//======================================
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  console.log("==> login request received");
  var body = _.pick(req.body, ['email', 'password']);
  console.log("==> login request data", body.email, body.password)

  User.findByCredentials(body.email, body.password).then((user) => {
    console.log("==> Credentials found");
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log("==> Credentials not found");
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
