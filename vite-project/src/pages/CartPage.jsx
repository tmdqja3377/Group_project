import { useEffect, useRef } from 'react';
import Navbar from '../assets/components/Navbar.jsx';
import ScheduleBoard from '../assets/components/Cart/ScheduleBoard.jsx';
import { useSchedule, ScheduleProvider } from '../assets/context/ScheduleContext.jsx';

const CartContent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { scheduleData, setScheduleData } = useSchedule();

  // ✅ 1. 페이지 진입 시 저장된 여행 데이터 가져와서 일정 생성
  useEffect(() => {
    const saved = localStorage.getItem('plannedTrip');
    if (saved) {
      const parsed = JSON.parse(saved);
      const { region, startDate, endDate, travelers } = parsed;

      setScheduleData({
        '1일차': [
          {
            id: 1,
            name: `${region.name} 랜드마크`,
            lat: region.lat,
            lng: region.lng,
            address: `${region.name} 중심지`,
            image: '/img/placeholder.jpg',
            stars: 4.5,
            review: '대표 명소',
            sns: 'https://map.naver.com',
            memo: `${region.name}의 대표 장소`,
            time: '10:00',
          },
        ],
        '2일차': [],
        '3일차': [],
      });
    }
  }, [setScheduleData]);

  // ✅ 2. 지도 마커 렌더링
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 12,
      zoomControl: true,
      zoomControlOptions: { position: window.naver.maps.Position.RIGHT_BOTTOM },
    });

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const allItems = Object.values(scheduleData).flat();

    allItems.forEach((location) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(location.lat, location.lng),
        map,
        title: location.name,
        icon: {
          content: `<div style="
            background-color: #ff3b30;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: bold;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
          ">${location.name}${location.time ? ` (${location.time})` : ''}</div>`,
          anchor: new window.naver.maps.Point(15, 40),
        },
      });

      markersRef.current.push(marker);
    });

    if (allItems.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      allItems.forEach(loc => {
        bounds.extend(new window.naver.maps.LatLng(loc.lat, loc.lng));
      });
      map.fitBounds(bounds, { padding: 100 });
    }

  }, [scheduleData]);

  return (
    <>
      <Navbar />
      <div style={{ marginTop: '80px', padding: '20px' }}>
        <ScheduleBoard />
        <div style={{ marginTop: '20px', width: '100%', height: '600px', maxWidth: '1200px', margin: 'auto' }}>
          <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </>
  );
};

const CartPage = () => {
  return (
    <ScheduleProvider>
      <CartContent />
    </ScheduleProvider>
  );
};

export default CartPage;
