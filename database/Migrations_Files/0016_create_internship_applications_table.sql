CREATE TABLE IF NOT EXISTS internship_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    trainee_id INT NOT NULL,
    status ENUM('applied', 'rejected', 'accepted', 'completed') DEFAULT 'applied',
    cover_letter TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INT,
    notes TEXT,
    UNIQUE KEY unique_application (internship_id, trainee_id),
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_applications_trainee (trainee_id),
    INDEX idx_applications_internship (internship_id),
    INDEX idx_applications_status (status)
);
