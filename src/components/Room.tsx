import firebase from "firebase/compat/app";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomData, setRoomData] = useState<
    { roomId: string; lastMessage?: Message; status?: { text: string } }[]
  >([]);
  const messagesRef = useMemo(() => collection(db, "messages"), []);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedRoomData: { roomId: string; lastMessage?: Message }[] = [];

      querySnapshot.forEach((doc) => {
        const message = {
          ...(doc.data() as Message),
          id: doc.id,
        };

        const roomIndex = updatedRoomData.findIndex(
          (room) => room.roomId === message.roomId
        );

        if (roomIndex === -1) {
          // Room not found, add a new entry
          updatedRoomData.push({
            roomId: message.roomId,
            lastMessage: message,
          });
        } else {
          // Room found, update the last message if it's newer
          if (
            !updatedRoomData[roomIndex].lastMessage?.createdAt ||
            (message.createdAt &&
              message.createdAt.toMillis() >
                updatedRoomData[roomIndex].lastMessage!.createdAt!.toMillis())
          ) {
            updatedRoomData[roomIndex].lastMessage = message;
          }
        }
      });

      // Rearrange the rooms based on the last message's createdAt date
      updatedRoomData.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt?.toMillis() || 0;
        const timeB = b.lastMessage?.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setRoomData(updatedRoomData);

      setLoading(false);
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
      const messages: Message[] = [];

      querySnapshot.forEach((doc) =>
        messages.push({
          ...(doc.data() as Message),
          id: doc.id,
        })
      );
      setMessages(messages);

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
    const newMessageObj = {
      text: newMessage,
      createdAt: serverTimestamp() as firebase.firestore.Timestamp,
      roomId: roomId || "",
      user: {
        name: auth.currentUser?.displayName,
        photoURL: auth.currentUser?.photoURL,
        email: auth.currentUser?.email,
      },
    };
    setNewMessage("");
    setMessages([...messages, newMessageObj]);
    const existingMessagesQuery = query(
      messagesRef,
      where("text", "==", newMessage),
      where("roomId", "==", newMessageObj.roomId),
      orderBy("createdAt"),
      limit(1)
    );
    const existingMessagesSnapshot = await getDocs(existingMessagesQuery);

    if (existingMessagesSnapshot.empty) {
      // If no matching messages found, add the message to Firestore
      await addDoc(messagesRef, newMessageObj);
    }
  };

  const isSender = (messageUser: Message["user"]) => {
    return auth.currentUser?.email === messageUser?.email;
  };
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex" }}>
      <div style={{ margin: "10px" }}>
        <p
          style={{
            borderBottom: "1px solid #D3D3D3",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: "30px",
          }}
        >
          Rooms
        </p>
        {roomData.map((room) => (
          <div
            key={room.roomId}
            style={{
              width: "180px",
              display: "flex",
              height: "72px",
              padding: "12px 16px",

              gap: "16px",
              alignSelf: "stretch",
            }}
            onClick={() => navigate(`/room/${room.roomId}`)}
          >
            <div>
              <img
                style={{ width: "30px", borderRadius: "50%" }}
                src="https://static.thenounproject.com/png/2837242-200.png"
                alt=""
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "4px",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    color: "var(--Rich-Black, #011627)",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: "600",
                    lineHeight: "20px",
                    marginRight: "auto",
                  }}
                >
                  {room.roomId}
                </div>
                <div>
                  {room.lastMessage?.createdAt &&
                    room.lastMessage?.createdAt.toDate().toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
              <div style={{ textAlign: "left" }}>{room.lastMessage?.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div
          style={{
            display: "flex",
            height: "56px",
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
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: "600",
                lineHeight: "20px",
                marginRight: "auto",
              }}
            >
              {roomId}
            </div>
            <div>
              {roomData.find((room) => room.roomId === roomId)?.status?.text ||
                "Available to chat"}
            </div>
          </div>
          <div style={{ display: "flex", marginLeft: "auto", gap: "10px" }}>
            <button onClick={() => navigate("/")}>Go out of Room</button>
            <button onClick={signUserOut}>Sign out</button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "80vw",
            height: "90vh",
            overflowY: "scroll",
            background:
              "url(https://st2.depositphotos.com/5334922/12300/v/450/depositphotos_123004960-Seamless-pattern-with-pink-flowers-Yellow-green-background-with-stylized-doodle-roses-Elegant-template-for-fashion-prints-Vector-illustration-Cute-vintage-floral-backdrop-for-summer-or-spring-design.jpg), lightgray 0% 0% / 60.00000238418579px 60.00000238418579px repeat",

            backgroundBlendMode: "overlay",
          }}
        >
          {loading && <p>Loading...</p>}
          {messages.map((message) => (
            <div
              style={{
                display: "flex",
                justifyContent: isSender(message.user)
                  ? "flex-end"
                  : "flex-start",
                alignItems: "center",
                margin: "5px",
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
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "10px" }}>
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
              padding: "8px 16px",
              gap: "16px",
              marginTop: "auto",
            }}
          >
            <input
              type="text"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              placeholder="Type a message"
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #EAEAEA",
                width: "100%",
                height: "24px",
              }}
            />
            <button type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12.815 12.197L5.28299 13.453C5.19639 13.4675 5.11513 13.5045 5.04737 13.5603C4.97961 13.6161 4.92775 13.6888 4.89699 13.771L2.29999 20.728C2.05199 21.368 2.72099 21.978 3.33499 21.671L21.335 12.671C21.4597 12.6088 21.5645 12.513 21.6378 12.3945C21.7111 12.276 21.7499 12.1394 21.7499 12C21.7499 11.8607 21.7111 11.7241 21.6378 11.6055C21.5645 11.487 21.4597 11.3913 21.335 11.329L3.33499 2.32901C2.72099 2.02201 2.05199 2.63301 2.29999 3.27201L4.89799 10.229C4.9286 10.3114 4.98041 10.3843 5.04818 10.4403C5.11594 10.4963 5.19728 10.5335 5.28399 10.548L12.816 11.803C12.8623 11.8111 12.9043 11.8353 12.9346 11.8714C12.9649 11.9074 12.9815 11.9529 12.9815 12C12.9815 12.0471 12.9649 12.0926 12.9346 12.1287C12.9043 12.1647 12.8623 12.1889 12.816 12.197H12.815Z"
                  fill="#8BABD8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Room;
