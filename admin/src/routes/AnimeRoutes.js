import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
import { addAnime, getAllAnime, deleteAnime } from "../controllers/animeController.js";

const router = express.Router();

router.get("/", getAllAnime);
router.post("/", verifyToken, verifyAdmin, addAnime);
router.delete("/:id", verifyToken, verifyAdmin, deleteAnime);

export default router;
