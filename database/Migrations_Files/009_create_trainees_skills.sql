CREATE TABLE IF NOT EXISTS trainees_skills (
trainee_id int ,
skill_id int,
PRIMARY KEY (trainee_id , skill_id),
FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
)