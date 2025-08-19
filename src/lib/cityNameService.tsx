import axios from "axios";
import { Position } from "../interfaces";

// translate lat, lon into city name
export const getCityFromCoord = async (position : Position) : Promise<string> => {
  const res = await axios.get(`https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lon}&localityLanguage=en`);
  let cityName = '';
  if (res) {
    cityName = res.data?.principalSubdivision?.replace(' ', '');
    if (cityName === 'Pingtung') {
      cityName = 'PingtungCounty';
    }
  } else {
    console.log("Bad Request: Failed To Query");
  }

  return cityName;
}