const mysql = require('mysql-await');

var connPool = mysql.createPool({
    connectionLimit: 5,
    host: 'cse-mysql-classes-01.cse.umn.edu',
    user: 'C4131F23U37',
    password: '1419',
    database: 'C4131F23U37'
});

async function executeQuery(query, params = []) {
  try {
    return await connPool.awaitQuery(query, params);
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error;
  }
}

async function signUp(username, hashedPassword) {
  const checkQuery = "SELECT * FROM users WHERE username = ?";
  const existingUsers = await executeQuery(checkQuery, [username]);
  if (existingUsers.length > 0) {
      console.error('User already exists');
      return { success: false, message: "Username already exist" };
  }

  const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
  const result = await executeQuery(insertQuery, [username, hashedPassword]);

  return { success: true, userId: result.insertId };
}


const bcrypt = require('bcrypt');

async function checkUser(username, password) {
    const query = "SELECT * FROM users WHERE username = ?";
    const users = await executeQuery(query, [username]);
    if (users.length === 0) {
        return { success: false, message: "Incorrect Username or Password" };
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        return { success: true, userId: user.id };
    } else {
        return { success: false, message: "Incorrect Username or Password" };
    }
}


async function getUser(username) {
  const query = "SELECT * FROM users WHERE username = ?";
  const users = await connPool.awaitQuery(query, [username]);
  return { success: true, user: users[0] };
}

async function deleteUser(username) {
  const query = "DELETE FROM users WHERE username = ?";
  await executeQuery(query, [username]);
  return { success: true };
}

async function createPost(username, content) {
  const userQuery = "SELECT id FROM users WHERE username = ?";
  const users = await connPool.awaitQuery(userQuery, [username]);
  if (users.length === 0) {
    throw new Error("User not found");
  }
  username = users[0].id;
  const insertQuery = "INSERT INTO posts (user_id, content) VALUES (?, ?)";
  await connPool.awaitQuery(insertQuery, [username, content]);
}


async function updateLikeCount(postId, increment) {
  const query = increment 
      ? "UPDATE posts SET like_count = like_count + 1 WHERE post_id = ?"
      : "UPDATE posts SET like_count = like_count - 1 WHERE post_id = ?";
  await connPool.query(query, [postId]);
}

async function getLikeCount(postId) {
  const query = "SELECT like_count FROM posts WHERE post_id = ?";
  const result = await connPool.awaitQuery(query, [postId]);
  return result[0]?.like_count || 0;
}

async function addLike(username, postId) {
  const query = "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)";
  await connPool.query(query, [username, postId]);
}

async function getPosts(username) {
  const query = `
      SELECT posts.*, users.username 
      FROM posts 
      INNER JOIN users ON posts.user_id = users.id 
      WHERE users.username = ? 
      ORDER BY posts.created_at DESC
  `;

  try {
      const result = await connPool.awaitQuery(query, [username]);
      return result;
  } catch (err) {
      console.error('Error executing query', err.stack);
      throw err;
  }
}


async function deletePost(postId) {
  const query = "DELETE FROM posts WHERE post_id = ?";
  const result = await executeQuery(query, [postId]);
  return { success: result.affectedRows > 0 };
}

async function updatePost(postId, content) {
  const query = "UPDATE posts SET content = ? WHERE post_id = ?";
  await executeQuery(query, [content, postId]);
}

async function displayUserNamePost(page, limit = 10) {
  const offset = (page - 1) * limit;
  const postsQuery = `
      SELECT posts.*, users.username, posts.like_count
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT ?, ?
  `;
  const posts = await executeQuery(postsQuery, [offset, limit]);
  return posts;
}
async function getTotalPostsCount() {
  const query = "SELECT COUNT(*) as count FROM posts";
  const result = await connPool.awaitQuery(query);
  return result[0].count;
}


module.exports = {
  executeQuery,
  signUp,
  checkUser,
  getUser,
  deleteUser,
  createPost,
  displayUserNamePost,
  getLikeCount,
  updateLikeCount,
  addLike,
  getPosts,
  deletePost,
  updatePost,
  getTotalPostsCount,
};
