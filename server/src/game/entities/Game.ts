import { Board } from "./Board";
import { Room } from "../../room/entities/Room";

export enum GameStates {
    ENDED, PLAYING, WAITING
}

export interface Game {
    board: Board,
    id: String,
    room: Room,
    state: GameStates
}