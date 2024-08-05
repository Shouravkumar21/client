import { Routes, Route } from "react-router-dom";
import "./App.css";
import Lobbyscreen from "./Screens/Lobby";
import RoomPage from "./Screens/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobbyscreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
