import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import cookieParser from 'cookie-parser';
import { userAuth } from './middlewares/auth.js';
import  authRouter  from './routes/auth.js';
import profileRouter from './routes/profile.js';
import userRouter from './routes/user.js';
import requestRouter from './routes/request.js';
import cors from 'cors';

export const app=express();
app.use(cookieParser());

app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true,
  }
));

dotenv.config();
// Middleware to parse JSON data
app.use(express.json());
//All routes will be here
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/',userRouter);
app.use('/',requestRouter);
// TO connect to the database and start the server
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server is busy!" });
});

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
