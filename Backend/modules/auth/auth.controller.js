const userModel = require("./User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const exisingUser = await userModel.findOne({
      email: req.body.email,
    });

    if (exisingUser)
      return res.status(400).json({
        message: "Email already exist",
      });

    const newUser = await userModel.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      phone: req.body.phone,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const validUser = await userModel.findOne({
      email: req.body.email,
    }).select('+password');
    if (!validUser)
      return res.status(401).json({ Message: "Invalid credentials" });
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      validUser.password,
    );
    if (!isValidPassword)
      return res.status(401).json({ Message: "Invalid credentials" });
    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn : process.env.JWT_EXPIRES_IN },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token : token,
      user : {
        id : validUser._id,
        name : validUser.name,
        email : validUser.email,
        role : validUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { register, login, getUser }
