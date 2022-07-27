const jwt = require("jsonwebtoken");
const userModel = require('../models/userModel')
const { isValidId } = require("../validator/validation");

// Authentication
const authentication = function (req, res, next) {
  try {
    let token = req.headers.authorization;
    const bearer = token.split(' ')
    token = bearer[1];

    // checking token
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "token must be present" });

    // validating the token
    let decoded = jwt.verify(token, "productManagement/13/dfis") 
      if (!decoded){
        return res.status(401).send({ status: false, message: "token is invalid" });
      }
      else {
        // creating an attribute in "req" to access the token outside the middleware
        req.token = decoded;
        next();
      }

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const authorization = async function(req, res, next){
    try{
        let userId = req.params.userId;
        let userLoggedIn = req.token.userId;
        if(!isValidId(userId)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid format of userId"})
        }
        
        if(userLoggedIn != userId){
            return res
                .status(403)
                .send({status: false, message:"You are not authorized to perform this task"})
        }
        const user = await userModel.findOne({_id: userId})
        if(!user){
            return res
                .status(404)
                .send({status: false, message:"No such user found"})
        }

         // creating an attribute in "req" to access the blog data outside the middleware
        req.user = user;
        next();
    }
    catch(error){
        console.log(error)
        return res
                .status(500)
                .send({status: false, message: error.message})
    }
}

module.exports = {authentication, authorization}