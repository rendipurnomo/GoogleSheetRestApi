import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import productRoute from './routes/product.route.js';
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { connectToGoogleSheet } from './config/database.js';

const app = express();
app.use(bodyParser.json());

dotenv.config();

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      maxAge: 24 * 60 * 60 * 1000
    },
    store: new session.MemoryStore(),
  })
)
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// connect database
connectToGoogleSheet();

app.use(fileUpload());
app.use('/api', productRoute);
app.use('/api', userRoute);
app.use('/api', authRoute);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
})