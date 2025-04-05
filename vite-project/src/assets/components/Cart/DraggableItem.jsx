import { useDrag } from 'react-dnd';
import { useState } from 'react';
import Modal from 'react-modal';
import PlaceDetailModal from './PlaceDetailModal.jsx';

Modal.setAppElement('#root');

const DraggableItem = ({ item }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SCHEDULE_ITEM',
    item: { ...item }, // 드래그 시 데이터 전달
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [memo, setMemo] = useState(item.memo || '');
  const [time, setTime] = useState(item.time || '');

  const handleSaveMemo = () => {
    item.memo = memo;
    item.time = time;
    setShowMemoModal(false);
  };

  return (
    <>
      <div
        ref={drag}
        onClick={() => setShowDetailModal(true)} // 상세 정보 모달 열기
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMemoModal(true); // 우클릭 시 메모 모달 열기
        }}
        style={{
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '10px',
          margin: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        <strong>{item.name}</strong>
        {item.time && <div style={{ fontSize: '12px', color: '#555' }}>⏰ {item.time}</div>}
        {item.memo && <div style={{ fontSize: '12px', color: '#888' }}>{item.memo}</div>}
      </div>

      {/* 상세 정보 모달 */}
      <PlaceDetailModal
        isOpen={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
        item={item}
      />

      {/* 메모 & 시간 입력 모달 */}
      <Modal
        isOpen={showMemoModal}
        onRequestClose={() => setShowMemoModal(false)}
        style={{
          content: {
            width: '400px',
            height: '300px',
            margin: 'auto',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            padding: '20px',
          },
        }}
      >
        <h3>📝 메모 및 시간 설정</h3>
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>방문 시간:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />

          <label style={{ fontWeight: 'bold' }}>메모:</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
            rows={4}
            placeholder="메모를 입력하세요"
          />

          <button
            onClick={handleSaveMemo}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#ff3b30',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            저장하기
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DraggableItem;
