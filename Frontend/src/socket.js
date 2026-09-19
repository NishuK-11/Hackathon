// src/socket.js
import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  {
    autoConnect: false,
    auth: (cb) => {
      const token = localStorage.getItem("token");
      cb({ token });
    },
  }
);

export default socket;
