CREATE TABLE  IF NOT EXISTS  internships (
    id              INT              AUTO_INCREMENT PRIMARY KEY,
    company_id      INT              NOT NULL,
    title           VARCHAR(255)     NOT NULL,
    description     TEXT             NOT NULL,
    location_type   ENUM('REMOTE', 'ONSITE', 'HYBRID') NOT NULL,
    duration_weeks  SMALLINT         NOT NULL CHECK (duration_weeks > 0),
    seats           SMALLINT         NOT NULL CHECK (seats > 0),
    deadline        DATE             NOT NULL,
    has_exam        BOOLEAN DEFAULT 0,
    status          ENUM('pending', 'rejected', 'CLOSED', 'active') NOT NULL DEFAULT 'pending',
    created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_internships_company   ON internships (company_id);
CREATE INDEX idx_internships_status    ON internships (status);
CREATE INDEX idx_internships_deadline  ON internships (deadline);