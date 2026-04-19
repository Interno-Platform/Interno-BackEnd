CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id INT,
    question_text TEXT NOT NULL,
    internship_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    FOREIGN KEY (internship_id) REFERENCES internships(id)
);