import { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCenterButton } from './MapCenterButton';
import { usePositionStore } from '../../stores/usePositionStore';
import { ParkingSpot } from '../../interfaces';
import { ParkingSpotMarker, UserMarker } from './Marker';

export const Map = ({ availableParkingSpots } : { availableParkingSpots? : Array<ParkingSpot> }) => {
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
      <MapContainer center={[userPosition.lat, userPosition.lon]} scrollWheelZoom={true} zoom={18} minZoom={16} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserMarker />
        {
          availableParkingSpots?.map((spot, index) => (
            <ParkingSpotMarker index={index} key={index} position={spot.position} />
          ))
        }
        <MapCenterButton position={[userPosition.lat, userPosition.lon]} />
      </MapContainer>
    </div> 
  );
}