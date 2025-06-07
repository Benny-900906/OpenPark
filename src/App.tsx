import React, { useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';
import { Map } from './components/Map/Map';
import { usePositionStore } from './stores/usePositionStore';
import { getNearBySpotPositions, getValidParkingSpots, filterAvailableParkingSpots } from './lib/parkingSpotServices';
import { Position, ParkingSpot } from './interfaces';
 
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours auto refetch access token from tdx

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const fetchToken = useAuthStore((state) => state.fetchToken);
  const accessToken = useAuthStore.getState().token;
  const [avaliableParkingSpots, setAvaliableParkingSpots] = useState<Array<ParkingSpot>>([]);

  useEffect(() => {
    // Fetch token on mount
    fetchToken();

    // Set interval to refresh token every 4 hours
    const intervalId = setInterval(() => {
      fetchToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [fetchToken]);
  

  const handleNearByAvailableParkingSpots = async () => {

    const { userPosition } = usePositionStore.getState(); // fetches the freshes userPosition from usePositionStore. 

    console.log(userPosition.lat, " ");
    console.log(userPosition.lon);

    setLoading(true);

    const nearBySpotPositions : Array<Position> = await getNearBySpotPositions(accessToken, userPosition.lat, userPosition.lon, 200);

    const validParkingSpots : Array<ParkingSpot> = await getValidParkingSpots(accessToken, "Tainan", nearBySpotPositions);

    const availableParkingSpots : Array<ParkingSpot> = await filterAvailableParkingSpots(accessToken, "Tainan", validParkingSpots);

    setLoading(false);

    console.log(availableParkingSpots);

    setAvaliableParkingSpots(availableParkingSpots);

    // return availableParkingSpots;
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center">
      {/* <button onClick={() => fetchNearByParkingSpots(22.9894391, 120.1844143, 500)}>Show Near By Parking Data</button>
      <button onClick={() => filterAvailableParkingSpots("Tainan", [])}>Show Parking Data</button> */}
      <button onClick={handleNearByAvailableParkingSpots}>Test</button>
      <Map availableParkingSpots={avaliableParkingSpots} />
    </div>
  );
}

export default App;




/* 
完成的事

/v1/Parking/OnStreet/ParkingSpot/NearBy 
從這裡找到nearByParkingSpots top=30 or 50

/v1/Parking/OnStreet/ParkingSpot/City/{City} 
從nearByParkingSpots中的 (lat, lon) pairs 中來這裡找到對應的 parkingSpots
從這裡filter lat and lon 之後會得到對應的 ParkingSpotIDs (因為NearBy的ParkingSpotID format ！= ParkingSpotAvailaility的ParkingSpotID format) 

/v1/Parking/OnStreet/ParkingSpotAvailability/City/{City}
取得 ParkingSpotIDs 之後，來這裡 filter SpotStatus == 2 
回傳結果

研究 leaflet or openlayer 比較適合這個專案
implenent marker pinning and onclick to redirect to google maps

implement "update my current geolocation button below recenter feature"







需要完成的事

UI 上要 report 獲取多少筆停車格動態
click on marker 後 pop up 變成一張vertical card 顯示在左下角 （有點像google card那樣）

error handling, 如果fetch不到結果的話 display on UI

loading UI - disable buttons when loading

UI
- inputText
- submit button
- reset button

buttons 設立在 test 旁邊看是要找 停車場（價錢，時間） 還是 路邊停車格

請求冷卻 5-10s （random設定）

計算user 或是 marker 經緯度是在哪一個城市，在function中投入相對的City Props

calculate distance, implement small cards for each parking spot at the bottom of the map <ScrollView>

完成後開始implement 手機版 RN + EXPO
*/