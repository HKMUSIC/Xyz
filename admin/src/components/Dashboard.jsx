import { useEffect, useState } from "react";
import { auth } from "../utils/firebaseAdmin";

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
