const userModel = require("./User.model");
const jwt = require("jsonwebtoken");

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

module.exports = { register };
