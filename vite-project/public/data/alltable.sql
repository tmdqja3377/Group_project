CREATE TABLE `planner_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `planner_id` int NOT NULL,
  `spot_id` int NOT NULL,
  `visit_date` date DEFAULT NULL,
  `sequence` int DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `spotName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `planner_id` (`planner_id`),
  KEY `spot_id` (`spot_id`),
  CONSTRAINT `planner_items_ibfk_1` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`),
  CONSTRAINT `planner_items_ibfk_2` FOREIGN KEY (`spot_id`) REFERENCES `tourist_spots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `usertable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(60) DEFAULT NULL,
  `provider` varchar(20) DEFAULT 'local',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `tourist_spots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `road_address` text,
  `lot_address` text,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `area` text,
  `intro` text,
  `phone` varchar(100) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `data_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=841 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `planners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `travelers` int NOT NULL DEFAULT '1',
  `region_name` varchar(60) NOT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_userid` (`user_id`),
  CONSTRAINT `fk_userid` FOREIGN KEY (`user_id`) REFERENCES `usertable` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

