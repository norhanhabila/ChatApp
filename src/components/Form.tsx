import React from "react";
import { GoogleLogout } from "react-google-login";

interface FormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  room: string;
  setRoom: (room: string) => void;
  signUserOut: () => void;
}
const Form = ({ handleSubmit, room, setRoom, signUserOut }: FormProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div id="signOutButton">
        <GoogleLogout
          clientId="730353852212-boo8vnhjvg9ah0nf8gns4ok0mmd8ie4v.apps.googleusercontent.com"
          buttonText="LogOut"
          onLogoutSuccess={signUserOut}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <label>Room</label>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};
export default Form;
