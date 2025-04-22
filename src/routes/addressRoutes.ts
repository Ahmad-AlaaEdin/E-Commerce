import express from "express";
import { protect } from "../controllers/authController";
import { getMyAddress, upsertAddress } from "../controllers/addressController";

const router = express.Router();

router.use(protect);

router.get("/", getMyAddress);
router.post("/", upsertAddress);

export default router;
