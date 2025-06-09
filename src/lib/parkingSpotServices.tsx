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
      const validParkingSpots : Array<ParkingSpot> = res.data?.ParkingSegmentSpots.map((spot : any) => {
      const parkingTypeMap =  new Map<number, string>([
        [0, '所有停車位類型'],[1, '自小客車位'],[2, '機車位'],[3, '重型機車位'],[4, '腳踏車位'],
        [5, '大型車位'],[6, '小型巴士位'],[7, '孕婦及親子專用車位'],[8, '婦女車位'],[9, '身心障礙汽車車位'],
        [10, '身心障礙機車車位'],[11, '電動汽車車位'],[12, '電動機車車位'],[13, '復康巴士'],[14, '月租機車位'],
        [15, '月租汽車位'],[16, '季租機車位'],[17, '季租汽車位'],[18, '半年租機車位'],[19, '半年租汽車位'],
        [20, '年租機車位'],[21, '年租汽車位'],[22, '租賃機車位'],[23, '租賃汽車位'],[24, '卸貨車位'],
        [25, '計程車位'],[26, '夜間安心停車位'],[27, '臨時停車'],[28, '專用停車'],[29, '預約停車'],
        [254, '其他'],[255, '未知'],
      ]);
        
        const parkingTypeNumber : number = spot.SpaceType;
        const parkingTypeString : string = parkingTypeMap.get(parkingTypeNumber)!;
        
        return {parkingSegmentID: spot.ParkingSegmentID, parkingSpotID: spot.ParkingSpotID, position: {lat: spot.Position.PositionLat, lon: spot.Position.PositionLon}, parkingType : parkingTypeString}
      });

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

      const availableParkingSpotIDs : Array<string> = res.data?.CurbSpotParkingAvailabilities.map((spot : any) => { return spot.ParkingSpotID });
      const availableParkingSpots : Array<ParkingSpot> = validParkingSpots.filter(spot => availableParkingSpotIDs.includes( spot.parkingSpotID ));

      // console.log(availableParkingSpots);

      return availableParkingSpots;

    } catch (error) {
      console.log("Bad Request - City Not Supported: Failed To Query");
      return [];
    }

  } 

  console.log("Absence of Access Token: Failed To Query");
  return [];
}


// fill in essential infos and return an array of ParkingSpots
export const completeParkingSpotInfos = async (accessToken : string | null, city: string, availableParkingSpots : Array<ParkingSpot>) : Promise<Array<ParkingSpot>> => {
  if (availableParkingSpots.length === 0) {
    return availableParkingSpots;
  }

  if (accessToken) {

    try {
      const encodedFilter : string = availableParkingSpots.map(spot => `ParkingSegmentID eq '${spot.parkingSegmentID}'`).join(' or ');
    
      const chargeTimeRes = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSegmentChargeTime/City/${city}`
      + `?$filter=${encodedFilter}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      });

      const fareRateRes = await axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet/ParkingSegment/City/${city}` 
      + `?$filter=${encodedFilter}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      });


      // map <ParkingSegmentID, [ParkingSegmentName, ParkingHoursToString]>
      let parkingInfoMap = new Map<string, {ParkingSegmentName: string, ParkingHours: string}>();
      // map <ParkingSegmentID, FareDescription>
      let parkingFareMap = new Map<string, string>();

      chargeTimeRes.data?.CurbParkingSegmentChargeTimes.forEach((segment : any) => {
        parkingInfoMap.set(segment.ParkingSegmentID, {ParkingSegmentName : `${segment.ParkingSegmentName.Zh_tw}`, ParkingHours: `${segment.ChargeTimes[0].StartTime} 至 ${segment.ChargeTimes[0].EndTime}`});
      });

      fareRateRes.data?.ParkingSegments.forEach((segment : any) => {
        parkingFareMap.set(segment.ParkingSegmentID, segment.FareDescription);
      })

      // make a copy, the code should remain immutable
      const completeParkingSpots : Array<ParkingSpot> = [...availableParkingSpots];
      completeParkingSpots.forEach((spot) => {

        const info : {ParkingSegmentName: string, ParkingHours: string} | undefined = parkingInfoMap.get(spot.parkingSegmentID);
        const fare : string | undefined = parkingFareMap.get(spot.parkingSegmentID);

        if (info) {
          spot.parkingSegmentName = info.ParkingSegmentName;
          spot.openingHours = info.ParkingHours;
        }

        if (fare) {
          spot.fareRate = fare;
        }

      })

      console.log(completeParkingSpots);

      return completeParkingSpots;

    } catch (error) {

      console.log("Bad Request - City Not Supported: Failed To Query");
      return availableParkingSpots;
      
    }
    
  }

  return availableParkingSpots;
}