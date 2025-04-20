import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getmessages, getUserForSidebars, sendMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute, getUserForSidebars)
router.get("/:id",protectRoute, getmessages)

router.post("/send/:id",protectRoute,sendMessages)

export default router; 