CREATE TABLE options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE

);

ALTER TABLE trainees_answers
ADD CONSTRAINT fk_trainees_answers_selected_option
FOREIGN KEY (selected_option_id) REFERENCES options(id);