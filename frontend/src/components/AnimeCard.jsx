import { Link } from "react-router-dom";

export default function AnimeCard({ anime }) {
  return (
    <Link to={`/anime/${anime.id}`} className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img src={anime.thumbnail} alt={anime.title} className="w-full h-48 object-cover" />
      <div className="p-3">
        <h2 className="font-semibold text-lg">{anime.title}</h2>
        <p className="text-sm text-gray-400">{anime.genre}</p>
      </div>
    </Link>
  );
}
