import { ConnectionHandler } from "../services/ConnectionHandler.js";
import { UIv1 } from "../UIv1.js";

export class Board {
    constructor(data, player) {
        this.elements = data.elements;
        this.player = player;
        this.size = data.size;
    }

    addElement(element) {
        this.elements.push(element);
    }

    // Add players to the board
    print(players = []) {
        console.log("Printed player: " + this.player);
        const size = this.size;
        let board = Array(size).fill().map(() => Array(size).fill(0));
        console.log(this.elements);

        // Place bushes to the board
        this.elements.forEach(bush => {
            board[bush.x][bush.y] = 5;
        });

        // Place players on the board
        players.forEach(player => {
            if (player.visibility) {
                board[player.x][player.y] = 1;
            }
        });

        // Build the board
        let boardString = "";
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 5) {
                    boardString += "";
                } else if (board[i][j] === 1) {
                    boardString += "";
                } else {
                    boardString += "";
                }
            }
            boardString += "\n";
        }
        console.log(boardString);
    }

    printInHtml(players = []) {
        const size = this.size;
        let board = Array(size).fill().map(() => Array(size).fill(0));

        this.elements.forEach(bush => {
            board[bush.x][bush.y] = 5;
        });

        players.forEach(player => {
            if (player.visibility) {
                board[player.x][player.y] = 2; // Player visibility = 2
            }
        });

        const boardContainer = document.getElementById('board-container');
        boardContainer.innerHTML = '';

        for (let i = 0; i < size; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            for (let j = 0; j < size; j++) {
                const square = document.createElement('div');
                square.className = 'board-square';
                square.dataset.x = i;
                square.dataset.y = j;

                const isBush = this.elements.some(bush => bush.x === i && bush.y === j);
                const isPlayer = players.find(player => player.x === i && player.y === j);

                if (isBush && isPlayer) {
                    square.classList.add('player-in-bush');
                } else if (isBush) {
                    square.classList.add('bush');
                } else if (isPlayer) {
                    square.classList.add('player', isPlayer.direction);
                }

                row.appendChild(square);
            }
            boardContainer.appendChild(row);
        }

        let controls = document.getElementById('controls-container');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'controls-container';
            controls.className = 'controls';
            controls.innerHTML = `
            <button id="move">Move</button>
            <button id="rotate">Rotate</button>
            <button id="shoot">Shoot</button>
        `;
            document.body.appendChild(controls);
        }

        setTimeout(() => this.addEventListeners(), 25);


        this.addEventListeners();
    }

    movePlayer(playerId, newX, newY, direction) {
        const playerElement = document.querySelector(`.player[data-id="${playerId}"]`);

        if (playerElement) {
            playerElement.className = `board-square player ${direction}`;
        }

        this.addEventListeners();
    }

    addEventListeners() {
        //I've done the the same as in Ui.js to try and fix the issue.
        const moveBtn = document.getElementById('move');
        const rotateBtn = document.getElementById('rotate');
        const shootBtn = document.getElementById('shoot');

        if (!moveBtn || !rotateBtn || !shootBtn) {
            console.warn("Could not find buttons, Retrying");
            setTimeout(() => this.addEventListeners(), 50);
            return;
        }

        moveBtn.removeEventListener('click', this.handleMove);
        rotateBtn.removeEventListener('click', this.handleRotate);
        shootBtn.removeEventListener('click', this.handleShoot);

        this.handleMove = () => {
            console.log("Player " + this.player + " moved");
            ConnectionHandler.socket.emit("movePlayer", { direction: "move", playerId: this.player });
        };

        this.handleRotate = () => {
            console.log("Player " + this.player + " rotated");
            ConnectionHandler.socket.emit("rotatePlayer", { direction: "right", playerId: this.player });
        };

        this.handleShoot = () => {
            console.log("Player " + this.player + " shot");
            ConnectionHandler.socket.emit("shoot", { playerId: this.player });
        };

        moveBtn.addEventListener('click', this.handleMove);
        rotateBtn.addEventListener('click', this.handleRotate);
        shootBtn.addEventListener('click', this.handleShoot);

        console.log("Event listeners success");
    }

    static showGameOver() {
        alert("Game Over");
    }
}