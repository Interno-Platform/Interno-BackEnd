ALTER TABLE exam_submissions 
ADD COLUMN quiz_completed BOOLEAN DEFAULT FALSE AFTER code_solution,
ADD COLUMN quiz_score SMALLINT AFTER quiz_completed,
ADD COLUMN quiz_submitted_at DATETIME AFTER quiz_score,
ADD INDEX idx_submissions_quiz_status (quiz_completed);
