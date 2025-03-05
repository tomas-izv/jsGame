import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";

const socket = io("http://localhost:3000");
socket.on("connection", (data) => {
    console.log("I'm connected");
    socket.on("response", (dato) => {
        console.log(dato);
    });
});


console.log(socket);

socket.emit("message", "hello");
