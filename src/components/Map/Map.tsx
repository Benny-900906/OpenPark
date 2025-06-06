import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import customSpotIcon from '../../assets/custom-spot-marker.svg';
import markerShadownIcon from 'leaflet/dist/images/marker-shadow.png';
import { MapCenterButton } from './MapCenterButton';
import { usePositionStore } from '../../stores/usePositionStore';
import { ParkingSpot } from '../../interfaces';


export const Map = ({ availableParkingSpots } : { availableParkingSpots? : Array<ParkingSpot> }) => {

  const customerUserMarker = new Icon({
    iconUrl: markerIcon, 
    shadowUrl: markerShadownIcon,
    iconSize: [20, 30],       // width, height in pixels
    iconAnchor: [16, 32]
  });

  const customSpotMarker = new Icon({
    iconUrl: customSpotIcon,
    shadowUrl: markerShadownIcon,
    iconSize: [30, 30],       // width, height in pixels
    iconAnchor: [16, 32]
  })

  const { userPosition, setUserPosition } = usePositionStore();
  
  // on mount: ask for user's init geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({lat: latitude, lon: longitude});
      },
      (err) => {
        console.warn('Could not get geolocation, using default.');
      }
    );
  }, [])

  useEffect(() => {
    console.log(userPosition);
  }, [userPosition])

  return (
    <div className="w-full flex justify-center">
      <MapContainer center={[userPosition.lat, userPosition.lon]} scrollWheelZoom={true} zoom={18} minZoom={16} style={{ height: '80vh', width: '70%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[userPosition.lat, userPosition.lon]} icon={customerUserMarker} draggable={true} eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const newPos = marker.getLatLng();
            setUserPosition({lat: newPos.lat, lon: newPos.lng});
          }
        }}>
        {
          availableParkingSpots?.map((spot, index) => (
            <Marker
              key={index}
              position={[spot.position.lat, spot.position.lon]}
              icon={customSpotMarker}
              draggable={false}
            >
              <Popup>
                Lat: {spot.position.lat}, Lon: {spot.position.lon}
              </Popup>
            </Marker>
          ))
        }
        </Marker>
        <MapCenterButton position={[userPosition.lat, userPosition.lon]} />
          
      </MapContainer>
    </div> 
  );
}