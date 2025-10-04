import { useState } from "react";
import axios from "axios";
import { auth } from "../utils/firebaseAdmin";

export default function UploadAnimeForm() {
  const [anime, setAnime] = useState({
    title: "",
    thumbnail: "",
    description: "",
    genre: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setAnime({ ...anime, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        "http://localhost:5000/api/anime",
        anime,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Anime added successfully!");
    } catch (err) {
      setMessage("❌ Error adding anime!");
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded">
      <h2 className="text-xl mb-2 font-semibold">Add New Anime</h2>
      <form onSubmit={handleSubmit} className="grid gap-2">
        <input
          name="title"
          placeholder="Title"
          value={anime.title}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
          required
        />
        <input
          name="thumbnail"
          placeholder="Thumbnail URL"
          value={anime.thumbnail}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={anime.description}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
        />
        <input
          name="genre"
          placeholder="Genre"
          value={anime.genre}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
        />
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
