import { Game } from "../../game/entities/Game";
import { Player } from "../../player/entities/Player";

export const RoomConfig = {
    maxRoomPlayers: 4
};

export interface Room {
    game: Game | null;
    name: String;
    occupied: Boolean;
    players: Player[];
}
