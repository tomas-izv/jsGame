import { PrintInterface } from "../interfaces/PrintInterface.js";
import { ConnectionHandler } from "../services/ConnectionHandler.js";

export class Board {
    constructor(data, player) {
        this.size = data.size;
        this.elements = data.elements;
        this.player = player;
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
        // Add bushes to the board
        this.elements.forEach(bush => {
            board[bush.x][bush.y] = 5;
        });

        // PLace players on the board
        players.forEach(player => {
            if (player.visibility) {
                board[player.x][player.y] = 1;
            }
        });

        // Build the string board
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
            board[bush.x][bush.y] = 1;
        });

        players.forEach(player => {
            if (player.visibility) {
                board[player.x][player.y] = 2;
            }
        });

        const boardContainer = document.getElementById('board-container');
        boardContainer.innerHTML = '';

        for (let i = 0; i < size; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.x = i;
                cell.dataset.y = j;

                const isBush = this.elements.some(bush => bush.x === i && bush.y === j);
                const matchingPlayer = players.find(player => player.x === i && player.y === j);

                if (isBush && matchingPlayer) {
                    cell.classList.add('player-in-bush');
                } else if (isBush) {
                    cell.classList.add('bush');
                } else if (matchingPlayer) {
                    cell.classList.add('player', matchingPlayer.direction);
                }

                row.appendChild(cell);
            }
            boardContainer.appendChild(row);
        }

        let controls = document.getElementById('controls-container');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'controls-container';
            controls.className = 'controls';
            controls.innerHTML = `
            <button id="advance">Advance</button>
            <button id="rotate">Rotate</button>
            <button id="shoot">Shoot</button>
        `;
            document.body.appendChild(controls);
        }

        setTimeout(() => this.addEventListeners(), 50);

        // // Animate Board Appearance
        // anime({
        //     targets: '.board-cell',
        //     scale: [0, 1],
        //     opacity: [0, 1],
        //     duration: 500,
        //     easing: 'easeOutBounce',
        //     delay: anime.stagger(30)
        // });

        // // **Animate Bushes**
        // anime({
        //     targets: '.bush',
        //     scale: [0.5, 1],
        //     opacity: [0, 1],
        //     duration: 800,
        //     easing: 'easeOutElastic'
        // });

        this.addEventListeners();
    }

    movePlayer(playerId, newX, newY, direction) {
        const playerElement = document.querySelector(`.player[data-id="${playerId}"]`);

        if (playerElement) {
            anime({
                targets: playerElement,
                translateX: newX * 22, // Assuming each grid cell is 22px
                translateY: newY * 22,
                duration: 400,
                easing: 'easeInOutQuad'
            });

            playerElement.className = `board-cell player ${direction}`;
        }

        this.addEventListeners();
    }

    addEventListeners() {
        const advanceBtn = document.getElementById('advance');
        const rotateBtn = document.getElementById('rotate');
        const shootBtn = document.getElementById('shoot');

        if (!advanceBtn || !rotateBtn || !shootBtn) {
            console.warn("Buttons not found! Retrying...");
            setTimeout(() => this.addEventListeners(), 100); // Retry after 100ms
            return;
        }

        advanceBtn.addEventListener('click', () => {
            console.log("Player " + this.player + " advances");
            ConnectionHandler.socket.emit("movePlayer", { direction: "advance", playerId: this.player });

            const playerElement = document.querySelector(`.player[data-id="${this.player}"]`);
            if (playerElement) {
                anime({
                    targets: playerElement,
                    translateY: "-=22",
                    duration: 400,
                    easing: 'easeInOutQuad'
                });
            }
        });

        rotateBtn.addEventListener('click', () => {
            console.log("Player " + this.player + " rotates");
            ConnectionHandler.socket.emit("rotatePlayer", { direction: "right", playerId: this.player });

            const playerElement = document.querySelector(`.player[data-id="${this.player}"]`);
            if (playerElement) {
                anime({
                    targets: playerElement,
                    rotate: "+=90",
                    duration: 300,
                    easing: "easeInOutQuad"
                });
            }
        });

        shootBtn.addEventListener('click', () => {
            console.log("Player " + this.player + " shot");
            ConnectionHandler.socket.emit("shoot", { playerId: this.player });
        });

        console.log("Event listeners successfully attached!");
    }



    static showGameOver() {
        alert("Game Over");
    }

    static showRestartButton() {
        // Show restart button
        const container = document.getElementById('game-container');
        const btn = document.createElement('button');
        btn.innerText = "Restart game";
        btn.addEventListener('click', () => {
            ConnectionHandler.socket.emit("restartGame", { playerId: ConnectionHandler.gameService.player });
            // Clean the restart container
            container.innerHTML = '';
        });
        container.appendChild(btn);
    }
}