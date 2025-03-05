import { Board } from "../entities/Board.js";
import { Player } from "../entities/Player.js";
import { PrintInterface } from "../interfaces/PrintInterface.js";
import { ConnectionHandler } from "./ConnectionHandler.js";

export class GameService {
    #actionsList = {};
    #board = null;
    #gameOverShown = false;
    player = null;
    #players = [];
    #state = null;
    #states = {
        WAITING: 0,
        PLAYING: 1,
        ENDED: 2
    };

    constructor() {
        this.#state = this.#states.WAITING
        this.#players = [];
        this.#actionsList = {
            "NEW_PLAYER": (content) => this.do_newPlayer(content),
            "board": (content) => this.do_start(content),
            "game": (content) => this.do_gameStart(content),

        };
    }

    setPlayer(player) {
        this.player = player;
    }

    do(data) {
        this.#actionsList[data.type](data.content)
    };

    do_newPlayer(content) {
        console.log("New player joined");
    };

    do_start(content) {
        console.log(content);
        const boardInstance = new Board(content, this.player);
        boardInstance.print();
        boardInstance.printInHtml();
    };



    do_gameStart(content) {
        const boardInstance = new Board(content.board, this.player);

        const alivePlayers = content.room.players.filter(player => player.state !== 1 /* DEAD */);
        this.#players = alivePlayers;

        // if (!alivePlayers.find(p => p.socketId === this.player)) {
        //     if (!this.#gameOverShown) {
        //         Board.showGameOver();
        //         this.#gameOverShown = true;
        //     }
        //     return;
        // }

        this.#gameOverShown = false;

        if (content.state === 2 /* ENDED */) {
            this.#state = this.#states.ENDED;
            Board.showRestartButton();
        }

        boardInstance.print(alivePlayers);
        boardInstance.printInHtml(alivePlayers);
    }
}