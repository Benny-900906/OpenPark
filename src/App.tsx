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
import { useRangeStore } from './stores/useRangeStore';
 
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours auto refetch access token from tdx

const App = () => {
  const { loading, setLoading } = useLoadingStore();
  const { requestingToken } = useRequestingTokenStore.getState();
  const { searching, setSearching } = useSearchingStore();
  const fetchToken = useAuthStore((state) => state.fetchToken);
  const accessToken = useAuthStore.getState().token;
  const [avaliableParkingSpots, setAvaliableParkingSpots] = useState<Array<ParkingSpot>>([]);
  const [searchDisabled, setSearchDisabled] = useState<boolean>(false);
  const [noResult, setNoResult] = useState<boolean>(false);
  const [hasResult, setHasResult] = useState<boolean>(false);
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

  const handleNoResult = (seconds: number) => {
    setNoResult(true);
    setTimeout(() => {
      setNoResult(false);
    }, seconds*1000); 
  }

  const handleHasResult = (seconds: number) => {
    setHasResult(true);
    setTimeout(() => {
      setHasResult(false);
    }, seconds*1000);
  }
  
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
    const { selectedDistanceRange } = useRangeStore.getState();
    const { selectedResultRange } = useRangeStore.getState();

    console.log(userPosition.lat, " ");
    console.log(userPosition.lon);

    setLoading(true);
    setSearching(true);
    setSearchDisabled(true);

    const cityName : string = await getCityFromCoord(userPosition);

    const nearBySpotPositions : Array<Position> = await getNearBySpotPositions(accessToken, userPosition.lat, userPosition.lon, selectedDistanceRange, selectedResultRange);

    const validParkingSpots : Array<ParkingSpot> = await getValidParkingSpots(accessToken, cityName, nearBySpotPositions);

    const availableParkingSpots : Array<ParkingSpot> = await filterAvailableParkingSpots(accessToken, cityName, validParkingSpots);

    setLoading(false);
    setSearching(false);

    console.log(availableParkingSpots);

    setAvaliableParkingSpots(availableParkingSpots);

    if (availableParkingSpots.length === 0) {
      handleNoResult(3);
      handleTimer(20);
    } else {
      handleHasResult(1.5);
      handleTimer(45);
    }
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center">
      {/* error handling */}
      {
        noResult ? (
          <div className="absolute z-[999] bg-gradient-to-r from-white/80 to-white/50 to-white/60 backdrop-blur-md opacity-[90%] p-8 rounded-xl flex flex-col items-center justify-center gap-2">
            <h2 className="text-lg font-semibold">什麼鳥地方, 找不到附近的停車位</h2>
            <h2 className="text-lg font-semibold">這種地方隨便停就好了</h2>
          </div>
        ) : null
      }
      {
        hasResult ? (
          <div className="absolute z-[999] bg-gradient-to-r from-white/80 to-white/50 to-white/60 backdrop-blur-md opacity-[90%] p-8 rounded-xl flex flex-col items-center justify-center gap-2">
            <h2 className="text-lg font-semibold">{`你附近有${avaliableParkingSpots.length}個停車位`}</h2>
          </div>
        ) : null
      }
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
      <button disabled={searchDisabled} className={`absolute z-[998] text-black top-6 self-start ml-4 self-center px-4 md:px-8 py-4 text-black rounded-lg font-semibold text-sm md:text-lg ${searchDisabled ? 'bg-gray-400' : 'bg-white hover:bg-gray-300'}`} onClick={handleNearByAvailableParkingSpots}>
        {searchDisabled ? `搜尋功能冷卻中 ${countdown}s` : '搜尋附近停車格'}
      </button>
      <Map availableParkingSpots={avaliableParkingSpots} />
    </div>
  );
}

export default App;

/* 
需要完成的事:

停車位資訊最後更新時間：
/v1/Parking/OnStreet/ParkingSpotAvailability/City/{City} res.data.DataCollectTime : string

停車格資訊： 車位類型，收費時段，費率

車位類型 : /v1/Parking/OnStreet/ParkingSpot/City/{City}
[0:'所有停車位類型',1:'自小客車位',2:'機車位',3:'重型機車位',4:'腳踏車位',5:'大型車位',6:'小型巴士位',7:'孕婦及親子專用車位',8:'婦女車位',9:'身心障礙汽車車位',10:'身心障礙機車車位',11:'電動汽車車位',12:'電動機車車位',13:'復康巴士',14:'月租機車位',15:'月租汽車位',16:'季租機車位',17:'季租汽車位',18:'半年租機車位',19:'半年租汽車位',20:'年租機車位',21:'年租汽車位',22:'租賃機車位',23:'租賃汽車位',24:'卸貨車位',25:'計程車位',26:'夜間安心停車位',27:'臨時停車',28:'專用停車',29:'預約停車',254:'其他',255:'未知']

收費時段： /v1/Parking/OnStreet/ParkingSegmentChargeTime/City/{City}  with filter = ParkingSegmentID eq '0953'
費率： /v1/Parking/OnStreet/ParkingSegment/City/{City}  with  filter = ParkingSegmentID eq '0953'


特定城市可以找路邊停車格， 有一些只能找停車場 （感覺可以用

導入停車場查詢

完成後開始implement 手機版 RN + EXPO
*/