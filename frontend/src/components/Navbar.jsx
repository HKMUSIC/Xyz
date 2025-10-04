import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-gray-800">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
        <h1 className="text-xl font-bold text-orange-500">𝑫𝑹𝑿 𝑨𝑵𝑰𝑴𝑬</h1>
      </div>

      <div>
        <Link to="/" className="text-gray-300 hover:text-orange-500 mx-3">Home</Link>
        <a href="https://t.me/thedrxnet" target="_blank" className="text-gray-300 hover:text-orange-500">Telegram</a>
      </div>
    </nav>
  );
}
