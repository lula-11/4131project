CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);


CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  like_count INT DEFAULT 0
);


CREATE TABLE post_likes (
  post_id INT,
  user_id INT,
  PRIMARY KEY (post_id, user_id)
);

SELECT 
  posts.*, 
  users.username
FROM 
  posts
INNER JOIN 
  users ON posts.user_id = users.id;
