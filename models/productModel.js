import { doc } from '../config/database.js';

export const getAllProduct = async () => {
  const sheet = doc.sheetsByIndex[0];
  try {
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const rowsData = rows.map((row) => ({
      id: row._rawData[0],
      name: row._rawData[1],
      brand: row._rawData[2],
      description: row._rawData[3],
      category: row._rawData[4],
      price: row._rawData[5],
      stock: row._rawData[6],
      image: row._rawData[7],
      imageUrl: row._rawData[8],
    }));
    return rowsData;
  } catch (error) {
    console.log('Error fetching rows:', error);
    throw error;
  }
};
