export interface Position {
    lat: number;
    lon: number;
}

export interface ParkingSpot {
    parkingSegmentID : string;
    parkingSegmentName: string;
    parkingSpotID : string;
    position : Position;
    parkingType : string;
    fareRate: string;
    openingHours: string;
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