import axios from "axios";
import { Position, ParkingSpot } from "../interfaces";
  
// helper function
// this function fetches all parking spots around specified lat and lon
// this also includes parked and non-parked spots
export const getNearBySpotPositions = async (accessToken: string | null, lat: number, lon: number, distance: number, numberOfResults: number) : Promise<Array<Position>> => {
  if (accessToken) {

    try {
      const res = await axios.get(`https://tdx.transportdata.tw/api/advanced/v1/Parking/OnStreet/ParkingSpot/NearBy` 
      + `?$spatialFilter=nearby(${lat}, ${lon}, ${distance})`
      + `&$top=${numberOfResults}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

        // extract nearby parking spots' (lat, lon)
        const nearBySpotPositions : Array<Position> = res.data?.map((spot : any) => {return {lat: spot.Position.PositionLat, lon: spot.Position.PositionLon}});
          
        console.log(nearBySpotPositions);
  
        return nearBySpotPositions;

    } catch (error) {
      console.log("Geolocation OutOfBound: Failed To Query");
      return [];
    }
  }

  console.log("Absence of Access Token or: Failed To Query");
  return [];
}

// helper function
// after retrieving all nearby parking spots, we need to use this function to get valid ParkingSpotID and their corresponding position for each retrieved parking spot
// after using this function, we will get a list of ParkingSpots (id + position) around the designated location
export const getValidParkingSpots = async (accessToken: string | null, city: string, spotPositions: Array<Position>) : Promise<Array<ParkingSpot>> => {
  if (spotPositions.length === 0) {
    console.log("No Spot Positions Provided");
    return [];
  }

  if (accessToken) {

    try {
      const encodedFilter : string = spotPositions.map(position => `Position/PositionLat eq ${position.lat} and Position/PositionLon eq ${position.lon}`).join(' or ');

      const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpot/City/${city}`
      + `?$filter=${encodedFilter}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // extract valid parkingSpotID + positions, given nearby parking spots' (lat, lon)
      const validParkingSpots : Array<ParkingSpot> = res.data?.ParkingSegmentSpots.map((spot : any) => {return {parkingSpotID: spot.ParkingSpotID, position: {lat: spot.Position.PositionLat, lon: spot.Position.PositionLon}}});

      console.log(validParkingSpots);

      return validParkingSpots;

    } catch (error) {
      console.log("Bad Request - City Not Supported: Failed To Query");
      return [];
    }
    
      
  } 

  console.log("Absence of Access Token: Failed To Query");
  return [];
}

// helper function
// filter validParkingIDs and return spots with SpotStatus == 2
export const filterAvailableParkingSpots = async (accessToken: string | null, city: string, validParkingSpots: Array<ParkingSpot>) : Promise<Array<ParkingSpot>> => {
  if (validParkingSpots.length === 0) {
    console.log("No Valid Parking Spots Provided");
    return [];
  }
  
  if (accessToken) {

    try {
      const encodedFilter : string = validParkingSpots.map(spot => `ParkingSpotID eq '${spot.parkingSpotID}'`).join(' or ');

      const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpotAvailability/City/${city}` 
      + `?$filter=SpotStatus eq 2 and ${encodedFilter}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    
      // setParkingSpots(res.data?.CurbSpotParkingAvailabilities);
      const availableParkingSpotIDs : Array<string> = res.data?.CurbSpotParkingAvailabilities.map((spot : any) => {return spot.ParkingSpotID});
      const availableParkingSpots : Array<ParkingSpot> = validParkingSpots.filter(spot => availableParkingSpotIDs.includes(spot.parkingSpotID));
      console.log(availableParkingSpots);

      return availableParkingSpots;

    } catch (error) {
      console.log("Bad Request - City Not Supported: Failed To Query");
      return [];
    }

  } 

  console.log("Absence of Access Token: Failed To Query");
  return [];
}