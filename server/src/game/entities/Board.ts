import { Player } from "../../player/entities/Player";
export interface Element {
    x : number;
    y : number; 
}

export interface Board {
    elements: Array<Element>;
    size: number;
    type: string;
}