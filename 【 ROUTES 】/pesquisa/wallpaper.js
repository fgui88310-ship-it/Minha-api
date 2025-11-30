import express from "express";
import { wallpaperController } from "../../controllers/wallpaperController.js";

const router = express.Router();

router.get("/", wallpaperController);

export default router;