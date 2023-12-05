import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import "./App.css";
import Auth from "./components/Auth";
import Form from "./components/Form";
import Room, { User } from "./components/Room";
import { auth } from "./firebase-config";
const cookies = new Cookies();
const App = () => {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  console.log(auth.currentUser);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (room === "") return;
    navigate(`/room/${room}`);
    setRoom("");
  };

  const signUserOut = async () => {
    await signOut(auth);
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
