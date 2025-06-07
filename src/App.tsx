import { useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';
import { Map } from './components/Map/Map';
import { usePositionStore } from './stores/usePositionStore';
import { getNearBySpotPositions, getValidParkingSpots, filterAvailableParkingSpots } from './lib/parkingSpotServices';
import { Position, ParkingSpot } from './interfaces';
import { useLoadingStore } from './stores/useLoadingStore';
import { useRequestingTokenStore } from './stores/useRequestingTokenStore';
import { useSearchingStore } from './stores/useSearchingStore';
import { getCityFromCoord } from './lib/cityNameService';
 
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours auto refetch access token from tdx

const App = () => {
  const { loading, setLoading } = useLoadingStore();
  const { requestingToken } = useRequestingTokenStore.getState();
  const { searching, setSearching } = useSearchingStore();
  const fetchToken = useAuthStore((state) => state.fetchToken);
  const accessToken = useAuthStore.getState().token;
  const [avaliableParkingSpots, setAvaliableParkingSpots] = useState<Array<ParkingSpot>>([]);
  const [searchDisabled, setSearchDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // Fetch token on mount
    fetchToken();

    // Set interval to refresh token every 4 hours
    const intervalId = setInterval(() => {
      fetchToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [fetchToken]);


  
  const handleTimer = (seconds: number) => {
    setSearchDisabled(true);
    setCountdown(seconds);

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setSearchDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleNearByAvailableParkingSpots = async () => {

    const { userPosition } = usePositionStore.getState(); // fetches the freshes userPosition from usePositionStore. 

    console.log(userPosition.lat, " ");
    console.log(userPosition.lon);

    setLoading(true);
    setSearching(true);
    setSearchDisabled(true);

    // const cityName : string = await getCityFromCoord(userPosition);

    const cityName: string = 'Tainan';
    const nearBySpotPositions : Array<Position> = await getNearBySpotPositions(accessToken, userPosition.lat, userPosition.lon, 200);

    const validParkingSpots : Array<ParkingSpot> = await getValidParkingSpots(accessToken, cityName, nearBySpotPositions);

    const availableParkingSpots : Array<ParkingSpot> = await filterAvailableParkingSpots(accessToken, cityName, validParkingSpots);

    setLoading(false);
    setSearching(false);

    console.log(availableParkingSpots);

    setAvaliableParkingSpots(availableParkingSpots);

    handleTimer(45);
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center">
      {
        loading ? (
          <div className="absolute inset-0 z-[999] bg-white/60 backdrop-blur-sm opacity-50 flex flex-col gap-2 items-center justify-center">
            <div className="animate-spin rounded-full h-16 md:h-32 w-16 md:w-32 border-t-8 border-white"></div>
            {
              requestingToken ? <h2 className="text-lg font-semibold">正在取得憑證, 請稍候 ...</h2> : null
            }

            {
              searching ? <h2 className="text-lg font-semibold">正在幫你找車位, 請稍候 ...</h2> : null
            }
            
          </div>
        ) : null
      }
      <button disabled={searchDisabled} className={`absolute z-[998] text-black top-6 self-start ml-4 md:self-center px-4 md:px-8 py-4 ${searchDisabled ? 'bg-gray-400' : 'bg-white hover:bg-gray-300'} text-black rounded-lg font-semibold text-sm md:text-lg`} onClick={handleNearByAvailableParkingSpots}>
        {searchDisabled ? `搜尋功能冷卻中 ${countdown}s` : '搜尋附近停車格'}
      </button>
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

FIRST PRIORITTY: Responsive UI for iPhones

click on marker 後 pop up 變成一張vertical card 顯示在左下角 （有點像google card那樣）







需要完成的事:

特定城市可以找路邊停車格， 有一些只能找停車場

停車格資訊： 車位類型，收費時段，費率，營業時間


電動車用戶 filter

UI 上要 report 獲取多少筆停車格動態


error handling, 如果fetch不到結果的話 display on UI

loading UI - disable buttons when loading

UI
- inputText
- submit button
- reset button

buttons 設立在 test 旁邊看是要找 停車場（價錢，時間） 還是 路邊停車格

請求冷卻 60s （random設定）

計算user 或是 marker 經緯度是在哪一個城市，在function中投入相對的City Props

calculate distance, implement small cards for each parking spot at the bottom of the map <ScrollView>

完成後開始implement 手機版 RN + EXPO
*/