import { BoardBuilder } from "./BoardBuilder";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Game, GameStates } from "./entities/Game";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { ServerService } from "../server/ServerService";
import { Socket } from "socket.io";

export class GameService {
    private games: Game[];

    private static instance: GameService;
    private constructor() {
        this.games = [];
    };

    static getInstance(): GameService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new GameService();
        return this.instance;
    }

    public corners: [number, number][] = [];

    // Establish corners (boardSize is the length of the array -1 to get the last position)
    private initCorners(boardSize: number): void {
        this.corners = [
            [0, 0],
            [0, boardSize - 1],
            [boardSize - 1, 0],
            [boardSize - 1, boardSize - 1]
        ];
    }

    public buildPlayer(socket: Socket, boardSize: number): Player {
        if (this.corners.length === 0) {
            this.initCorners(boardSize);
        }

        // Get a random corner for player starting position
        const randomIndex = Math.floor(Math.random() * this.corners.length);
        const [spawnX, spawnY] = this.corners[randomIndex];
        // Delete used corner from array to not duplicate it
        this.corners.splice(randomIndex, 1);

        return {
            direction: Directions.Up,
            id: socket,
            state: PlayerStates.Idle,
            visibility: true,
            x: spawnX,
            y: spawnY,
        };
    }

    public addPlayer(player: Player): boolean {
        const room: Room = RoomService.getInstance().addPlayer(player);
        const genRanHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        if (room.players.length == 1) {
            const game: Game = {
                board: new BoardBuilder().getBoard(),
                id: "game" + genRanHex(128),
                room: room,
                state: GameStates.WAITING
            }
            room.game = game;
            this.games.push(game);
        }

        if (room.occupied) {
            if (room.game) {
                room.game.state = GameStates.PLAYING;
                if (ServerService.getInstance().isActive()) {
                    ServerService.getInstance().gameStartMessage(room.name);
                    ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
                }
            }
            return true;
        }
        
        return false;
    }

    public movePlayer(data: any) {
        const room = RoomService.getInstance().getRoomByPlayerId(data.playerId);
        if (!room || !room.game) return;

        const player = room.players.find((p) => p.id.id === data.playerId);
        if (!player) return;

        // Avoid multiple moves in quick succession
        if (player.state === PlayerStates.Moving) return;

        // Mark player as moving to prevent rapid consecutive moves
        player.state = PlayerStates.Moving;

        const boardSize = room.game.board.size;
        let newX = player.x;
        let newY = player.y;

        if (data.direction === "move") {
            // Position depending on direction
            switch (player.direction) {
                case Directions.Up:
                    newX = player.x - 1;
                    break;
                case Directions.Right:
                    newY = player.y + 1;
                    break;
                case Directions.Down:
                    newX = player.x + 1;
                    break;
                case Directions.Left:
                    newY = player.y - 1;
                    break;
            }

            // Doesn't allow to move to a space that is occupied
            const occupied = room.players.some(p => p.id.id !== data.playerId && p.x === newX && p.y === newY);
            if (occupied) {
                return;
            }

            // Doesn't allow to move outside of the board
            if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) {
                return;
            }

            player.x = newX;
            player.y = newY;

            // Reset player state to idle after movement
            setTimeout(() => {
                player.state = PlayerStates.Idle;
            }, 500); // Add a slight delay before allowing another movement
        }

        
        // Check if the game is over by only having one player left that is alive
        if (this.checkGameOver(room)) {
            ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
        } else {
            ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
        }


    }

    public rotatePlayer(data: any) {
        const room = RoomService.getInstance().getRoomByPlayerId(data.playerId);
        if (!room || !room.game) return;

        const player = room.players.find((p) => p.id.id == data.playerId);
        if (!player) return;

        const clockwiseRotation = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];
        const currentIndex = clockwiseRotation.indexOf(player.direction);
        const newIndex = (currentIndex + 1) % clockwiseRotation.length;
        player.direction = clockwiseRotation[newIndex];

        ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
    }

    public shootPlayer(data: any) {
        const room = RoomService.getInstance().getRoomByPlayerId(data.playerId);
        if (!room || !room.game) return;

        const boardSize = room.game.board.size;
        const shooter = room.players.find(p => p.id.id === data.playerId);
        if (!shooter) return;

        // Shoot square in front of direction
        let targetX = shooter.x;
        let targetY = shooter.y;
        switch (shooter.direction) {
            case Directions.Up:
                targetX = shooter.x - 1;
                break;
            case Directions.Right:
                targetY = shooter.y + 1;
                break;
            case Directions.Down:
                targetX = shooter.x + 1;
                break;
            case Directions.Left:
                targetY = shooter.y - 1;
                break;
        }

        // Makes sure that the square is in the map
        if (targetX < 0 || targetX >= boardSize || targetY < 0 || targetY >= boardSize) {
            return;
        }

        // Checks for a player in the square that is being shot at
        const targetPlayer = room.players.find(p => p.x === targetX && p.y === targetY);
        if (targetPlayer) {
            targetPlayer.state = PlayerStates.Dead;
            console.log(`Player ${targetPlayer.id.id} killed.`);
        }

        if (this.checkGameOver(room)) {
            ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
        } else {
            ServerService.getInstance().sendMessageToRoom(room.name, this.serializationGame(room.game));
        }
    }

    private checkGameOver(room: Room): boolean {
        const alivePlayers = room.players.filter(p => p.state !== PlayerStates.Dead);
        if (alivePlayers.length <= 1) {
            if (room.game)
                room.game.state = GameStates.ENDED;
            return true;
        }
        return false;
    }

    // Converting Room into a JSON to be used for saving/transmitting
    private serializationRoom(room: Room): any {
        return {
            name: room.name,
            occupied: room.occupied,
            players: room.players.map(player => ({
                socketId: player.id.id,
                x: player.x,
                y: player.y,
                state: player.state,
                direction: player.direction,
                visibility: player.visibility
            }))
        };
    }

    // Converting Game into a JSON to be used for saving/transmitting
    public serializationGame(game: Game): any {
        return {
            type: "game",
            content: {
                id: game.id,
                state: game.state,
                room: this.serializationRoom(game.room),
                board: {
                    type: game.board.type,
                    size: game.board.size,
                    elements: game.board.elements
                }
            }
        };
    }
}