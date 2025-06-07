import { useMap } from "react-leaflet";
import recenterIcon from '../../assets/custom-recenter.svg';
import userLocationIcon from '../../assets/custom-user-location.svg';
import { usePositionStore } from "../../stores/usePositionStore";

export const MapCenterButton = ({ position }: {position: [number, number]}) => {
  const map = useMap();
    
  return (
    <button className="bg-black hover:bg-gray-500 px-2 py-4 rounded shadow" onClick={() => { map.setView(position, map.getZoom()); }}>
      <img src={recenterIcon} alt="icon" className="w-6 h-6 m-auto mb-2" />
      <span className="font-semibold text-white">地圖聚焦目前座標</span>
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
    <button className="bg-black hover:bg-gray-500 px-2 py-4 rounded shadow" onClick={handleUserCurrentLocation}>
      <img src={userLocationIcon} alt="icon" className="w-6 h-6 m-auto mb-2" />
      <span className="font-semibold text-white">更新座標至目前位置</span>
    </button>
    );
}