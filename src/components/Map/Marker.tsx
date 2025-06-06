import { Marker, Popup } from "react-leaflet";
import { Icon } from 'leaflet';
import { Position } from "../../interfaces";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import customSpotIcon from '../../assets/custom-spot-marker.svg';
import markerShadownIcon from 'leaflet/dist/images/marker-shadow.png';
import { usePositionStore } from "../../stores/usePositionStore";


export const UserMarker = () => {
    const { userPosition, setUserPosition } = usePositionStore();

    const customerUserMarker = new Icon({
        iconUrl: markerIcon, 
        shadowUrl: markerShadownIcon,
        iconSize: [20, 30],       // width, height in pixels
        iconAnchor: [16, 32]
      });

    return (
        <Marker position={[userPosition.lat, userPosition.lon]} icon={customerUserMarker} draggable={true} eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const newPos = marker.getLatLng();
              setUserPosition({lat: newPos.lat, lon: newPos.lng});
            }
          }}></Marker>
    )
}

export const ParkingSpotMarker = ({ index, position } : { index: number, position : Position}) => {
    const customSpotMarker = new Icon({
        iconUrl: customSpotIcon,
        shadowUrl: markerShadownIcon,
        iconSize: [30, 30],       // width, height in pixels
        iconAnchor: [16, 32]
      })

    return (
        <Marker
            key={index}
            position={[position.lat, position.lon]}
            icon={customSpotMarker}
            draggable={false}
        >
            <Popup>
            <span>Lat: {position.lat}, Lon: {position.lon}</span>
            <button className="px-5 py-2 border-2 bg-sky-500 hover:bg-sky-700 rounded-lg text-white" onClick={() => {
                const url = `https://www.google.com/maps?q=${position.lat},${position.lon}`;
                window.open(url, '_blank');
            }}>在 GoogleMaps 中導航至此</button>
            </Popup>
        </Marker>
    );
}