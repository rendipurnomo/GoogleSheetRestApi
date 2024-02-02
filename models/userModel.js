import { doc } from "../config/database.js";

export const getAllUser = async () => {
  const sheet = doc.sheetsByIndex[1];
  try {
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const rowsData = rows.map((row) => ({
      id: row._rawData[0],
      name: row._rawData[1],
      email: row._rawData[2],
      password: row._rawData[3],
      address: row._rawData[4],
      phone: row._rawData[5],
      image: row._rawData[6],
      imageUrl: row._rawData[7],
      role: row._rawData[8],
    }));
    return rowsData;

  } catch (error) {
    console.log('Error fetching rows:', error);
    throw error;
  }
}
