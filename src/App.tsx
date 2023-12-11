import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import "./App.css";
import Auth from "./components/Auth";
import Form from "./components/Form";
import Room from "./components/Room";
import { auth } from "./firebase-config";
const cookies = new Cookies();
export interface User {
  email: string;
  familyName?: string;
  givenName?: string;
  googleId?: string;
  imageUrl: string;
  name: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState("");
  const navigate = useNavigate();
  console.log(auth.currentUser);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (room === "") return;
    navigate(`/room/${room}`);
    setRoom("");
  };
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId:
          "730353852212-boo8vnhjvg9ah0nf8gns4ok0mmd8ie4v.apps.googleusercontent.com",
        scope: "",
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  const signUserOut = () => {
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom("");
  };

  if (!isAuth) {
    return (
      <>
        <Auth
          setIsAuth={setIsAuth}
          signUserOut={signUserOut}
          setUser={setUser}
        />
      </>
    );
  }

  return (
    <Routes>
      <Route
        path="/room/:roomId"
        element={<Room signUserOut={signUserOut} user={user} />}
      ></Route>

      <Route
        path="/"
        element={
          isAuth ? (
            <Form
              handleSubmit={handleSubmit}
              room={room}
              setRoom={setRoom}
              signUserOut={signUserOut}
            />
          ) : (
            <Auth
              setIsAuth={setIsAuth}
              signUserOut={signUserOut}
              setUser={setUser}
            />
          )
        }
      />
    </Routes>
  );
};
export default App;
