CREATE TABLE  IF NOT EXISTS  exam_submissions  (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    exam_id        INT          NOT NULL,
    trainee_id     INT          NOT NULL,
    code_solution  TEXT         NULL,
    language       VARCHAR(50),
    submitted_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score          SMALLINT     CHECK (score BETWEEN 0 AND 100),
    passed         BOOLEAN,
    reviewed_by    INT,
    reviewed_at    DATETIME,
    notes          TEXT,
    FOREIGN KEY (exam_id) REFERENCES internship_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
CREATE INDEX idx_submissions_exam    ON exam_submissions (exam_id);
CREATE INDEX idx_submissions_trainee ON exam_submissions (trainee_id);