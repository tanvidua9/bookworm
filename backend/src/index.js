import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const PORT= process.env.PORT||3001;
const app= express();

job.start();
app.use(express.json());
app.use(cors());

app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes);

app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`);
    connectDB();
})