import { Marker, Popup } from "react-leaflet";
import { Icon } from 'leaflet';
import { Position } from "../../interfaces";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
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

export const ParkingSpotMarker = ({ index, position } : { index: number, position : Position}) => {
    const [isClicked, setIsClicked] = useState<boolean>(false); // if isClicked show modal or div presenting spot info
    const popupRef = useRef<HTMLDivElement | null>(null);
    const customSpotMarker = new Icon({
        iconUrl: customSpotIcon,
        shadowUrl: markerShadownIcon,
        iconSize: [30, 30],       // width, height in pixels
        iconAnchor: [16, 32]
    })

    const customSpotFocusedMarker = new Icon({
        iconUrl: customSpotFocusedIcon,
        shadowUrl: markerShadownIcon,
        iconSize: [32, 32],       // width, height in pixels
        iconAnchor: [16, 32]
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
            position={[position.lat, position.lon]}
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
                <div ref={popupRef} className="absolute z-[999] bg-gradient-to-r from-white/80 to-white/50 to-white/60 backdrop-blur-md opacity-[90%] rounded-xl p-4 pt-2 pb-6 left-4 bottom-4 flex flex-col items-start gap-5">
                    <button className="self-end px-2 py-2 rounded-lg text-white" onClick={() => {
                        setIsClicked(false);
                    }}>
                        <img src={customCancelIcon} alt="icon" className="w-4 h-4" />
                    </button>
                    <div className="flex items-end gap-5">
                        <div className="flex flex-col justify-start items-start gap-2">
                            <h2 className="text-lg font-semibold">你的路邊停車格資訊</h2>
                            <span className="text-md">{`經緯度: (${position.lat}, ${position.lon})`}</span>
                            <span>先搶先贏 勸你是全油門衝刺</span>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-sky-600 rounded-lg text-white" onClick={() => {
                            const url = `https://www.google.com/maps?q=${position.lat},${position.lon}`;
                            window.open(url, '_blank');
                        }}>在 GoogleMaps 中導航至此</button>
                    </div>
                </div>
            ) : null
        }
        </>
        
    );
}