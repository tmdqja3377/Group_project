import Modal from 'react-modal';

Modal.setAppElement('#root');

const PlaceDetailModal = ({ isOpen, onRequestClose, item }) => {
  if (!item) return null;

  const naverDirectionsUrl = `https://map.naver.com/v5/directions/-/-/${item.lng},${item.lat},${encodeURIComponent(item.name)}/public`;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          maxWidth: '600px',
          margin: 'auto',
          padding: '20px',
          borderRadius: '12px'
        }
      }}
    >
      <h2>{item.name}</h2>
      <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '10px' }} />
      <p><strong>📍 주소:</strong> {item.address}</p>
      <p><strong>⭐ 평점:</strong> {item.stars}</p>
      <p><strong>💬 리뷰:</strong> {item.review}</p>
      <p><strong>🔗 SNS:</strong> <a href={item.sns} target="_blank" rel="noreferrer">{item.sns}</a></p>

      <a
        href={naverDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: '15px',
          padding: '10px 20px',
          backgroundColor: '#03c75a',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        네이버 길찾기 →
      </a>
    </Modal>
  );
};

export default PlaceDetailModal;
