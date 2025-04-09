CREATE TABLE tourist_spots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    road_address TEXT,
    lot_address TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    area TEXT,
    intro TEXT,
    phone VARCHAR(100),
    organization VARCHAR(255),
    data_date DATE
);