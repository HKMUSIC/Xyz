import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAnimeById } from "../utils/firebaseHelpers";

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);

  useEffect(() => {
    fetchAnimeById(id).then(setAnime);
  }, [id]);

  if (!anime) return <p className="p-6 text-gray-400">Loading...</p>;

  return (
    <div className="p-6">
      <img src={anime.thumbnail} alt={anime.title} className="w-full max-h-[400px] object-cover rounded-lg" />
      <h1 className="text-2xl font-bold mt-4">{anime.title}</h1>
      <p className="text-gray-400 mt-2">{anime.description}</p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Episodes</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {anime.episodes.map((ep, i) => (
            <Link key={i} to={`/watch/${id}?ep=${i}`} className="bg-[#1c1c1c] p-3 rounded hover:bg-orange-500 transition text-center">
              EP {i + 1}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
