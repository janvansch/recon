

var saveFileData = (req, res, next) => {
  console.log("File Data: ", req);
  next();
};
module.exports = {saveFileData};

//
// var todo = new Todo({
//   text: req.body.text,
//   _creator: req.user._id
// });
// todo.save().then((doc) => {
//   res.send(doc);
// }, (e) => {
//   res.status(400).send(e);
// });

// var {User} = require('./../models/user');
//
// var authenticate = (req, res, next) => {
//   var token = req.header('x-auth');
//
//   User.findByToken(token).then((user) => {
//     if (!user) {
//       return Promise.reject();
//     }
//
//     req.user = user;
//     req.token = token;
//
//     next();
//
//   }).catch((e) => {
//     res.status(401).send();
//   });
// };
//
// module.exports = {authenticate};
