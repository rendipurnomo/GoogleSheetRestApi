import jwt from 'jsonwebtoken';
import { getAllUser } from '../models/userModel.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.email = decoded.email;
    next();
  });
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const userId = decoded.userId;
    const name = decoded.name;
    const email = decoded.email;
    const role = decoded.role;
    const accessToken = jwt.sign(
      { userId, name, email, role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '7d',
      }
    );
    res.json({ accessToken });
  });
};

export const adminOnly = async (req, res, next) => {
  const data = await getAllUser();
  const user = data.find((user) => user.email === req.email);
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Akses Terlarang' });
  }
  next();
}