const express = require('express')
const {createUser} = require('../controller/userController')
const router = express.Router()

router.post('/register', createUser)


//Validating the endpoint
router.all("/*", function (req, res) {
    return res
      .status(404)
      .send({ status: false, message: "Page Not Found" });
});


module.exports = router

