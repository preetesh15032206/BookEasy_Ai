import dotenv from 'dotenv';
dotenv.config();
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("chat message", {
    text: "Can I book a hotel in San Francisco?",
    history: [],
    user_id: 1
  });
});

socket.on("chat message", (msg) => {
  console.log("Received AI response:", msg.text);
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
  process.exit(1);
});
