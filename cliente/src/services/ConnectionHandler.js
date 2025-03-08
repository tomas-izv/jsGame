import { GameService } from "./GameService.js";
import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";
import { UIv1 } from "../UIv1.js";

export const ConnectionHandler = {
    connected: false,
    gameService: new GameService(),
    socket: null,
    url: null,
    init: (url, onConnectedCallback, onDisconnectedCallback) => {
        ConnectionHandler.socket = io(url);
        ConnectionHandler.socket.on("connect", (data) => {
            ConnectionHandler.connected = true;
            console.log(data);
            onConnectedCallback();
            ConnectionHandler.socket.on("board", (data) => {
                console.log(data);
                ConnectionHandler.gameService.do(data);
            });
            ConnectionHandler.socket.on("connectionStatus", (data) => {
                console.log(data.message.player);
                ConnectionHandler.gameService.setPlayer(data.message.player);
            });
            ConnectionHandler.socket.on("gameStart", (data) => {
                console.log(data);
                GameService.action({ action: "start" });
            });
            ConnectionHandler.socket.on("message", (data) => {
                console.log(data);
                ConnectionHandler.gameService.do(data);
            });
            ConnectionHandler.socket.on("playerLeave", () => {
                GameService.action({ action: "end" });
                console.log("Player left");
            });
        });

        ConnectionHandler.socket.on("disconnect", () => {
            ConnectionHandler.connected = false;
            onDisconnectedCallback();
        });
    }
}
