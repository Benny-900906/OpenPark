import { useMap } from "react-leaflet";
import recenterIcon from '../../assets/recenter.svg';

export const MapCenterButton = ({ position }: {position: [number, number]}) => {
    const map = useMap();
    
    return (
      <button className="absolute top-4 right-4 z-[999] bg-blue-400 p-2 rounded shadow" onClick={() => { map.setView(position, map.getZoom()); }}>
        <img src={recenterIcon} alt="icon" className="w-6 h-6" />
      </button>
    )
  }