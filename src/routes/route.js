const express = require('express')
const {createUser, loginUser, getUser} = require('../controller/userController')
const {authentication, authorization} = require('../middleware/auth')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUser )

//Validating the endpoint
router.all("/*", function (req, res) {
    return res
      .status(404)
      .send({ status: false, message: "Page Not Found" });
});


module.exports = router

