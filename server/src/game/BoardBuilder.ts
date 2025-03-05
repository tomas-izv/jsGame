import { Board } from "./entities/Board";

export class BoardBuilder {
    private board: Board;

    constructor() {
        this.board = {
            elements: [],
            size: 10,
            type: "board"
        }
        const map: Array<number[]> = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
            [0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
            [0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 5, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
        for (let i = 0; i < this.board.size; i++)
            for (let j = 0; j < this.board.size; j++)
                if (map[i][j] != 0) {
                    this.board.elements.push({ x: i, y: j })
                }
    }

    public getBoard(): Board {
        return this.board;
    }

    public serializeBoard(): any {
        return {
            type: this.board.type,
            content: {
                size: this.board.size,
                elements: this.board.elements.map(element => ({
                    x: element.x,
                    y: element.y
                }))
            }
        };
    }
}