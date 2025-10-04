import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-full max-w-sm p-6 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">DRX Anime Admin</h1>
        <LoginForm />
      </div>
    </div>
  );
}
