const User = require("../model/userModel.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, company_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = new User({ email, password, full_name, company_name });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.full_name },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    // Return the full user object so the frontend Settings page can pre-fill data
    res.status(200).json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.full_name,
        // Add these fields to the login response
        businessName: user.businessName,
        businessType: user.businessType,
        gstin: user.gstin,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        upiId: user.upiId
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- UPDATE PROFILE CONTROLLER ---
exports.updateProfile = async (req, res) => {
  try {
    // req.user.id comes from the authMiddleware
    const user = await User.findById(req.user.id);
    
    if (user) {
      // Update fields if they exist in the request body
      // Using direct assignment allows clearing fields (sending empty string)
      if (req.body.businessName !== undefined) user.businessName = req.body.businessName;
      if (req.body.businessType !== undefined) user.businessType = req.body.businessType;
      if (req.body.gstin !== undefined) user.gstin = req.body.gstin;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.address !== undefined) user.address = req.body.address;
      if (req.body.city !== undefined) user.city = req.body.city;
      if (req.body.state !== undefined) user.state = req.body.state;
      if (req.body.upiId !== undefined) user.upiId = req.body.upiId;

      const updatedUser = await user.save();
      
      // Return user without password
      const userResponse = updatedUser.toObject();
      delete userResponse.password;
      
      res.json(userResponse);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};