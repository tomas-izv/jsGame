import { Room } from "../../room/entities/Room";
import { Board } from "./Board";

export enum GameStates {
    ENDED, PLAYING, WAITING
}

export interface Game {
    board: Board,
    id: String,
    room: Room,
    state: GameStates
}