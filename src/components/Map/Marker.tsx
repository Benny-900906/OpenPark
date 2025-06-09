import { Marker, Popup } from "react-leaflet";
import { Icon } from 'leaflet';
import { ParkingSpot, Position } from "../../interfaces";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import customUserIcon from '../../assets/custom-user-marker.svg';
import customSpotIcon from '../../assets/custom-spot-marker.svg';
import customSpotFocusedIcon from '../../assets/custom-spot-marker-focused.svg';
import customCancelIcon from '../../assets/custom-cancel.svg';
import markerShadownIcon from 'leaflet/dist/images/marker-shadow.png';
import { usePositionStore } from "../../stores/usePositionStore";
import { useEffect, useRef, useState } from "react";

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

export const ParkingSpotMarker = ({ index, spot } : { index: number, spot : ParkingSpot}) => {
    const [isClicked, setIsClicked] = useState<boolean>(false); // if isClicked show modal or div presenting spot info
    const popupRef = useRef<HTMLDivElement | null>(null);
    const customSpotMarker = new Icon({
        iconUrl: customSpotIcon,
        shadowUrl: markerShadownIcon,
        iconSize: [20, 20],       // width, height in pixels
        iconAnchor: [12, 20]
    })

    const customSpotFocusedMarker = new Icon({
        iconUrl: customSpotFocusedIcon,
        shadowUrl: markerShadownIcon,
        iconSize: [22, 22],       // width, height in pixels
        iconAnchor: [12, 20]
    })

    // close the spotOption when clicked outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
            setIsClicked(false);
          }
        };
    
        if (isClicked) {
          document.addEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isClicked]);

    return (
        <>
        <Marker
            key={index}
            position={[spot.position.lat, spot.position.lon]}
            icon={isClicked? customSpotFocusedMarker : customSpotMarker}
            draggable={false}
            eventHandlers={{
                click: () => {
                    setIsClicked(true);
                } 
            }}
        >   
        </Marker>
        {
            isClicked ? (
                // refactor this snippet into a SpotOption function component
                <div ref={popupRef} className="absolute z-[999] bg-gradient-to-r from-white/80 to-white/50 to-white/60 backdrop-blur-md opacity-[90%] rounded-xl py-4 px-5 pt-2 pb-10 left-4 bottom-6 bg:bottom-4 flex flex-col items-start gap-1">
                    <button className="self-end px-2 py-2 rounded-lg text-white" onClick={() => {
                        setIsClicked(false);
                    }}>
                        <img src={customCancelIcon} alt="icon" className="w-4 h-4" />
                    </button>
                    <div className="flex items-end gap-5">
                        <div className="flex flex-col justify-start items-start gap-3">
                            <h2 className="text-lg font-semibold">路邊停車格資訊</h2>
                            {
                                spot.fareRate ? <span className="text-md"><strong>費率</strong>{`: ${spot.fareRate}`}</span> : null
                            }
                            {
                                spot.openingHours ? <span className="text-md"><strong>收費時段</strong>{`: ${spot.openingHours}`}</span> : null
                            }
                            {
                                spot.parkingSegmentName ? <span className="text-md"><strong>所在路段</strong>{`: ${spot.parkingSegmentName}`}</span> : null
                            }
                            <span className="text-md"><strong>經緯度</strong>{`: (${spot.position.lat}, ${spot.position.lon})`}</span>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-sky-600 rounded-lg text-white" onClick={() => {
                            const url = `https://www.google.com/maps?q=${spot.position.lat},${spot.position.lon}`;
                            window.open(url, '_blank');
                        }}>在 GoogleMaps 中導航至此</button>
                    </div>
                </div>
            ) : null
        }
        </>
        
    );
}