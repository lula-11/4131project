function updateLike(likeButton) {
    const postId = likeButton.dataset.id;
    fetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
        credentials: 'include',
    })
    .then(response => {
        if (response.status === 401) {
            alert('You can like a post after logging in');
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error('Bad network response.');
        return response.json();
    })
    .then(data => {
        const postDetails = likeButton.closest('.post');
        postDetails.querySelector('.likecount').textContent = `${data.like_count} likes`;
    })
    .catch(error => console.error('Error occurred:', error));
}


function manageUserActions() {
    const loginBtn = document.querySelector('.login');
    fetch('/api/check-login')
        .then(response => response.json())
        .then(data => {
            loginBtn.textContent = data.isLoggedIn ? data.username : 'Login';
            loginBtn.addEventListener('click', () => {
                window.location.href = data.isLoggedIn ? '/profile' : '/login';
            });
        })
        .catch(error => console.error('Error occurred:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    manageUserActions();
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => updateLikeStatus(button));
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = {
        mostLikes: document.getElementById('most'),
        leastLikes: document.getElementById('least'),
    };

    sortButtons.mostLikes.addEventListener('click', () => reorderPosts('desc'));
    sortButtons.leastLikes.addEventListener('click', () => reorderPosts('asc'));

    function reorderPosts(sortOrder) {
        let postsList = Array.from(document.getElementsByClassName('post'));
        const sortButtonsContainer = document.querySelector('.sort');
    
        postsList.sort((postA, postB) => {
            let likesA = Number(postA.querySelector('.likecount').textContent.split(' ')[0]);
            let likesB = Number(postB.querySelector('.likecount').textContent.split(' ')[0]);
            return sortOrder === 'asc' ? likesA - likesB : likesB - likesA;
        });
    
        postsList.forEach(post => {
            sortButtonsContainer.insertAdjacentElement('afterend', post);
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const page = this.getAttribute('href').match(/page=(\d+)/)[1];
            window.location.href = `/posts?page=${page}`;
        });
    });
});

