import { useMap } from "react-leaflet";
import recenterIcon from '../../assets/custom-recenter.svg';
import userLocationIcon from '../../assets/custom-user-location.svg';
import settingIcon from '../../assets/custom-setting.svg';
import { usePositionStore } from "../../stores/usePositionStore";
import { useRangeStore } from "../../stores/useRangeStore";
import { useState } from "react";

interface Option {
  title: string,
  options: Array<any>,
  handleSelect: (option : any) => void,
  selectState: any,
  unit: string
}

export const MapCenterButton = ({ position }: {position: [number, number]}) => {
  const map = useMap();
    
  return (
    <button className="bg-black hover:bg-gray-500 p-2 rounded shadow" onClick={() => { map.setView(position, map.getZoom()); }}>
      <img src={recenterIcon} alt="icon" className="w-6 h-6 m-auto mb-2" />
      <span className="font-semibold text-white text-xs">聚焦座標</span>
    </button>
  );
}

export const MapUserLocationButton = () => {
  const map = useMap();
  const setUserPosition = usePositionStore((state) => state.setUserPosition);

  const handleUserCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({lat: latitude, lon: longitude});

        // update the map view
        const { userPosition } = usePositionStore.getState();
        map.setView([userPosition.lat, userPosition.lon],map.getZoom());
      },
      (err) => {
        console.warn('Could not get geolocation, using default.');
      }
    );
  }

  return (
    <button className="bg-black hover:bg-gray-500 p-2 rounded shadow" onClick={handleUserCurrentLocation}>
      <img src={userLocationIcon} alt="icon" className="w-6 h-6 m-auto mb-2" />
      <span className="font-semibold text-white text-xxs text-xs">更新位置</span>
    </button>
    );
}

export const MapSettingButton = () => {
    const { selectedDistanceRange, setSelectedDistanceRange } = useRangeStore();
    const { selectedResultRange, setSelectedResultRange } = useRangeStore();
    const { selectedParkingType, setSelectedParkingType } = useRangeStore();
    const [ isClicked, setIsClicked ] = useState<boolean>(false);

    const options : Array<Option> = [
      {
        title: '搜尋範圍',
        options: [200, 350, 500],
        handleSelect: setSelectedDistanceRange,
        selectState: selectedDistanceRange,
        unit: 'm'
      },
      {
        title: '顯示筆數',
        options: [10, 20, 30],
        handleSelect: setSelectedResultRange,
        selectState: selectedResultRange,
        unit: ''
      },
      {
        title: '搜尋類型',
        options: ['路邊停車位', '綜合停車場'],
        handleSelect: setSelectedParkingType,
        selectState: selectedParkingType,
        unit: ''
      }
    ]


    const SettingOptions = ({ title, options, handleSelect, selectState, unit = '' } : { title: string, options: Array<any>, handleSelect : (option: any) => void, selectState: any, unit? : string}) => {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-white text-sm font-semibold">{title}</span>
          <div className="flex flex-row gap-2">
            {options.map(option => (<button
              key={option}
              onClick={() => handleSelect(option)}
              className={`px-8 py-2 rounded-md font-bold ${selectState === option ? 'bg-white text-black' : 'bg-gray-500 text-gray-700 hover:bg-gray-600' }`}
            >{`${option}${unit}`}</button>))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <button className="bg-black hover:bg-gray-500 px-2 py-2 md:px-4 md:py-4 rounded shadow" onClick={() => { setIsClicked(!isClicked) }}>
          <img src={settingIcon} alt="icon" className="w-6 h-6 m-auto" />
        </button>
        {
          isClicked ? (
            <div className="mt-2 bg-black p-6 pb-8 rounded-lg flex flex-col gap-8">
              {
                options.map((item) => <SettingOptions key={item.title} title={item.title} options={item.options} handleSelect={item.handleSelect} selectState={item.selectState} unit={item.unit} />)
              }
              <button className="mt-2 p-4 text-white hover:text-gray-500 text-sm font-semibold" onClick={() => { setIsClicked(false) }}>保存設定</button>
            </div>

          ) : null
        }        
      </div>
    );
}