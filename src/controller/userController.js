const userModel = require('../models/userModel')
const {isValidRequest,
       isValidString,
       isValidName,
       isValidMail,
       isValidPhone,
       isValidPassword,
       isValidPincode} = require('../validator/userValidation')
const bcrypt = require('bcrypt')
const {jwt} = require('jsonwebtoken')
const {uploadFiles} = require('../upload/upload')

const createUser = async function(req, res){
    try{
        if(!isValidRequest(req.body)){
           return res
                .status(400)
                .send({status: false, message:"Enter valid Input"}) 
        }
        let {fname, lname, email, phone, password, address} = req.body;
        let profileImage = req.files
        let userData = {}
        if(!fname){
            return res
                .status(400)
                .send({status: false, message:"First Name is required"}) 
        }
        fname = fname.trim()
        if(!isValidString(fname) || !isValidName(fname)){
            return res
                .status(400)
                .send({status: false, message:"Enter first name in proper format"}) 
        }
        userData.fname = fname;

        if(!lname){
            return res
                .status(400)
                .send({status: false, message:"Last Name is required"}) 
        }
        lname = lname.trim()
        if(!isValidString(lname) || !isValidName(lname)){
            return res
                .status(400)
                .send({status: false, message:"Enter Last name in proper format"}) 
        }
        userData.lname = lname

        if(!email){
            return res
            .status(400)
            .send({status: false, message:"Email is required"}) 
        }
        email = email.trim()
        if(!isValidString(email) || !isValidMail(email)){
            return res
                .status(400)
                .send({status: false, message:"Enter email in proper format"}) 
        }
        const isDuplicateEmail = await userModel.findOne({email})
        if(isDuplicateEmail){
            return res
                .status(409)
                .send({status: false, message:`${email} emailId already in use`}) 
        }
        userData.email = email

        //Profile Image validation
        if(profileImage.length > 0){
            let uploadedFileURL = await uploadFiles(profileImage[0]) 
            console.log(uploadedFileURL)
            req.body.profileImage = uploadedFileURL
            console.log(userData)
        }
        else{
            return res
                .status(400)
                .send({ status: false, message: "Profile Image is required" });
        }
        

        //Phone number validation
        if(!phone){
            return res
                .status(400)
                .send({status: false, message:"Phone number is required"}) 
        }
        if(!isValidString(phone) || !isValidPhone(phone)){
            return res
                .status(400)
                .send({status: false, message: "Enter phone in valid format"}) 
        }
        let userPhone = await userModel.find()
        phone = phone.toString()
        //incase phone number is starting from +91 in body
        if(phone.startsWith("+91",0)== true){   
            phone = phone.substring(4,14)
            if(userPhone.length >0){
                if(userPhone[0].phone.startsWith("+91")){
                    if(userPhone[0].phone.startsWith(phone, 4)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(0)){
                    if(userPhone[0].phone.startsWith(phone, 1)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(phone, 0)== true){
                    return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                }
                userData.phone = phone
            }else userData.phone = phone
            }
        
        //incase phone number is starting from 0 in body  
        if(phone.startsWith("0",0)== true){
            if(userPhone.length > 0){
            phone = phone.substring(1,12)
                if(userPhone[0].phone.startsWith("+91")){
                    if(userPhone[0].phone.startsWith(phone, 4)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(0)){
                    if(userPhone[0].phone.startsWith(phone, 1)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(phone, 0)== true){
                    return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                }
                userData.phone = phone
            }
             else userData.phone = phone
            }
        
        //incase there is just the phone number without prefix 
        if(phone){
            if(userPhone.length > 0){
                if(userPhone[0].phone.startsWith("+91")){
                    if(userPhone[0].phone.startsWith(phone, 4)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(0)){
                    if(userPhone[0].phone.startsWith(phone, 1)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
    
                if(userPhone[0].phone.startsWith(phone, 0)== true){
                    return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                }
            userData.phone = phone
            }else userData.phone = phone
        }
        
        //Password validation
        if(!password){
            return res
                .status(400)
                .send({status: false, message:"Password is required"}) 
        }
        if(!isValidString(password) || !isValidPassword(password)){
            return res
                .status(400)
                .send({status: false, message:"Password should contain min 8 and max 15 character with a number and a special character"}) 
        }

        //Encrypting password
        const encryptPassword  =await bcrypt.hash(password, 10)
        console.log(encryptPassword)
        req.body.password = encryptPassword

        //Address validation

        if(!address){
            return res
                .status(400)
                .send({status: false, message:"address is required"}) 
        }
        if(!isValidRequest(address)){
            return res
                .status(400)
                .send({status: false, message:"Address should include fields"}) 
        }
        
        let {shipping, billing} = address;
        // shipping validation
        if(!isValidRequest(shipping)){
            return res
                .status(400)
                .send({status: false, message:"Shipping address is required"}) 
        }
        //Street validation
        if(!isValidString(shipping.street)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Street, street is required"}) 
        }
        // //City validation
        if(!isValidString(shipping.city)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid City, city is required"}) 
        }
        //Pincode validation
        if(!isValidPincode(shipping.pincode)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Pincode, pincode is required"}) 
        }

        //Billing Validation
        if(!isValidRequest(billing)){
            return res
                .status(400)
                .send({status: false, message:"Billing address is required"}) 
        }
        //Street validation
        if(!isValidString(billing.street)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Street, street is required"}) 
        }
        //City validation
        if(!isValidString(billing.city)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid City, city is required"}) 
        }
        //Pincode validation
        if(!isValidPincode(billing.pincode)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Pincode, pincode is required"}) 
        }

        // userData.address = address
        const user = await userModel.create(req.body)
        return res  
                .status(201)
                .send({status: true, message:"success", data:user})
    }

    catch(error){
        console.log(error)
        return res
                .status(500)
                .send({status: false, message: error.message})
    }
}

const login = async function(req, res){
    try{
       
      if (!isValidRequest(req.body)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide login details" });
      }
      let {email, password} = req.body;   
  
      // validating the email
      if(email){
        if (!isValidMail(email))
          return res
            .status(400)
            .send({ status: false, message: "Entered mail ID is not valid" });
      }else return res
                .status(400)
                .send({ status: false, message: "email is required" });

      // validating the password
      if(password){
        if (!isValidPassword(password))
          return res.status(400).send({
            status: false,
            message: "Passwrod is not valid",
          });
      }else return res
                .status(400)
                .send({ status: false, message: "password is required" });
  
      // finding for the user with email and password
      let user = await userModel.findOne({
        email: email,
        password: password,
      });
      if (!user)
        return res.status(400).send({
          status: false,
          message: "Username and password are not matched",
        });
  
      // JWT creation
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          expiresIn: "24h"
        },
        "book-management36"
      );
      res.header("x-api-key", token);
      return res
        .status(200)
        .send({ status: true, message: "Success", data: token });
    }
    catch(error){
        console.log(error)
        return res
                .status(500)
                .send({status: false, message: error.message})
    }
}
module.exports = {createUser}