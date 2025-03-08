import { Socket } from "socket.io";

export enum Directions {
    Up = "up", 
    Right = "right",
    Down = "down",
    Left = "left",
    Idle = "idle"
}

export enum PlayerStates {
    Dead, Hidden, Idle, Moving, Not_Connected  
}

export interface Player {
    direction: Directions;
    id: Socket;
    state: PlayerStates;
    visibility: Boolean;
    x: number;
    y: number;
}



