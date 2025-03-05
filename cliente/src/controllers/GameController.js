export class GameController {
    #connectionHandler = null;
    #gameService = null;
    #player = null;

    constructor(player) {
        this.gameService = new GameService();
        this.connectionHandler = new ConnectionHandler();
        this.player = player;
    }

    initControls() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            const controls = {
                'arrowup': 'up',
                'arrowdown': 'down',
                'arrowleft': 'left',
                'arrowright': 'right',
                
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