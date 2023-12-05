import { GoogleAuthProvider } from "firebase/auth";
import { useEffect } from "react";
import Cookies from "universal-cookie";
import { auth, ui } from "../firebase-config";
import { User } from "./Room";
const cookies = new Cookies();

const Auth = ({
  setIsAuth,
  signUserOut,
  setUser,
}: {
  setIsAuth: (arg0: boolean) => void;
  signUserOut: () => void;
  setUser: (user: User | null) => void;
}) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("user", user);
      setUser(user);
      if (user) {
        const refreshToken = user.refreshToken;
        cookies.set("auth-token", refreshToken);
        setIsAuth(true);
      } else {
        setIsAuth(false);
        signUserOut();
        ui.start("#firebaseui-auth-container", {
          signInOptions: [new GoogleAuthProvider().providerId],
        });
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [setIsAuth, setUser, signUserOut]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default Auth;
