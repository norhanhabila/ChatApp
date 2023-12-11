import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import Cookies from "universal-cookie";
import { User } from "../App";
const cookies = new Cookies();

const Auth = ({
  setIsAuth,
  signUserOut,
  setUser,
}: {
  setIsAuth: (arg0: boolean) => void;
  signUserOut: () => void;
  setUser: (arg0: User) => void;
}) => {
  const responseGoogle = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    // Handle the Google login response here
    if ("tokenId" in response) {
      cookies.set("auth-token", response.tokenObj.access_token);
      setUser(response.profileObj);
      setIsAuth(true);
    } else {
      setIsAuth(false);
      signUserOut();
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
      <GoogleLogin
        clientId="730353852212-boo8vnhjvg9ah0nf8gns4ok0mmd8ie4v.apps.googleusercontent.com"
        buttonText="Login with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        // cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export default Auth;
