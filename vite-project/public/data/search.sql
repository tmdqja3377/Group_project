ALTER TABLE planners MODIFY user_id VARCHAR(255) NOT NULL;


ALTER TABLE planners DROP FOREIGN KEY planners_ibfk_1;
ALTER TABLE planners MODIFY user_id VARCHAR(255) NOT NULL;
ALTER TABLE planners
ADD CONSTRAINT fk_userid FOREIGN KEY (user_id) REFERENCES usertable(userid);
ALTER TABLE usertable ADD UNIQUE INDEX idx_userid (userid);

DELETE FROM usertable
WHERE id = 8
LIMIT 1;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE planner_items;
TRUNCATE TABLE planners;
SET FOREIGN_KEY_CHECKS = 1;


ALTER TABLE usertable ADD COLUMN profile_image LONGTEXT;
