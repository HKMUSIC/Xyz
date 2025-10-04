import { useEffect, useState } from "react";
import axios from "axios";

export default function AnimeTable() {
  const [animeList, setAnimeList] = useState([]);

  const fetchAnime = async () => {
    const { data } = await axios.get("http://localhost:5000/api/anime");
    setAnimeList(data);
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h2 className="text-xl mb-3 font-semibold">All Anime</h2>
      <table className="w-full text-left text-gray-300">
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Thumbnail</th>
          </tr>
        </thead>
        <tbody>
          {animeList.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.genre}</td>
              <td>
                <img src={a.thumbnail} alt="" className="h-12 w-12 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
