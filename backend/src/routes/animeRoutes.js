import express from "express";
import { getAllAnime, addAnime, deleteAnime } from "../controllers/animeController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAllAnime);
router.post("/", verifyToken, addAnime);
router.delete("/:id", verifyToken, deleteAnime);

export default router;
