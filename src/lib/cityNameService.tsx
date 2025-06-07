import { Position } from "../interfaces";

// translate lat, lon into city name
export const getCityFromCoord = async (position : Position) : Promise<string> => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lon}&format=json`);
    const data = await res.json();
    const city = data.address.city || data.address.county;

    let cityName = '';
    if (city === '臺北市') {
      cityName = 'Taipei';
    } else if (city === '新北市') {
      cityName = 'NewTaipei';
    } else if (city === '桃園市') {
      cityName = 'Taoyuan';
    } else if (city === '臺中市') {
      cityName = 'Taichung';
    } else if (city === '高雄市') {
      cityName = 'KaoHsiung';
    } else if (city === '臺南市') { 
      cityName = 'Tainan';
    }else if (city === '屏東縣') {
      cityName = 'PingtungCounty';
    } 

    return cityName;
}