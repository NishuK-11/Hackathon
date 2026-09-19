// src/socket.js
import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL || "https://reflexes-eeo1.onrender.com",
  {
    autoConnect: false,
    auth: (cb) => {
      const token = localStorage.getItem("token");
      cb({ token });
    },
  }
);

export default socket;
