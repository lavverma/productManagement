const express = require('express')
const {createUser, loginUser, getUser, updateUser} = require('../controller/userController')
const {authentication, authorization} = require('../middleware/auth')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUser )
router.put('/user/:userId/profile', authentication, authorization, updateUser)

//Validating the endpoint
router.all("/*", function (req, res) {
    return res
      .status(404)
      .send({ status: false, message: "Page Not Found" });
});


module.exports = router

