import { db } from "../utils/firebaseAdmin.js";

export const getAllAnime = async (req, res) => {
  try {
    const snapshot = await db.collection("anime").get();
    const animeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(animeList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAnime = async (req, res) => {
  try {
    const { title, thumbnail, description, genre, episodes } = req.body;
    if (!title || !thumbnail) {
      return res.status(400).json({ error: "Title and thumbnail are required" });
    }
    const ref = await db.collection("anime").add({
      title,
      thumbnail,
      description,
      genre,
      episodes,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: ref.id, message: "Anime added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAnime = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("anime").doc(id).delete();
    res.json({ message: "Anime deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
