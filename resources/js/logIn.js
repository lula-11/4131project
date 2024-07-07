document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    loginForm && bindLoginForm(loginForm);
});

function bindLoginForm(form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        processLogin({
            username: form.querySelector('input[name="username"]').value,
            password: form.querySelector('input[name="password"]').value
        });
    });
}

function processLogin({ username, password }) {
    fetch('/login', createFetchRequest({ username, password }))
        .then(handleResponse)
        .catch(handleError);
}

function createFetchRequest(credentials) {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    };
}

function handleResponse(response) {
    return response.json().then(data => {
        if (data.success) {
            window.location.href = '/Profile';
        } else {
            alert(data.message);
        }
    });
}

function handleError(error) {
    console.error('Error:', error);
    alert('Login failed, please try again');
}
