import express from "express";
import { soundcloudSearchController } from "../../controllers/soundcloudController.js";

const router = express.Router();

router.get("/", soundcloudSearchController);

export default router;