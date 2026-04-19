CREATE TABLE trainees_answers (

    answer_id INT PRIMARY KEY AUTO_INCREMENT,

    trainee_id INT,

    question_id INT,

    selected_option_id INT,

    FOREIGN KEY (trainee_id) REFERENCES trainees(id),

    FOREIGN KEY (question_id) REFERENCES questions(id),

    FOREIGN KEY (selected_option_id) REFERENCES options(id)

);