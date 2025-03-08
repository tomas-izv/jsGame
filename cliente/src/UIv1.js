export const UIv1 = {
    UIv1: (boardData, players) => {
        const size = boardData.size;
        let board = Array(size).fill().map(() => Array(size).fill(0));

        boardData.elements.forEach(bush => {
            board[bush.x][bush.y] = 5;
        });

        players.forEach(player => {
            board[player.x][player.y] = 1;
        });

        let boardString = "";
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 5) {
                    boardString += "B ";
                } else if (board[i][j] === 1) {
                    boardString += "P ";
                } else {
                    boardString += "0 ";
                }
            }
            boardString += "\n";
        }
        console.log(boardString);
    }
};