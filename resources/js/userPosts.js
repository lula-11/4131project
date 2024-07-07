document.addEventListener('DOMContentLoaded', () => {
  setupButtonListeners('.button-edit', editPost);
  setupButtonListeners('.button-delete', deletePost);
  setupSortingListeners();
});

function setupButtonListeners(selector, action) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach(button => {
      button.addEventListener('click', () => {
          const postId = button.dataset.postId;
          action(postId);
      });
  });
}

function editPost(postId) {
  window.location.href = `/edit-post/${postId}`;
}

function deletePost(postId) {
  if (confirm('Are you sure you want to delete post?')) {
      fetch(`/delete-post/${postId}`, { method: 'DELETE' })
          .then(checkResponse)
          .then(handleDeleteResponse)
          .catch(handleError);
  }
}

function setupSortingListeners() {
  const sortButtons = document.querySelectorAll('[data-sort-type]');
  sortButtons.forEach(button => {
      button.addEventListener('click', () => {
          const order = button.dataset.sortType === 'mostLikes' ? 'desc' : 'asc';
          sortPosts(order);
      });
  });
}

function sortPosts(order) {
  const postsContainer = document.querySelector('.allposts');
  let forms = Array.from(postsContainer.querySelectorAll('form'));
  forms.sort((a, b) => compareLikes(a, b, order));
  postsContainer.innerHTML = '';
  forms.forEach(form => postsContainer.appendChild(form));
}

function compareLikes(a, b, order) {
  const likesA = getLikes(a), likesB = getLikes(b);
  return order === 'asc' ? likesA - likesB : likesB - likesA;
}

function getLikes(postForm) {
  const likeElement = postForm.querySelector('.likecount');
  return likeElement ? parseInt(likeElement.textContent.split(' ')[0], 10) : 0;
}

function checkResponse(response) {
  if (!response.ok) {
      throw new Error('Network response was not ok.');
  }
  return response.json();
}

function handleDeleteResponse(data) {
  if (data.success) {
      window.location.reload();
  } else {
      alert('failed to delete');
  }
}

function handleError(error) {
  console.error('Error:', error);
  alert('failed to delete');
}
