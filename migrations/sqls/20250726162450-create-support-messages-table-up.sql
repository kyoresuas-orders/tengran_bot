CREATE TABLE support_messages (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  telegram_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  sender ENUM('user', 'manager') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);