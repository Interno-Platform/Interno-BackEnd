ALTER TABLE trainees_scores
ADD COLUMN internship_id INT NULL AFTER trainee_id,
ADD INDEX idx_scores_internship (internship_id),
ADD CONSTRAINT fk_scores_internship
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE;

ALTER TABLE trainees_scores
DROP INDEX unique_trainee_skill;

ALTER TABLE trainees_scores
ADD UNIQUE KEY unique_trainee_internship_skill (trainee_id, internship_id, skill_id);
