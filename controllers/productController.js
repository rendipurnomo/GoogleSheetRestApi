import { doc } from '../config/database.js';
import { getAllProduct } from '../models/productModel.js';
import path from 'path';
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';

export const getProducts = async (req, res) => {
  try {
    const rows = await getAllProduct();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const rows = await getAllProduct();
    
    const id = req.params.id;
    const data = rows.filter((row) => row.id == id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProduct = async (req, res) => {
  if(!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get('host')}/images/${fileName}`;
  const allowedType = ['.png', '.jpg', '.jpeg'];
  const fileSize = file.data.length;

  if(!allowedType.includes(ext.toLowerCase())) {
    return res.status(422).json({ message: 'Please upload an image file (png, jpg, jpeg)' });
  }

  if(fileSize > 2000000) {
    return res.status(422).json({ message: 'Image must be less than 2mb' });
  }

  file.mv(`./public/images/${fileName}`, async (err) => {
    if(err) {
      return res.status(500).json({ message: err.message });
    }
  })
  try {
    const sheet = doc.sheetsByIndex[0];
    const id = uuidv4();
    // Get the data from the request body
    const { name, brand, description,category, price, stock } = req.body;
    const newRow = await sheet.addRow({ id, name, brand, description,category, price, stock, image: fileName, imageUrl:url });

    // Return the new row
    res.status(201).json({
      id: newRow._rawData[0],
      name: newRow._rawData[1],
      brand: newRow._rawData[2],
      description: newRow._rawData[3],
      category: newRow._rawData[4],
      price: newRow._rawData[5],
      stock: newRow._rawData[6],
      image: newRow._rawData[7],
      imageUrl: newRow._rawData[8],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editProduct = async (req, res) => {
  const row = await getAllProduct();
  const id = req.params.id;

  const data = row.filter((row) => row.id == id);
  if (data.length == 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  let fileName = '';
  if (req.files === null) {
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

    const url = `${req.protocol}://${req.get('host')}/images/${fileName}`;
    try {
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      const product = rows.filter((row) => row._rawData[0] == id);
      const datas = product[0]._rowNumber

      const { name, brand, description,category, price, stock } = req.body;
      rows[datas-2].assign({ id: id, name: name, brand: brand, description: description, category: category, price: price, stock: stock, image: fileName, imageUrl: url });
      await rows[datas-2].save();
      const filePath = `./public/images/${data[0].image}`;
      fs.unlinkSync(filePath);

      file.mv(`./public/images/${fileName}`);
      res.status(200).json({
        message: 'Data updated successfully',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const id = req.params.id;
    const product = rows.filter((row) => row._rawData[0] == id);
    if(product.length == 0) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const datas = product[0]._rowNumber;
    const row = await getAllProduct();
    const data = row.filter((row) => row.id == id);
    if (data.length == 0) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    await rows[datas-2].delete();
    const filePath = `./public/images/${data[0].image}`;
    fs.unlinkSync(filePath);
    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
