const express = require("express");
var Db = require("./services");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

///////////////////////////   REGISTER    ////////////////////////////
/*  http://localhost:5000/user/register    
{
  "email": "ali123@gmail.com",
  "password":"123",
  "confirmPassword":"123"
}
*/

router.route("/register").post((request, response) => {
  let data = { ...request.body };
  if (!(data.email && data.password && data.confirmPassword)) {
    response.status(400).json({ message: "All inputs are required" });
  } else if (data.password !== data.confirmPassword) {
    response
      .status(400)
      .json({ message: "Password and Confirm Password do not match" });
  } else {
    Db.getUserByEmail(data.email).then((user) => {
      if (user[0].length >= 1) {
        return response.status(409).json({
          message: "Email Already Exists",
        });
      } else {
        bcrypt.hash(data.password, 10, (err, hash) => {
          if (err) {
            return response.status(500).json({
              error: err,
            });
          } else {
            data.password = hash;
            Db.addUser(data)
              .then((data) => {
                response.status(201).json({
                  message: "Congratulations! Your account has been successfully created.",
                });
              })
              .catch((err) => {
                response.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
  }
});

module.exports = router;
