import { doc } from "../config/database.js";
import { getAllUser } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = async (req,res) => {
  try {
    const rows = await getAllUser();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({message: error.message}); 
  }
}

export const getUser = async (req,res) => {
  try {
    const rows = await getAllUser();
    const id = req.params.id;
    const data = rows.filter(row => row.id == id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: error.message}); 
  }
}

export const addUser = async (req,res) => {
  const { name, email, password, confirmPassword } = req.body;

  if(!name || !email || !password || !confirmPassword) {
    return res.status(400).json({message: 'Please fill in all fields!'});
  }

  if(password !== confirmPassword) {
    return res.status(400).json({message: 'Password did not match!'});
  }

  if(password.length < 6) {
    return res.status(400).json({message: 'Password must be at least 6 characters!'});
  }

  if(!email.includes('@')) {
    return res.status(400).json({message: 'Invalid email!'});
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await getAllUser();
  const emailExist = user.find(user => user.email === email);

  if(emailExist) {
    return res.status(400).json({message: 'Email already used!'});
  }

  const fileName = 'default' + Date.now() + '.png';
  const filePath = `./public/default/profile.png`;
  const output = `./public/users/${fileName}`;

  const img = fs.readFileSync(filePath);
  fs.writeFileSync(output, img);

  const url = `${req.protocol}://${req.get('host')}/users/${fileName}`;
  try {
    const sheet = doc.sheetsByIndex[1];
    const id = uuidv4();
    const newRow = await sheet.addRow({
      id,
      name,
      email,
      password: hash,
      image: fileName,
      imageUrl: url,
      role: 'user'
    });

    // Return the new row
    res.status(201).json({
      id: newRow._rawData[0],
      name: newRow._rawData[1],
      email: newRow._rawData[2],
      password: newRow._rawData[3],
      address: newRow._rawData[4],
      phone: newRow._rawData[5],
      image: newRow._rawData[6],
      imageUrl: newRow._rawData[7],
      role: newRow._rawData[8],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const editUser = async (req,res) => {
    const row = await getAllUser();
    const id = req.params.id;

    const data = row.filter((row) => row.id == id);
    if (data.length == 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let fileName = '';
    if(req.file === null){
      fileName = data[0].image;
    }
    else {
      const file = req.files.file;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const allowedType = ['.png', '.jpg', '.jpeg'];

      if (!allowedType.includes(ext.toLowerCase())) {
        return res.status(422).json({ message: 'Please upload an image file (png, jpg, jpeg)' });
      }

      if (file.data.length > 2000000) {
        return res.status(422).json({ message: 'Image must be less than 2mb' });
      }

      const url = `${req.protocol}://${req.get('host')}/users/${fileName}`;
      try {
        const sheet = doc.sheetsByIndex[1];
        const rows = await sheet.getRows();
        const user = rows.filter((row) => row._rawData[0] == id);
        const datas = user[0]._rowNumber

        const { name, address, phone } = req.body;
        rows[datas-2].assign({ id: id, name: name, address: address, phone: phone, image: fileName, imageUrl: url });
        await rows[datas-2].save();
        const filePath = `./public/users/${data[0].image}`;
        fs.unlinkSync(filePath);

        file.mv(`./public/users/${fileName}`);
        res.status(200).json({
          message: 'Data updated successfully',
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
}

export const deleteUser = async (req,res) => {
  try {
    const sheet = doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    const id = req.params.id;
    const user = rows.filter((row) => row._rawData[0] == id);
    if (user.length == 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const datas = user[0]._rowNumber;
    const row = await getAllUser();
    const data = row.filter((row) => row.id == id);
    if (data.length == 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    await rows[datas - 2].delete();
    const filePath = `./public/users/${data[0].image}`;
    fs.unlinkSync(filePath);
    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}