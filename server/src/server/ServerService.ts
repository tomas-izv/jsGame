import { DefaultEventsMap, Server, Socket } from 'socket.io';
import http from 'http';
import { Directions, Player, PlayerStates } from '../player/entities/Player';
import { GameService } from '../game/GameService';
import { BoardBuilder } from '../game/BoardBuilder';
import { Room } from '../room/entities/Room';
import { RoomService } from '../room/RoomService';
import { GameStates } from '../game/entities/Game';

export class ServerService {
    private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null;
    /* 
    I've created this because when I clicked one of the buttons, it did it many times even infinitely,
    so I found information about Debouncing and flagging and tried to replicate how it works.
    https://developer.mozilla.org/en-US/docs/Glossary/Debounce

    I saw that there is something similar called Throttling, but I decided to go for Debouncing as I understood it more.
    */
    private debounceMap: Map<string, { move: boolean, rotate: boolean, shoot: boolean }> = new Map();
    private active: boolean;

    private messages = [
        ""
    ]

    private static instance: ServerService;

    private constructor() {
        this.io = null;
        this.active = false;
    };

    static getInstance(): ServerService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ServerService();
        return this.instance;
    }

    public init(httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.active = true;

        this.io.on('connection', (socket) => {
            this.debounceMap.set(socket.id, { move: false, rotate: false, shoot: false });
            // Connect
            socket.emit("connectionStatus", {
                status: true,
                message: {
                    conexion: "Established connection",
                    player: socket.id
                }
            });
            GameService.getInstance().addPlayer(GameService.getInstance().buildPlayer(socket, 10));

            // // When a player disconnects
            // socket.on('disconnect', () => {
            //     console.log('A player has disconnected:', socket.id);
                
            //     // I believe that the debounce of each player has to deleted when they disconnect/leave
            //     this.debounceMap.delete(socket.id);

            //     let room = RoomService.getInstance().getRoomByPlayerId(socket.id);
            //     if (room) {
            //         let player = room.players.find(p => p.id.id === socket.id); // I had to add an .id because I was getting an error of type coompability
            //         if (player) {
            //             player.state = PlayerStates.Not_Connected; 
            //             this.io?.to(room.name.toString()).emit("updateGame", room);
            //         }
            //     }
            // });

            // //When a player reconnects
            // socket.on("reconnect", () => {
            //     console.log('A player has reconnected:', socket.id);

            //     let room = RoomService.getInstance().getRoomByPlayerId(socket.id);
            //     if (room) {
            //         let player = room.players.find(p => p.id.id === socket.id);
            //         if (player) {
            //             player.state = PlayerStates.Idle;
            //             this.io?.to(room.name.toString()).emit("updateGame", room);
            //         }
            //     }
            // });

            // When a player moves
            socket.on("movePlayer", (data) => {
                const playerId = socket.id;
                const debounceFlag = this.debounceMap.get(playerId);

                if (!debounceFlag || debounceFlag.move) return;

                debounceFlag.move = true;
                GameService.getInstance().movePlayer(data);
                setTimeout(() => {
                    debounceFlag.move = false;
                }, 100);
            });

            // When a player shoots
            socket.on("shoot", (data) => {
                const playerId = socket.id;
                const debounceFlags = this.debounceMap.get(playerId);

                if (!debounceFlags || debounceFlags.shoot) return;

                debounceFlags.shoot = true;
                GameService.getInstance().shootPlayer(data);
                setTimeout(() => {
                    debounceFlags.shoot = false;
                }, 100);
            });

            // When a player rotates
            socket.on("rotatePlayer", (data) => {
                const playerId = socket.id;
                const debounceFlags = this.debounceMap.get(playerId);

                if (!debounceFlags || debounceFlags.rotate) return;
                
                debounceFlags.rotate = true;
                GameService.getInstance().rotatePlayer(data);
                setTimeout(() => {
                    debounceFlags.rotate = false;
                }, 100);
            });
        });
    }

    public addPlayerToRoom(player: Socket, room: String) {
        player.join(room.toString());
    }

    public gameStartMessage(room: String) {
        console.log("Game start");
        const board = new BoardBuilder().serializationBoard();
        console.log(board);
        this.io?.to(room.toString()).emit('board', board); // I added ? because of this error: 'Object is possibly 'null'.'
    }

    public isActive() {
        return this.active;
    }

    public sendMessageToRoom(room: String, message: String) {
        this.io?.to(room.toString()).emit('message', message);
    }
}