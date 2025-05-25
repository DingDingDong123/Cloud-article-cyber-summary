import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

function Login() {
  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    const res = await fetch("http://localhost:8000/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    console.log("Backend:", data);
  };

  return <button onClick={handleLogin}>Login with Google</button>;
}

export default Login;
