import { Router } from "express";
import { fetchTickers, getTickers } from "../controllers/tickerController.js";

const router = Router();

router.post("/fetch", fetchTickers);
router.get("/", getTickers);

export default router;
