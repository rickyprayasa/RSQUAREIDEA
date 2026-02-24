-- Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_login_attempts_email (email),
    INDEX idx_login_attempts_ip (ip_address),
    INDEX idx_login_attempts_created (created_at)
);

-- Comments for documentation
COMMENT ON TABLE login_attempts IS 'Track all login attempts for security monitoring';
COMMENT ON COLUMN login_attempts.ip_address IS 'IP address of the login attempt';
COMMENT ON COLUMN login_attempts.success IS 'Whether the login was successful';
COMMENT ON COLUMN login_attempts.error_message IS 'Error message if login failed';
