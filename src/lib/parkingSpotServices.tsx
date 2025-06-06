import axios from "axios";

interface Position {
  latitude: number;
  longitude: number;
}

interface ParkingSpot {
  parkingSpotID : string;
  position : Position;
}
  
// helper function
// this function fetches all parking spots around specified lat and lon
// this also includes parked and non-parked spots
export const getNearBySpotPositions = async (accessToken: string | null, lat: number, lon: number, distance: number) : Promise<Array<Position>> => {
  if (accessToken) {
    const res = await axios.get(`https://tdx.transportdata.tw/api/advanced/v1/Parking/OnStreet/ParkingSpot/NearBy` 
    + `?$spatialFilter=nearby(${lat}, ${lon}, 500)`
    + '&$top=30', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res) {

      // extract nearby parking spots' (lat, lon)
      const nearBySpotPositions : Array<Position> = res.data?.map((spot : any) => {return {latitude: spot.Position.PositionLat, longitude: spot.Position.PositionLon}});
        
      console.log(nearBySpotPositions);

      return nearBySpotPositions;
        
    } else {
      console.log("Bad Request: Failed To Query");
    }

  } else {
    console.log("Absence of Access Token: Failed To Query");
  }

  return [];
}

// helper function
// after retrieving all nearby parking spots, we need to use this function to get valid ParkingSpotID and their corresponding position for each retrieved parking spot
// after using this function, we will get a list of ParkingSpots (id + position) around the designated location
export const getValidParkingSpots = async (accessToken: string | null, city: string, spotPositions: Array<Position>) : Promise<Array<ParkingSpot>> => {
  if (accessToken) {

    const encodedFilter : string = spotPositions.map(position => `Position/PositionLat eq ${position.latitude} and Position/PositionLon eq ${position.longitude}`).join(' or ');

    const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpot/City/${city}`
    + `?$filter=${encodedFilter}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res) {

       // extract valid parkingSpotID + positions, given nearby parking spots' (lat, lon)
      const validParkingSpots : Array<ParkingSpot> = res.data?.ParkingSegmentSpots.map((spot : any) => {return {parkingSpotID: spot.ParkingSpotID, position: {latitude: spot.Position.PositionLat, longtitude: spot.Position.PositionLon}}});

      console.log(validParkingSpots);

      return validParkingSpots;

    }else {
      console.log("Bad Request: Failed To Query");
    }
      
  } else {
    console.log("Absence of Access Token: Failed To Query");
  }

  return [];
}

// helper function
// filter validParkingIDs and return spots with SpotStatus == 2
export const filterAvailableParkingSpots = async (accessToken: string | null, city: string, validParkingSpots: Array<ParkingSpot>) : Promise<Array<ParkingSpot>> => {
  if (accessToken) {

    const encodedFilter : string = validParkingSpots.map(spot => `ParkingSpotID eq '${spot.parkingSpotID}'`).join(' or ');

    const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpotAvailability/City/${city}` 
    + `?$filter=SpotStatus eq 2 and ${encodedFilter}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res) {
      // setParkingSpots(res.data?.CurbSpotParkingAvailabilities);
      const availableParkingSpotIDs : Array<string> = res.data?.CurbSpotParkingAvailabilities.map((spot : any) => {return spot.ParkingSpotID});
      const availableParkingSpots : Array<ParkingSpot> = validParkingSpots.filter(spot => availableParkingSpotIDs.includes(spot.parkingSpotID));
      console.log(availableParkingSpots);

      return availableParkingSpots;

    } else {
      console.log("Bad Request: Failed To Query");
    }

  } else {
    console.log("Absence of Access Token: Failed To Query");
  }

  return [];
}