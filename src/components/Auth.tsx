import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Cookies from "universal-cookie";
import { auth } from "../firebase-config";

const cookies = new Cookies();
interface authProps {
  setIsAuth: (isAuth: boolean) => void;
}
const Auth = ({ setIsAuth }: authProps) => {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider()).then((result) =>
        cookies.set("auth-token", result.user.refreshToken)
      );

      setIsAuth(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <button onClick={signInWithGoogle}> Sign in with Google</button>
    </div>
  );
};
export default Auth;
