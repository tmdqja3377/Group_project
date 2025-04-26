SELECT * FROM tourist_spots LIMIT 5;
SELECT * FROM tourist_spots WHERE name LIKE '%아산%';

DELETE FROM usertable;

ALTER TABLE usertable AUTO_INCREMENT = 1;

ALTER TABLE usertable MODIFY COLUMN password varchar(60);