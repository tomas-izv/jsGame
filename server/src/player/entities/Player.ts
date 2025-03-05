import { Socket } from "socket.io";
import { serialize } from "v8";

export enum Directions {
    Up = "up", 
    Down = "down",
    Left = "left",
    Right = "right",
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



