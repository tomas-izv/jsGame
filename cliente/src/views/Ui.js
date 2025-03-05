
import { ConnectionHandler } from "../services/ConectionHandler.js";

export class Ui {
    constructor(boardData, players, currentPlayer) {
        this.size = boardData.size;
        this.elements = boardData.elements;
        this.players = players;
        this.currentPlayer = currentPlayer;
    }

    renderBoard(players, controlsEnabled = true) {
        const boardContainer = document.getElementById('board-container');
        boardContainer.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                const isBush = this.elements.some(bush => bush.x === i && bush.y === j);
                const matchingPlayer = players.find(player => player.x === i && player.y === j);

                if (isBush && matchingPlayer) {
                    cell.classList.add('player-in-bush');
                } else if (isBush) {
                    cell.classList.add('bush');
                } else if (matchingPlayer) {
                    cell.classList.add('player');
                    cell.classList.add(matchingPlayer.direction);
                }
                row.appendChild(cell);
            }
            boardContainer.appendChild(row);
        }

        this.renderControls(boardContainer, controlsEnabled);
    }

    renderControls(container, enabled = true) {
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <button id="advance" ${!enabled ? "disabled" : ""}>Avanzar</button>
            <button id="rotate" ${!enabled ? "disabled" : ""}>Rotar</button>
            <button id="shoot" ${!enabled ? "disabled" : ""}>Disparar</button>
        `;
        container.appendChild(controls);

        // Si están habilitados agregamos los listeners
        if (enabled) {
            document.getElementById('advance').addEventListener('click', () => {
                console.log("El jugador " + this.currentPlayer + " avanza");
                ConnectionHandler.socket.emit("movePlayer", { direction: "advance", playerId: this.currentPlayer });
            });
            document.getElementById('rotate').addEventListener('click', () => {
                console.log("El jugador " + this.currentPlayer + " rota (horario)");
                ConnectionHandler.socket.emit("rotatePlayer", { direction: "right", playerId: this.currentPlayer });
            });
            document.getElementById('shoot').addEventListener('click', () => {
                console.log("El jugador " + this.currentPlayer + " ha disparado");
                ConnectionHandler.socket.emit("shoot", { playerId: this.currentPlayer });
            });
        }
    }

    static showGameOver() {
        alert("Game Over");
    }

    static showRestartButton() {
        const container = document.getElementById('game-container');
        if (document.getElementById('restart-button')) {
            return;
        }
        const btn = document.createElement('button');
        btn.id = 'restart-button';
        btn.innerText = "Reiniciar partida";
        btn.addEventListener('click', () => {
            ConnectionHandler.socket.emit("restartGame", { playerId: ConnectionHandler.gameService.player });
            container.innerHTML = '';
        });
        container.appendChild(btn);
    }
}