CREATE TABLE IF NOT EXISTS internship_exams (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    internship_id         INT NOT NULL,
    title                 TEXT NOT NULL,
    level                 TEXT,
    duration              TEXT,
    description           TEXT,
    requirements          JSON,
    expected_input        TEXT,
    expected_output       TEXT,
    programmingLangauage  TEXT,
    submission_instructions TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

CREATE INDEX idx_exams_internship ON internship_exams (internship_id);