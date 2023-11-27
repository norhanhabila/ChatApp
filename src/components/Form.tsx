import React from "react";

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
      <button onClick={signUserOut}>Sign Out</button>
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
