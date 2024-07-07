const port = 4132;
const express = require('express');
const app = express();
const pug = require('pug');
const data = require('./data.js');
const session = require('express-session');
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.set('views', './PUG');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/resources", express.static("resources"))


function handleError(res, error, message) {
    console.error(message, error);
    res.status(500).send('Internal Server Error');
}


app.get('/signup', (req, res) => res.render('signUp.pug'));
app.get('/login', (req, res) => res.render('logIn.pug'));
app.get('/createPost', (req, res) => res.render('createPost'));


function ensureLoggedIn(req, res, next) {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    next();
}


app.get('/profile', ensureLoggedIn, async (req, res) => {
    try {
        const result = await data.getUser(req.session.username);
        result.success ? res.render('profile', { user: result.user }) : res.redirect('/login');
    } catch (error) {
        handleError(res, error, 'Error in profile');
    }
});


app.get(['/','/posts'], async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    try {
        const posts = await data.displayUserNamePost(page, limit);
        const totalPostsCount = await data.getTotalPostsCount();
        const totalPages = Math.ceil(totalPostsCount / limit);
        res.render('home', { posts, currentPage: page, totalPages });
    } catch (error) {
        handleError(res, error, 'Error fetching posts');
    }
});


function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
app.get('/user/:username/posts', async (req, res) => {
    try {
        const username = req.params.username;
        let userPosts = await data.getPosts(username);
        userPosts = userPosts.map(post => {
            post.canEdit = (new Date() - new Date(post.created_at)) < 3 * 60 * 1000;
            post.formattedCreatedAt = formatDate(post.created_at);
            return post;
        });
        res.render('userPosts', { posts: userPosts, username: username });
    } catch (error) {
        handleError(res, error, 'Error fetching user posts');
    }
});


app.get('/api/check-login', (req, res) => {
    req.session.username ? res.json({ isLoggedIn: true, username: req.session.username }) : res.json({ isLoggedIn: false });
});


app.delete('/delete-post/:postId', async (req, res) => {
    try {
        const result = await data.deletePost(req.params.postId);
        result.success ? res.json({ success: true }) : res.status(404).send('Post not found');
    } catch (error) {
        handleError(res, error, 'Error in /delete-post');
    }
});


const bcrypt = require('bcrypt');
const saltRounds = 10;
app.post('/signUp', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await data.signUp(username, hashedPassword);
        res.redirect('/login');
    } catch (error) {
        handleError(res, error, 'Registration error');
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await data.checkUser(username, password);
        if (result.success) {
            req.session.username = username;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (error) {
        handleError(res, error, 'Login error');
    }
});


app.post('/quit', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            err ? handleError(res, err, 'quit error') : res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
});


app.post('/deleteAccount', async (req, res) => {
    try {
        const result = await data.deleteUser(req.session.username);
        if (result.success) {
            req.session && req.session.destroy();
            res.send({ success: true });
        } else {
            res.status(500).send({ success: false, message: 'Error deleting account' });
        }
    } catch (error) {
        handleError(res, error, 'Error in deleteAccount route');
    }
});


app.post('/posts', async (req, res) => {
    if (!req.session.username) {
        return res.status(403).send("You can create a post after logging in");
    }
    try {
        await data.createPost(req.session.username, req.body.content);
        res.redirect('/posts');
    } catch (error) {
        handleError(res, error, 'Error creating post');
    }
});


app.post('/update-post/:postId', async (req, res) => {
    try {
        await data.updatePost(req.params.postId, req.body.content);
        res.redirect('/posts');
    } catch (error) {
        handleError(res, error, 'Error updating post');
    }
});


app.post('/posts/:id/like', async (req, res) => {
    if (!req.session.username) {
        return res.status(401).send("You can like a post after logging in");
    }
    try {
        await data.addLike(req.session.username, req.params.id);
        await data.updateLikeCount(req.params.id, true);
        const newLikeCount = await data.getLikeCount(req.params.id);
        res.json({ success: true, like_count: newLikeCount });
    } catch (error) {
        handleError(res, error, 'Error liking the post');
    }
});


app.use((req, res) => {
    res.status(404).send("There is no such page!");
});


app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});