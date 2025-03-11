import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/jobRoutes.js";
import connectDB from "./config/mongo.js";
import redisClient from "./config/redis.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json()); 

app.use('/api', router); 


app.get("/", (req, res) => {
   res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
