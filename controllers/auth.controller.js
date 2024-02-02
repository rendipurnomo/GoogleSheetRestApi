import { doc } from '../config/database.js';
import { getAllUser } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try{

    const data = await getAllUser();
    if (!data) {
      return res.status(404).json({
        message: 'User not found',
      })
    }
    const user = data.find(
      (user) => user.email === req.body.email
    )
    console.log(user)
    if (!user) {
      return res.status(404).json({
        message: 'Email not registered',
      })
    }
    const password = req.body.password

    if(!password) {
      return res.status(400).json({
        message: 'Please enter password'
      })
    }

    const checkPassword = await bcrypt.compare(
      password, user.password
    )

    if(!checkPassword) {
      return res.status(400).json({
        message: 'Wrong password'
      })
    }
    req.session.userId = user.id;

    const id = user.id;
    const name = user.name;
    const email = user.email;

    const accessToken = jwt.sign(
      { id, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '20s' }
    )

    const refreshToken = jwt.sign(
      { id, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    })

    

    return res.status(200).json({
      message: 'Login success',
      accessToken
    })
  }catch(error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  const user = await getAllUser();
  if (!user) return res.sendStatus(204);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logout success' });
}
