import express from "express";
import { connectDataBase } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

connectDataBase();
app.listen(5000, () => {
    console.log("Port started on 5000");
})