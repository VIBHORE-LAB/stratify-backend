import db from "../models/index.js";
import { hashPassword } from "../utils/hash.js";
import { signJwt } from "../config/jwt.js";

const { User } = db;

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, name });
    const token = signJwt({ sub: user.id });
    
    return res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signJwt({ sub: user.id });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
