window.addEventListener('load', function() {
    const buttonExit = document.getElementById('quit-button');
    buttonExit?.addEventListener('click', function() {
        fetch('/quit', { method: 'POST' })
            .then(response => response.ok ? window.location.replace(response.url) : Promise.reject(response))
            .catch(() => console.error('Logout failed.'));
    });
});


window.addEventListener('load', function() {
    const buttonDeleteAccount = document.getElementById('deleteAccount-button');
    buttonDeleteAccount?.addEventListener('click', function() {
        if (window.confirm('Are you sure you want to delete your account?')) {
            fetch('/deleteAccount', { method: 'POST' })
                .then(response => response.ok ? alert('Account deleted successfully') : Promise.reject(response))
                .then(() => window.location.replace('/login'))
                .catch(() => alert('Account deletion failed'));
        }
    });
});


window.addEventListener('load', function() {
    const buttonViewPosts = document.getElementById('userpost');
    const inputUsername = document.getElementById('username');
    buttonViewPosts?.addEventListener('click', function() {
        const username = inputUsername.value;
        if (username) {
            window.location.href = `/user/${username}/posts`;
        }
    });
});





















