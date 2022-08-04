const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidMail,
  isValidPhone,
  isValidPassword,
  isValidPincode,
  isValidValue
} = require("../validator/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadFiles } = require("../upload/upload");
const mongoose = require("mongoose");

const createUser = async function (req, res) {
  try {
    if (!isValidRequest(req.body)|| req.files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid Input" });
    }
    let { fname, lname, email, phone, password, address } = req.body;
    let userData = {};
    let profileImage = req.files;
    if (!fname) {
      return res
        .status(400)
        .send({ status: false, message: "First Name is required" });
    }
    // fname = fname.trim()
    if (!isValidString(fname) || !isValidName(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter first name in proper format" });
    }
    userData.fname = fname;

    if (!lname) {
      return res
        .status(400)
        .send({ status: false, message: "Last Name is required" });
    }
    lname = lname.trim();
    if (!isValidString(lname) || !isValidName(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter Last name in proper format" });
    }
    userData.lname = lname;

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    }
    email = email.trim();
    if (!isValidString(email) || !isValidMail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter email in proper format" });
    }
    const isDuplicateEmail = await userModel.findOne({ email });
    if (isDuplicateEmail) {
      return res
        .status(409)
        .send({ status: false, message: `${email} emailId already in use` });
    }
    userData.email = email;

    //Profile Image validation
    if (profileImage.length > 0) {
      console.log(profileImage[0].originalname);
      let match = /\.(jpeg|png|jpg)$/.test(profileImage[0].originalname);
      if (match == false) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile Image is required in JPEG/PNG/JPG format",
          });
      }
      let uploadedFileURL = await uploadFiles(profileImage[0]);
      console.log(uploadedFileURL);
      userData.profileImage = uploadedFileURL;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Profile Image is required" });
    }

    //Phone number validation
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required" });
    }
    if (!isValidString(phone) || !isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter phone in valid format" });
    }
    let userPhone = await userModel.find();
    phone = phone.toString();

    //incase phone number is starting from +91 in body
    if (phone.startsWith("+91", 0) == true) {
      let newPhone = phone.substring(4, 14);
      for (i = 0; i < userPhone.length; i++) {
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //incase phone number is starting from 0 in body
    if (phone.startsWith("0", 0) == true) {
      for (i = 0; i < userPhone.length; i++) {
        newPhone = phone.substring(1, 12);
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //incase there is just the phone number without prefix
    if (phone) {
      for (i = 0; i < userPhone.length; i++) {
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(phone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(phone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(phone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //Password validation
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }
    if (!isValidString(password) || !isValidPassword(password)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Password should contain min 8 and max 15 character with a number and a special character",
        });
    }

    //Encrypting password
    const encryptPassword = await bcrypt.hash(password, 10);
    console.log(encryptPassword);
    userData.password = encryptPassword;

    //Address validation
    if (typeof address == "string") {
      return res
        .status(400)
        .send({ status: false, message: "Enter Valid address" });
    }
    console.log(typeof address);

    let { shipping, billing } = address;
    let { street, city, pincode } = shipping;
    //Street validation
    if (!isValidString(street)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Street, street is required in shipping address",
        });
    }
    // //City validation
    if (!isValidString(city)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid City, city is required in shipping addresss",
        });
    }
    //Pincode validation
    if (!isValidPincode(pincode)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Enter valid Pincode, pincode is required in shipping address",
        });
    }

    //Billing Validation
    if (billing) {
      let { street, city, pincode } = billing;
      //Street validation
      if (!isValidString(street)) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Enter valid Street, street is required in billing address",
          });
      }
      //City validation
      if (!isValidString(city)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Enter valid City, city is required in billing address",
          });
      }
      //Pincode validation
      if (!isValidPincode(pincode)) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Enter valid Pincode, pincode is required in billing address",
          });
      }
    }

    userData.address = address;
    const user = await userModel.create(userData);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const loginUser = async function (req, res) {
  try {
    if (!isValidRequest(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide login details" });
    }
    let { email, password } = req.body;

    // validating the email
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }
    if (!isValidMail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Entered mail ID is not valid" });
    }

    // validating the password
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (!isValidPassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Entered Passwrod is not valid" });

    let user = await userModel.findOne({
      email: email,
    });

    if (!user)
      return res.status(400).send({
        status: false,
        message: "Email does not exist",
      });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .send({ status: false, message: "Entered Passwrod is incorrect" });
    }

    // JWT creation
    let token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      "productManagement/13/dfis",
      { expiresIn: "24h" }
    );
    res.header("x-api-key", token);
    return res
      .status(200)
      .send({
        status: true,
        message: "User login successfull",
        data: { userId: user._id, token: token },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getUser = async function (req, res) {
  try {
    const userFound = await userModel.findOne({ _id: req.user._id });
    if (!userFound) {
      return res.status(404).send({ status: false, message: "No userFound" });
    }
    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: userFound });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateUser = async function (req, res) {
  try {

    //making deep copy of req.body
    const requestBody = JSON.parse(JSON.stringify(req.body));
    const profileImage  = req.files
    if (
        !isValidValue(requestBody) &&
        (profileImage == undefined || profileImage?.length == 0)
      ) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid Input" });
      }
    let userData = req.user;
    let { fname, lname, email, phone, password, address } = requestBody;
    console.log(req.files);

    if (requestBody.hasOwnProperty("fname")) {
      if (!isValidString(fname) || !isValidName(fname)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Enter first name in proper format",
          });
      }
      userData.fname = fname;
    }

    if (requestBody.hasOwnProperty("lname")) {
      if (!isValidString(lname) || !isValidName(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter Last name in proper format" });
      }
      userData.lname = lname;
    }

    if (requestBody.hasOwnProperty("email")) {
      email = email.trim();
      if (!isValidString(email) || !isValidMail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter email in proper format" });
      }
      const isDuplicateEmail = await userModel.findOne({ email });
      if (isDuplicateEmail) {
        return res
          .status(409)
          .send({ status: false, message: `${email} emailId already in use` });
      }
      userData.email = email;
    }

    //Profile Image validation
    if (profileImage.length > 0) {
      console.log(profileImage[0].originalname);
      let match = /\.(jpeg|png|jpg)$/.test(profileImage[0].originalname);
      if (match == false) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile Image is required in JPEG/PNG/JPG format",
          });
      }
      let uploadedFileURL = await uploadFiles(profileImage[0]);
      console.log(uploadedFileURL);
      userData.profileImage = uploadedFileURL;
    }

    //Phone number validation
    if (requestBody.hasOwnProperty("phone")) {
      if (!isValidString(phone) || !isValidPhone(phone)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter phone in valid format" });
      }
      let userPhone = await userModel.find();
      phone = phone.toString();

      //incase phone number is starting from +91 in body
      if (phone.startsWith("+91", 0) == true) {
        let newPhone = phone.substring(4, 14);
        for (i = 0; i < userPhone.length; i++) {
          if (userPhone[i].phone.startsWith("+91")) {
            if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(0)) {
            if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }
        userData.phone = phone;
      }

      //incase phone number is starting from 0 in body
      if (phone.startsWith("0", 0) == true) {
        for (i = 0; i < userPhone.length; i++) {
          newPhone = phone.substring(1, 12);
          if (userPhone[i].phone.startsWith("+91")) {
            if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(0)) {
            if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }
        userData.phone = phone;
      }

      //incase there is just the phone number without prefix
      if (phone) {
        for (i = 0; i < userPhone.length; i++) {
          if (userPhone[i].phone.startsWith("+91")) {
            if (userPhone[i].phone.startsWith(phone, 4) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(0)) {
            if (userPhone[i].phone.startsWith(phone, 1) == true) {
              return res
                .status(409)
                .send({
                  status: false,
                  message: `${phone} phone number is already in use`,
                });
            }
          }

          if (userPhone[i].phone.startsWith(phone, 0) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }
        userData.phone = phone;
      }
    }

    //Password validation
    if (requestBody.hasOwnProperty("password")) {
      if (!isValidString(password) || !isValidPassword(password)) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Password should contain min 8 and max 15 character with a number and a special character",
          });
      }

      //Encrypting password
      const encryptPassword = await bcrypt.hash(password, 10);
      console.log(encryptPassword);
      userData.password = encryptPassword;
    }

    //Address validation
    if (requestBody.hasOwnProperty("address")) {
      let { shipping, billing } = address;
      address = JSON.parse(JSON.stringify(address));

      if (address.hasOwnProperty("shipping")) {
        let { street, city, pincode } = shipping;
        shipping = JSON.parse(JSON.stringify(shipping));

        if (shipping.hasOwnProperty("street")) {
          if (!isValidString(street)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid Street in shipping address",
              });
          }
          userData.address.shipping.street = street.trim();
        }
        //City validation
        if (shipping.hasOwnProperty("city")) {
          if (!isValidString(city)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid City in shipping address",
              });
          }
          userData.address.shipping.city = city.trim();
        }
        //Pincode validation
        if (shipping.hasOwnProperty("pincode")) {
          if (!isValidPincode(pincode)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid Pincode in shipping address",
              });
          }
          userData.address.shipping.pincode = pincode.trim();
        }
      }

      //Billing Validation
      if (address.hasOwnProperty("billing")) {
        let { street, city, pincode } = billing;

        //Street validation
        if (billing.hasOwnProperty("street")) {
          if (!isValidString(street)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid Street in billing address",
              });
          }
          userData.address.billing.street = street.trim();
        }
        //City validation
        if (billing.hasOwnProperty("city")) {
          if (!isValidString(city)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid City in billing address",
              });
          }
          userData.address.billing.city = city.trim();
        }
        //Pincode validation
        if (billing.hasOwnProperty("pincode")) {
          if (!isValidPincode(pincode)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Enter valid Pincode in billing address",
              });
          }
          userData.address.billing.pincode = pincode.trim();
        }
      }
    }
    const update = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      userData,
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "User profile updated", data: update });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = { createUser, loginUser, getUser, updateUser };
