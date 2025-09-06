import express from "express";
import { getUserHistory } from "../controllers/historyController.js";

const router = express.Router();

router.get("/:userId", getUserHistory);

export default router;
