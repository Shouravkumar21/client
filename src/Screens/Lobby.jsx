import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitedForm = useCallback(
    (e) => {
      e.preventDefault();
      if (socket) {
        socket.emit("room:join", { email, room });
      }
    },
    [email, room, socket]
  );

  const handlejoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/&{room}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (socket) {
      socket.on("room:join", handlejoinRoom);
      return () => {
        socket.off("room:join", handlejoinRoom);
      };
    }
  }, [socket, handlejoinRoom]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lobby</h1>
      <h2 style={styles.tagline}>Live Connections, Real Moments.</h2>
      <form onSubmit={handleSubmitedForm} style={styles.form}>
        <label htmlFor="email" style={styles.label}>
          Email Id
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <br />
        <label htmlFor="room" style={styles.label}>
          Room Number
        </label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={styles.input}
        />
        <br />
        <button type="submit" style={styles.button}>
          Join
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #3a8dff, #80c7ff)",
    color: "#fff",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  tagline: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    fontStyle: "italic",
    color: "#eaeaea",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    color: "#000",
  },
  label: {
    fontSize: "1rem",
    marginBottom: "10px",
  },
  input: {
    width: "300px",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    background: "#3a8dff",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};

export default LobbyScreen;
