"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const addressController_1 = require("../controllers/addressController");
const router = express_1.default.Router();
router.use(authController_1.isLoggedIn);
router.get("/", addressController_1.getMyAddress);
router.post("/", addressController_1.upsertAddress);
exports.default = router;
