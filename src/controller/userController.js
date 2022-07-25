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
        let {fname, lname, email, phone, password, address, profileImage} = req.body;
        console.log(fname)
        let {shipping, billing} = address;
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
        if(profileImage == undefined){
            let files = req.files
            if(files && files.length>0){
                let uploadedFileURL = await uploadFiles(files[0]) 
                console.log(uploadedFileURL)
                userData.profileImage = uploadedFileURL
            }
            else{
                res.status(400).send({message: "No file found"})
            }
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
        const saltRounds = 10;
       
bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        if(hash){
            userData.password = hash
            }else{
                console.log(err)
            }
     });
  });

        //Address validation
        if(!address){
            return res
                .status(400)
                .send({status: false, message:"address is required"}) 
        }
        if(typeof address != "object"){
            return res
                .status(400)
                .send({status: false, message:"Address should include fields"}) 
        }
        userData.address

        //shipping validation
        if(!shipping){
            return res
                .status(400)
                .send({status: false, message:"Shipping address is required"}) 
        }
        if(typeof shipping != "object"){
            return res
                .status(400)
                .send({status: false, message:"Shipping address should include proper fields"}) 
        }
        userData.address.shipping

        //Street validation
        if(!shipping.street){
            return res
                .status(400)
                .send({status: false, message:"street is required in shipping address"}) 
        }
        if(!isValidString(shipping.street)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Street"}) 
        }
        userData.address.shipping.street = street

        //City validation
        if(!shipping.city){
            return res
                .status(400)
                .send({status: false, message:"city is required in shipping address"}) 
        }
        if(!isValidString(shipping.city)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid City"}) 
        }
        userData.address.shipping.city = city

        //Pincode validation
        if(!shipping.pincode){
            return res
                .status(400)
                .send({status: false, message:"Pincode is required in shipping address"}) 
        }
        if(typeof pincode == "string" || isValidPincode(shipping.pincode)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Pincode"}) 
        }
        userData.address.shipping.pincode = pincode

        //Billing Validation
        if(!billing){
            return res
                .status(400)
                .send({status: false, message:"Billing address is required"}) 
        }
        if(typeof billing != "object"){
            return res
                .status(400)
                .send({status: false, message:"Billing address should include proper fields"}) 
        }
        userData.address.billing

        //Street validation
        if(!billing.street){
            return res
                .status(400)
                .send({status: false, message:"street is required in billing address"}) 
        }
        if(!isValidString(billing.street)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Street"}) 
        }
        userData.address.billing.street = street

        //City validation
        if(!billing.city){
            return res
                .status(400)
                .send({status: false, message:"city is required in billing address"}) 
        }
        if(!isValidString(billing.city)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid City"}) 
        }
        userData.address.billing.city = city

        //Pincode validation
        if(!billing.pincode){
            return res
                .status(400)
                .send({status: false, message:"Pincode is required in billing address"}) 
        }
        if(typeof pincode == "string" || isValidPincode(billing.pincode)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Pincode"}) 
        }
        userData.address.billing.pincode = pincode

    }
    catch(error){
        console.log(error)
        return res
                .status(500)
                .send({status: false, message: error.message})
    }
}

module.exports = {createUser}