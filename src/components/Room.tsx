import firebase from "firebase/compat/app";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase-config";
interface Message {
  text: string;
  createdAt: firebase.firestore.Timestamp;
  roomId: string;
  user: {
    name: string | null | undefined;
    photoURL: string | null | undefined;
    email: string | null | undefined;
  };
  id?: string;
}
function Room({ signUserOut }: { signUserOut: () => void }) {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>({});
  const messagesRef = useMemo(() => collection(db, "messages"), []);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [rooms, setRooms] = useState<string[]>([]); // State to store rooms
  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedRooms: Set<string> = new Set();
      querySnapshot.forEach((doc) => {
        const message = doc.data() as Message;
        fetchedRooms.add(message.roomId);
      });
      setRooms(Array.from(fetchedRooms));
    });
    return () => {
      unsubscribe();
    };
  }, [messagesRef]);
  useEffect(() => {
    const q = query(
      messagesRef,
      where("roomId", "==", roomId),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMessages: Message[] = [];

      querySnapshot.forEach((doc) =>
        updatedMessages.push({
          ...(doc.data() as Message),
          id: doc.id,
        })
      );

      roomId &&
        setMessages((prevMessages) => ({
          ...prevMessages,
          [roomId]: updatedMessages,
        }));

      setLoading(false);
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 0);
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, messagesRef]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      roomId: roomId,
      user: {
        name: auth.currentUser?.displayName,
        photoURL: auth.currentUser?.photoURL,
        email: auth.currentUser?.email,
      },
    });

    setNewMessage("");
  };
  const getLastMessage = (roomId: string): Message | undefined => {
    const roomMessages = messages[roomId] || [];

    if (roomMessages.length === 0) {
      return undefined; // No messages for this room
    }

    return roomMessages.reduce((prev, current) => {
      if (!prev.createdAt && !current.createdAt) {
        return prev;
      }

      if (!prev.createdAt) {
        return current;
      }

      if (!current.createdAt) {
        return prev;
      }

      return prev.createdAt.toMillis() > current.createdAt.toMillis()
        ? prev
        : current;
    });
  };

  const isSender = (messageUser: Message["user"]) => {
    return auth.currentUser?.email === messageUser?.email;
  };
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex" }}>
      <div>
        <h1>rooms</h1>

        {rooms.map((room) => (
          <div
            key={room}
            style={{
              display: "flex",
              height: "72",
              padding: "12px 16px",
              alignItems: "center",
              gap: "16",
              alignSelf: "stretch",
            }}
            onClick={() => navigate(`/room/${room}`)}
          >
            <div>
              <img src="" alt="" />
            </div>
            <div
              style={{ display: "flex", gap: "4px", flexDirection: "column" }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    color: "var(--Rich-Black, #011627)",
                    fontFamily: "Inter",
                    fontSize: "16",
                    fontStyle: "normal",
                    fontWeight: "600",
                    lineHeight: "20px",
                    marginRight: "auto",
                  }}
                >
                  {room}
                </div>
                <div>
                  {getLastMessage(room)?.createdAt &&
                    getLastMessage(room)
                      ?.createdAt.toDate()
                      .toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </div>
              </div>
              <div>{getLastMessage(room)?.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button onClick={() => navigate("/")}>Go out of Room</button>
        <button onClick={signUserOut}>Sign out</button>
        <div
          style={{
            display: "flex",
            height: "56",
            padding: "8px 16px",
            alignItems: "flex-start",
            gap: "8",
            flexShrink: "0",
            alignSelf: "stretch",
          }}
        >
          <div>
            <img src="" alt="" />
          </div>
          <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
            <div
              style={{
                color: "var(--Rich-Black, #011627)",
                fontFamily: "Inter",
                fontSize: "16",
                fontStyle: "normal",
                fontWeight: "600",
                lineHeight: "20px",
                marginRight: "auto",
              }}
            >
              {roomId}
            </div>
            <div>last message</div>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "80vw",
            height: "60vh",
            overflowY: "scroll",
            background:
              "url(https://st2.depositphotos.com/5334922/12300/v/450/depositphotos_123004960-Seamless-pattern-with-pink-flowers-Yellow-green-background-with-stylized-doodle-roses-Elegant-template-for-fashion-prints-Vector-illustration-Cute-vintage-floral-backdrop-for-summer-or-spring-design.jpg), lightgray 0% 0% / 60.00000238418579px 60.00000238418579px repeat",

            backgroundBlendMode: "overlay",
          }}
        >
          {loading && <p>Loading...</p>}
          {roomId &&
            messages[roomId]?.map((message: Message) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: isSender(message.user)
                    ? "flex-end"
                    : "flex-start",
                  alignItems: "center",
                }}
                key={message.id}
              >
                <img
                  src={message.user.photoURL || "default-photo-url"}
                  alt="User"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    marginRight: "10px",
                    order: isSender(message.user) ? 1 : 0,
                  }}
                />

                <div
                  style={{
                    backgroundColor: isSender(message.user)
                      ? "#DCF8C6"
                      : "#EAEAEA",
                    padding: "8px",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{ margin: 0, fontWeight: "bold", fontSize: "10px" }}
                  >
                    {message.user.name}
                  </p>
                  <p style={{ margin: 0 }}>{message.text}</p>
                </div>
              </div>
            ))}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              height: 56,
              padding: "8px 16px",
              alignItems: "center",
              gap: "16 px",
              flexShrink: 0,
              alignSelf: "stretch",
              borderRadius: "12px",
              border: "1px solid #EAEAEA",
            }}
          >
            <input
              type="text"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              placeholder="Type a message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Room;
