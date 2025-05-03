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

CREATE TABLE planners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usertable(id)
);

CREATE TABLE planners (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  travelers INT NOT NULL DEFAULT 1,
  region_name VARCHAR(60) NOT NULL,
  lat DOUBLE DEFAULT NULL,
  lng DOUBLE DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES usertable(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
