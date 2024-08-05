import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "./services/peer";
import { useSocket } from "../Context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [mystream, SetMyStream] = useState();
  const [remoteSocketId, SetRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    SetRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getoffer();

    socket.emit("user:call", { to: remoteSocketId, offer });
    SetMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      SetMyStream(stream);

      console.log(`Incoming call from ${from} with offer`, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const sendStreams = useCallback(() => {
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
    }
  }, [mystream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getoffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKERS");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Room Page</h1>
      <h4 style={styles.status}>
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>
      {mystream && (
        <button style={styles.button} onClick={sendStreams}>
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button style={styles.button} onClick={handleCallUser}>
          Call
        </button>
      )}
      {mystream && (
        <>
          <h1 style={styles.streamTitle}>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="600px"
            width="500px"
            url={mystream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1 style={styles.streamTitle}>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="500px"
            url={mystream}
          />
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(135deg, #72edf2 10%, #5151e5 100%)",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    color: "white",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  status: {
    fontSize: "1.2rem",
    marginBottom: "30px",
  },
  button: {
    padding: "10px 20px",
    margin: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    background: "#5151e5",
    color: "white",
    transition: "background 0.3s ease",
  },
  buttonHover: {
    background: "#3b3baf",
  },
  streamTitle: {
    fontSize: "1.5rem",
    marginTop: "20px",
    marginBottom: "10px",
  },
};

export default RoomPage;
