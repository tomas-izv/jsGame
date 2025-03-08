import { ConnectionHandler } from "../services/ConectionHandler.js";

export class Ui {
    constructor(boardData, currentPlayer, players) {
        this.currentPlayer = currentPlayer;
        this.elements = boardData.elements;
        this.players = players;
        this.size = boardData.size;
    }

    renderBoard(players, controlsEnabled = true) {
        const boardContainer = document.getElementById('board-container');
        boardContainer.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            for (let j = 0; j < this.size; j++) {
                const square = document.createElement('div');
                square.className = 'board-square';
                const isBush = this.elements.some(bush => bush.x === i && bush.y === j);
                const isPlayer = players.find(player => player.x === i && player.y === j);

                if (isBush && isPlayer) {
                    square.classList.add('player-in-bush');
                } else if (isBush) {
                    square.classList.add('bush');
                } else if (isPlayer) {
                    square.classList.add('player');
                    square.classList.add(isPlayer.direction);
                }
                row.appendChild(square);
            }
            boardContainer.appendChild(row);
        }

        this.renderControls(boardContainer, controlsEnabled);
    }

    renderControls(container, enabled = true) {
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <button id="move" ${!enabled ? "disabled" : ""}>Move</button>
            <button id="rotate" ${!enabled ? "disabled" : ""}>Rotate</button>
            <button id="shoot" ${!enabled ? "disabled" : ""}>Shoot</button>
        `;
        container.appendChild(controls);

        if (enabled) {
            const moveBtn = document.getElementById('move');
            const rotateBtn = document.getElementById('rotate');
            const shootBtn = document.getElementById('shoot');

            /* 
            I was getting infinite loops when clicking the buttons, so I decided to clean the eventListeners
            to avoid several listeners at the same time.
            https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
            */
            moveBtn.removeEventListener('click', this.handleMove);
            rotateBtn.removeEventListener('click', this.handleRotate);
            shootBtn.removeEventListener('click', this.handleShoot);

            // This is to define the handlers
            this.handleMove = () => {
                console.log("Player " + this.currentPlayer + " moved");
                ConnectionHandler.socket.emit("movePlayer", { direction: "move", playerId: this.currentPlayer });
            };

            this.handleRotate = () => {
                console.log("Player " + this.currentPlayer + " rotated");
                ConnectionHandler.socket.emit("rotatePlayer", { direction: "right", playerId: this.currentPlayer });
            };

            this.handleShoot = () => {
                console.log("Player " + this.currentPlayer + " shot");
                ConnectionHandler.socket.emit("shoot", { playerId: this.currentPlayer });
            };

            // Attaching event listeners
            moveBtn.addEventListener('click', this.handleMove);
            rotateBtn.addEventListener('click', this.handleRotate);
            shootBtn.addEventListener('click', this.handleShoot);
        }
    }

    static showGameOver() {
        alert("Game Over");
    }
}