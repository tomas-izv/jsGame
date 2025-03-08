export class GameController {
    #connectionHandler = null;
    #gameService = null;
    #player = null;

    constructor(player) {
        this.connectionHandler = new ConnectionHandler();
        this.gameService = new GameService();
        this.player = player;
    }

    initControls() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            const controls = {
                'arrowup': 'up',
                'arrowright': 'right',
                'arrowdown': 'down',
                'arrowleft': 'left',
            };

            if (controls[key]) {
                this.connectionHandler.sendMove({
                    playerId: this.player.id,
                    direction: controls[key]
                });
            }
        });
    }
}