import React, { use, useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';
import axios from 'axios';
 
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours auto refetch access token from tdx

const App = () => {

  interface Position {
    latitude: string;
    longtitude: string;
  }

  interface ParkingSpot {
    parkingSpotID : string;
    position : Position;
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [parkingSpots, setParkingSpots] = useState<Array<Object>>([]);
  const [nearBySpots, setNearBySpots] = useState<Array<Object>>([]);
  const [allParkingSpots, setAllParkingSpots] = useState<Array<Object>>([]);
  const fetchToken = useAuthStore((state) => state.fetchToken);
  const accessToken = useAuthStore.getState().token;

  useEffect(() => {
    // Fetch token on mount
    fetchToken();

    // Set interval to refresh token every 4 hours
    const intervalId = setInterval(() => {
      fetchToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [fetchToken]);
  

  // this function fetches all parking spots around specified lat and lon
  // this also includes parked and non-parked spots
  const getNearBySpotPositions = async (lat: number, lon: number, distance: number) : Promise<Array<Position>> => {
    if (accessToken) {
      setLoading(true);
      const res = await axios.get(`https://tdx.transportdata.tw/api/advanced/v1/Parking/OnStreet/ParkingSpot/NearBy` 
      + `?$spatialFilter=nearby(${lat}, ${lon}, 500)`
      + '&$top=30', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);

      if (res) {

        // extract nearby parking spots' (lat, lon)
        const nearBySpotPositions : Array<Position> = res.data?.map((spot : any) => {return {latitude: spot.Position.PositionLat, longtitude: spot.Position.PositionLon}});
        
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




  // after retrieving all nearby parking spots, we need to use this function to get valid ParkingSpotID and their corresponding position for each retrieved parking spot
  // after using this function, we will get a list of ParkingSpots (id + position) around the designated location
  const getValidParkingSpots = async (city: string, spotPositions: Array<Position>) : Promise<Array<ParkingSpot>> => {
    if (accessToken) {

      const encodedFilter : string = spotPositions.map(position => `Position/PositionLat eq ${position.latitude} and Position/PositionLon eq ${position.longtitude}`).join(' or ');

      setLoading(true);
      const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpot/City/${city}`
      + `?$filter=${encodedFilter}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);

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



  // filter validParkingIDs and return spots with SpotStatus == 2
  const filterAvailableParkingSpots = async (city: string, validParkingSpots: Array<ParkingSpot>) : Promise<Array<ParkingSpot>> => {
    if (accessToken) {

      const encodedFilter : string = validParkingSpots.map(spot => `ParkingSpotID eq '${spot.parkingSpotID}'`).join(' or ');

      setLoading(true);
      const res = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSpotAvailability/City/${city}` 
      + `?$filter=SpotStatus eq 2 and ${encodedFilter}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);

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


  const testFunc = async () => {
    const nearBySpotPositions : Array<Position> = await getNearBySpotPositions(22.9833100, 120.2193929, 500);

    const validParkingSpots : Array<ParkingSpot> = await getValidParkingSpots("Tainan", nearBySpotPositions);

    const availableParkingSpots : Array<ParkingSpot> = await filterAvailableParkingSpots("Tainan", validParkingSpots);

    const lat = availableParkingSpots[0].position.latitude;
    const lon = availableParkingSpots[0].position.longtitude;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    window.open(url, '_blank');

  }


  return (
    <div className="flex flex-col gap-5 items-center justify-center">
      {/* <button onClick={() => fetchNearByParkingSpots(22.9894391, 120.1844143, 500)}>Show Near By Parking Data</button>
      <button onClick={() => filterAvailableParkingSpots("Tainan", [])}>Show Parking Data</button> */}
      <button onClick={testFunc}>Test</button>
    </div>
  );
}

export default App;



/* 
現在要做的事

/v1/Parking/OnStreet/ParkingSpot/NearBy 
從這裡找到nearByParkingSpots top=30 or 50

/v1/Parking/OnStreet/ParkingSpot/City/{City} 
從nearByParkingSpots中的 (lat, lon) pairs 中來這裡找到對應的 parkingSpots
從這裡filter lat and lon 之後會得到對應的 ParkingSpotIDs (因為NearBy的ParkingSpotID format ！= ParkingSpotAvailaility的ParkingSpotID format) 

/v1/Parking/OnStreet/ParkingSpotAvailability/City/{City}
取得 ParkingSpotIDs 之後，來這裡 filter SpotStatus == 2 
回傳結果

*/