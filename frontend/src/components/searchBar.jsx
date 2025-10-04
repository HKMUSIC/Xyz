export default function SearchBar({ search, setSearch }) {
  return (
    <div className="p-4 bg-[#121212] border-b border-gray-800">
      <input
        type="text"
        placeholder="Search anime..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 bg-[#1c1c1c] rounded-lg outline-none text-white placeholder-gray-400"
      />
    </div>
  );
}
