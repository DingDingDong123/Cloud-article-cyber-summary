import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await fetch("http://localhost:8000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Logged in user:", data);

      // Redirect to dashboard after login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please allow pop-ups.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome Back</h1>
        <p className="text-gray-600 mb-6 text-center">Please sign in to continue</p>
        <button
          onClick={handleLogin}
          className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-lg"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
