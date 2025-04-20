import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";
import cookieparser from "cookie-parser";
import path from "path"

import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
// const app = express();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use(cookieparser());

app.use(cors({
    origin: "http://localhost:5173", // Allow frontend origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true // Allow cookies if used
}));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(PORT, () => {
    console.log("server is running on PORT:"+ PORT);
    connectDB()
});