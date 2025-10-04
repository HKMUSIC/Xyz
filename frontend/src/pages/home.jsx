import { useEffect, useState } from "react";
import { fetchAllAnime } from "../utils/firebaseHelpers";
import AnimeCard from "../components/AnimeCard";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllAnime().then(setAnimeList);
  }, []);

  const filtered = animeList.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SearchBar search={search} setSearch={setSearch} />
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map(anime => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </>
  );
}
