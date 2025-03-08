import { Board } from "../entities/Board.js";
import { ConnectionHandler } from "./ConnectionHandler.js";
import { UIv1 } from "../UIv1.js";
import { Player } from "../entities/Player.js";

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
        this.#actionsList = {
            "NEW_PLAYER": (content) => this.do_newPlayer(content),
            "board": (content) => this.do_start(content),
            "game": (content) => this.do_gameStart(content),
        };
        this.#players = [];
        this.#state = this.#states.WAITING
    }

    do(data) {
        this.#actionsList[data.type](data.content)
    };
    
    setPlayer(player) {
        this.player = player;
    }

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

        const alivePlayers = content.room.players.filter(player => player.state !== 1);
        this.#players = alivePlayers;

        this.#gameOverShown = false;

        if (content.state === 2) {
            this.#state = this.#states.ENDED;
        }

        boardInstance.print(alivePlayers);
        boardInstance.printInHtml(alivePlayers);
    }
}