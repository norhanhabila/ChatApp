import { signInWithPopup } from "firebase/auth";
import Cookies from "universal-cookie";
import { auth, provider } from "../firebase-config";

const cookies = new Cookies();
interface authProps {
  setIsAuth: (isAuth: boolean) => void;
}
export const Auth = ({ setIsAuth }: authProps) => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      setIsAuth(true);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <button onClick={signInWithGoogle}> Sign in with Google</button>
    </>
  );
};
