const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User"); // Import your MySQL connection here

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    let info = await transporter.sendMail({
      from: "Maxelence By Nazir",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log("info.....", info);
  } catch (error) {
    console.log(error.message);
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword,role } = req.body;
     const photo=req.file;
     console.log("prequest file",photo)
    if (!email || !password || !confirmPassword || !role) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password didn't match. Please try again.",
      });
    }

    // Check if user already exists
    console.log("existing user before query", email, password);
    // const existingUserQuery = `SELECT * FROM user WHERE email = ?`;
    // const existingUser = await User.query(existingUserQuery, [email]);

    const existingUser = await User.findOne({ where: { email: email } });
    console.log("existing user", existingUser);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      role:role,
      profileImage:photo,
    });

    // Return response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("Failed to signUp", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        {
          email: user.email,
          id: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      await user.update({ token: token });

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res
        .cookie("token", token, options)
        .status(200)
        .json({
          success: true,
          token,
          user: {
            id: user.id,

            email: user.email,
          },
          message: "User logged in successfully",
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error:error.message,
      success: false,
      message: "Cannot login. Please try again",
    });
  }
};

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email } });
    console.log(' user',user);
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us. Enter a Valid Email.`,
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // Assuming expiration time is 1 hour
    await user.save();
    
    console.log('user detais',user);
    const url = `https://studynotion/update-password/${resetToken}`;

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    return res.status(200).json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { resetToken } = req.params;
    console.log('token from params',resetToken,req.params,req.body);
    if (confirmPassword !== password) {
      return res.status(401).json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      });
    }

    // Fetch user details from MySQL
    const user = await User.findOne({ where: { resetToken: resetToken } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is Invalid",
      });
    }

    // Check if token has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired. Please try to regenerate token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password in MySQL
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Reset Successful",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
      success: false,
      message: "Some Error in Updating the Password",
    });
  }
};
