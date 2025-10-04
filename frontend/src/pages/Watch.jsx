import { useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAnimeById } from "../utils/firebaseHelpers";
import VideoPlayer from "../components/VideoPlayer";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [anime, setAnime] = useState(null);

  const epIndex = parseInt(params.get("ep") || "0");

  useEffect(() => {
    fetchAnimeById(id).then(setAnime);
  }, [id]);

  if (!anime) return <p className="p-6 text-gray-400">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-3">{anime.title} — Episode {epIndex + 1}</h1>
      <VideoPlayer src={anime.episodes[epIndex]} />
    </div>
  );
}
