import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseAdmin";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 p-2 rounded font-semibold"
      >
        Login
      </button>
    </form>
  );
}
