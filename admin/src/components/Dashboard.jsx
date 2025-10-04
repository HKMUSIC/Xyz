import { useEffect, useState } from "react";
import { auth } from "../utils/firebaseAdmin";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseAdmin";
import UploadAnimeForm from "./UploadAnimeForm";
import AnimeTable from "./AnimeTable";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();
  
export default function Dashboard() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎬 DRX Admin Dashboard</h1>
        <div className="text-sm text-gray-400">{email} 🛡️ (Admin)</div>
      </div>
      {/* Rest of your dashboard */}
    </div>
  );
}

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎬 DRX Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <UploadAnimeForm />
      <AnimeTable />
    </div>
  );
}
