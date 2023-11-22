interface FormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  room: string;
  setRoom: (room: string) => void;
  signUserOut: () => void;
}
const Form = ({ handleSubmit, room, setRoom, signUserOut }: FormProps) => {
  return (
    <>
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
    </>
  );
};
export default Form;
