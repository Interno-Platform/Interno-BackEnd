ALTER TABLE internships DROP COLUMN has_exam;

ALTER TABLE internship_exams RENAME COLUMN title TO exam_title;

ALTER TABLE internship_exams RENAME COLUMN description TO exam_description;

ALTER TABLE internship_exams DROP COLUMN level;

ALTER TABLE internship_exams DROP COLUMN duration;

ALTER TABLE internship_exams DROP COLUMN submission_instructions


