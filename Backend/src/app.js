import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import cookieParser from 'cookie-parser';
import { userAuth } from './middlewares/auth.js';
import  authRouter  from './routes/auth.js';
import profileRouter from './routes/profile.js';
export const app=express();
app.use(cookieParser());

dotenv.config();
// Middleware to parse JSON data
app.use(express.json());
//All routes will be here
app.use('/', authRouter);
app.use('/', profileRouter);
// TO connect to the database and start the server
connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
