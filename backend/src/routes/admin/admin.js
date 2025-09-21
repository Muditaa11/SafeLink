// routes/kyc.js
import express from "express";
import authMiddleware from "../../middleware/auth.js";
import KYC from "../../models/KYC.js";
import authAdmin from "../../middleware/admin.js";
import crypto from "crypto";
import PassCode from "../../models/PassCode.js";
import NewPassRequest from "../../models/NewPassRequest.js";

import KYCRoutes from "./adminKYC.js";
import PassRoutes from "./adminPass.js";

const router = express.Router();

router.use(authAdmin);

router.use("/kyc", KYCRoutes);
router.use("/pass", PassRoutes);


export default router;