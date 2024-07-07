My project can be started directly through node server.js
My project achieved:
1.Users can create short text-posts.
2.Text posts can be viewed, and should be shown in reverse temporal order (newest first) with basic pagination
3.Text posts can be edited and deleted
4.Text posts can be "liked", and should maintain a "like count"
5.able to change from reverse temporal order to sorting by like-count. (most liked posts at the top). This view should also be paginated
6.Account creation (I.E. a not-logged in user can create a new account)
7.Logged-in vs. not-logged-in status should be tracked.
8.Login and logout features: using the bcrypt software library to implement good quality password hashing
9.Posts are associated with a specific user, only the associated user can edit or delete a given post.