import { getRedirectResult, signInWithRedirect } from "firebase/auth";
import Cookies from "universal-cookie";
import { auth, provider } from "../firebase-config";

const cookies = new Cookies();
interface authProps {
  setIsAuth: (isAuth: boolean) => void;
}
export const Auth = ({ setIsAuth }: authProps) => {
  const signInWithGoogle = async () => {
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithRedirect(auth, provider);

      // Handle the redirect result (this should be done in a different component or in the main app component)
      const result = await getRedirectResult(auth);
      cookies.set("auth-token", result?.user?.refreshToken);
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
