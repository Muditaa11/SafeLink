import express from "express";
import { getDestinationsByState } from "../controllers/destinationController.js";

const router = express.Router();

router.get("/:state", getDestinationsByState);

export default router;
