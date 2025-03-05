import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";
import { GameService } from "./GameService.js";
import { PrintInterface } from "../interfaces/PrintInterface.js";

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
            ConnectionHandler.socket.on("connectionStatus", (data) => {
                console.log(data);
                console.log(data.message.jugador);
                ConnectionHandler.gameService.setPlayer(data.message.jugador);
            });
            ConnectionHandler.socket.on("gameStart", (data) => {
                console.log(data);
                GameService.action({ action: "start" });
            });

            ConnectionHandler.socket.on("playerLeave", (data) => {
                GameService.action({ action: "end" });
                console.log("Player left");
            });
            ConnectionHandler.socket.on("message", (data) => {
                console.log(data);
                ConnectionHandler.gameService.do(data);

            });
            ConnectionHandler.socket.on("board", (data) => {
                console.log(data);
                ConnectionHandler.gameService.do(data);
            });
        });

        ConnectionHandler.socket.on("disconnect", () => {
            ConnectionHandler.connected = false;
            onDisconnectedCallback();

        });
    }
}
