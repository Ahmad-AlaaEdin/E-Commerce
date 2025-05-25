import express from "express";
import { isLoggedIn } from "../controllers/authController";
import { getMyAddress, upsertAddress } from "../controllers/addressController";

const router = express.Router();

router.use(isLoggedIn);

router.get("/", getMyAddress);
router.post("/", upsertAddress);

export default router;
