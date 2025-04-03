import {io} from 'socket.io-client';

const socket  = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websockets"],
});

socket.on("connect", () => console.log("socket connected"));
socket.on("disconnect", () => console.log("socket disconnected"));

export default socket;