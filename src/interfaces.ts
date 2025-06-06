export interface Position {
    lat: number;
    lon: number;
}

export interface ParkingSpot {
    parkingSpotID : string;
    position : Position;
}

export interface PositionState {
    userPosition: Position;
    setUserPosition: (pos: Position) => void;
};

export interface AuthState {
    token: string | null;
    setToken: (token: string) => void;
    fetchToken: () => Promise<void>;
}