import { useEffect } from 'react';
// const { naver } = window;
import Navbar from '../assets/components/Navbar.jsx';
function Map() {

    useEffect(() => {
        const mapDiv = document.getElementById('map');
        const map = new naver.maps.Map(mapDiv);

        // 네이버 지도 옵션 선택
        const mapOptions = {
        // 지도의 초기 중심 좌표
            logoControl: false, // 네이버 로고 표시 X
            mapDataControl: false, // 지도 데이터 저작권 컨트롤 표시 X
            scaleControl: true, // 지도 축척 컨트롤의 표시 여부
            tileDuration: 200, // 지도 타일을 전환할 때 페이드 인 효과의 지속 시간(밀리초)
            zoom: 14, // 지도의 초기 줌 레벨
            zoomControl: true, // 줌 컨트롤 표시
            zoomControlOptions: { position: 9 }, // 줌 컨트롤 우하단에 배치
        };
    }, []);

    return (
        <>
        <Navbar/>
        <div id = 'map' style={{ width : '800px', height: '800px'}}/>
        </>
    );
}

export default Map;