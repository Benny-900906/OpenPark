import axios from "axios";
import { Position } from "../interfaces";

// translate lat, lon into city name
export const getCityFromCoord = async (position : Position) : Promise<string> => {
  const res = await axios.get(`https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lon}&localityLanguage=en`);
  let cityName = '';
  if (res) {
    cityName = res.data?.principalSubdivision?.replace(' ', '');
    if (cityName == 'Pingtung') {
      cityName = 'PingtungCounty';
    }
  } else {
    console.log("Bad Request: Failed To Query");
  }

  return cityName;

    // let cityName = '';
    // if (city === '臺北市') {
    //   cityName = 'Taipei';
    // } else if (city === '新北市') {
    //   cityName = 'NewTaipei';
    // } else if (city === '桃園市') {
    //   cityName = 'Taoyuan';
    // } else if (city === '臺中市') {
    //   cityName = 'Taichung';
    // } else if (city === '高雄市') {
    //   cityName = 'KaoHsiung';
    // } else if (city === '臺南市') { 
    //   cityName = 'Tainan';
    // }else if (city === '屏東縣') {
    //   cityName = 'PingtungCounty';
    // } 

    // return cityName;
}

// city: "Taipei"
// ​​
// continent: "Asia"
// ​​
// continentCode: "AS"
// ​​
// countryCode: "TW"
// ​​
// countryName: "Taiwan (Province of China)"
// ​​
// latitude: 25.012739785666305
// ​​
// locality: "Banqiao"
// ​​
// localityInfo: Object { administrative: (5) […], informative: (4) […] }
// ​​
// localityLanguageRequested: "en"
// ​​
// longitude: 121.461238861084
// ​​
// lookupSource: "coordinates"
// ​​
// plusCode: "7QQ32F76+3F"
// ​​
// postcode: ""
// ​​
// principalSubdivision: "New Taipei"
// ​​
// principalSubdivisionCode: "TW-NWT"




/* 
city: "Tainan"
​​
continent: "Asia"
​​
continentCode: "AS"
​​
countryCode: "TW"
​​
countryName: "Taiwan (Province of China)"
​​
latitude: 22.976095304428483
​​
locality: "E. District"
​​
localityInfo: Object { administrative: (5) […], informative: (3) […] }
​​
localityLanguageRequested: "en"
​​
longitude: 120.22888183593751
​​
lookupSource: "coordinates"
​​
plusCode: "7QJ2X6GH+CH"
​​
postcode: ""
​​
principalSubdivision: "Tainan"
​​
principalSubdivisionCode: "TW-TNN"



city: "Taichung"
​​
continent: "Asia"
​​
continentCode: "AS"
​​
countryCode: "TW"
​​
countryName: "Taiwan (Province of China)"
​​
latitude: 24.145500459582394
​​
locality: "W. District"
​​
localityInfo: Object { administrative: (6) […], informative: (3) […] }
​​
localityLanguageRequested: "en"
​​
longitude: 120.66902160644533
​​
lookupSource: "coordinates"
​​
plusCode: "7QP24MW9+6J"
​​
postcode: ""
​​
principalSubdivision: "Taichung"
​​
principalSubdivisionCode: "TW-TXG"


city: "Taipei"
​​
continent: "Asia"
​​
continentCode: "AS"
​​
countryCode: "TW"
​​
countryName: "Taiwan (Province of China)"
​​
latitude: 25.047658466237557
​​
locality: "Songshan District"
​​
localityInfo: Object { administrative: (6) […], informative: (4) […] }
​​
localityLanguageRequested: "en"
​​
longitude: 121.57676696777345
​​
lookupSource: "coordinates"
​​
plusCode: "7QQ32HXG+3P"
​​
postcode: ""
​​
principalSubdivision: "Taipei"
​​
principalSubdivisionCode: "TW-TPE"
*/