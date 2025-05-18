// Base URL for API
const API_BASE_URL = 'http://localhost:8081';
let currentUser = null;
let currentCodes = [];
let currentListId = null;

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastTitle = document.getElementById('toast-title');
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastTitle.textContent = 'Success';
        toast.classList.add('bg-success', 'text-white');
        toast.classList.remove('bg-danger', 'text-white');
    } else if (type === 'error') {
        toastTitle.textContent = 'Error';
        toast.classList.add('bg-danger', 'text-white');
        toast.classList.remove('bg-success', 'text-white');
    } else {
        toastTitle.textContent = 'Notification';
        toast.classList.remove('bg-success', 'bg-danger', 'text-white');
    }
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Navigation functions
function showLoginPage() {
    document.querySelectorAll('.auth-page').forEach(page => page.style.display = 'none');
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('search-page').style.display = 'none';
    document.getElementById('lists-page').style.display = 'none';
}

function showSignupPage() {
    document.querySelectorAll('.auth-page').forEach(page => page.style.display = 'none');
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('search-page').style.display = 'none';
    document.getElementById('lists-page').style.display = 'none';
}

function showSearchPage() {
    document.querySelectorAll('.auth-page').forEach(page => page.style.display = 'none');
    document.getElementById('search-page').style.display = 'block';
    document.getElementById('lists-page').style.display = 'none';
}

function showListsPage() {
    document.querySelectorAll('.auth-page').forEach(page => page.style.display = 'none');
    document.getElementById('search-page').style.display = 'none';
    document.getElementById('lists-page').style.display = 'block';
    document.getElementById('list-details').style.display = 'none';
    fetchUserLists();
}

function updateNavigation(isLoggedIn) {
    if (isLoggedIn) {
        document.getElementById('nav-login').style.display = 'none';
        document.getElementById('nav-signup').style.display = 'none';
        document.getElementById('nav-search').style.display = 'block';
        document.getElementById('nav-lists').style.display = 'block';
        document.getElementById('nav-logout').style.display = 'block';
        showSearchPage();
    } else {
        document.getElementById('nav-login').style.display = 'block';
        document.getElementById('nav-signup').style.display = 'block';
        document.getElementById('nav-search').style.display = 'none';
        document.getElementById('nav-lists').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'none';
        showLoginPage();
    }
}

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = email;
            updateNavigation(true);
            showToast('Login successful!', 'success');
            return true;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Login failed. Please check your credentials.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred during login.', 'error');
        return false;
    }
}

async function signup(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        if (response.ok) {
            showToast('Signup successful! Please login.', 'success');
            showLoginPage();
            return true;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Signup failed.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('An error occurred during signup.', 'error');
        return false;
    }
}

function logout() {
    currentUser = null;
    updateNavigation(false);
    showToast('Logged out successfully!');
}

// Search functions
async function searchCodes(pattern) {
    try {
        const response = await fetch(`${API_BASE_URL}/lists/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pattern })
        });
        
        if (response.ok) {
            const codes = await response.json();
            currentCodes = codes;
            displaySearchResults(codes);
            document.getElementById('save-list-container').style.display = currentUser ? 'flex' : 'none';
            return codes;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Search failed.', 'error');
            return [];
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('An error occurred during search.', 'error');
        return [];
    }
}

function displaySearchResults(codes) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (codes.length === 0) {
        resultsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No response codes found matching your pattern.</div></div>';
        return;
    }
    
    codes.forEach(code => {
        const imageUrl = `https://http.dog/${code}.jpg`;
        const codeCard = document.createElement('div');
        codeCard.className = 'col-md-3 mb-4';
        codeCard.innerHTML = `
            <div class="card response-code-card h-100">
                <div class="card-header text-center">
                    <h5 class="mb-0">Code ${code}</h5>
                </div>
                <img src="${imageUrl}" class="card-img-top" alt="HTTP ${code}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Available'">
            </div>
        `;
        resultsContainer.appendChild(codeCard);
    });
}

// List management functions
async function saveList(name, codes) {
    try {
        const response = await fetch(`${API_BASE_URL}/lists/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ listName: name, responseCodes: codes }),
            credentials: 'include'
        });
        
        if (response.ok) {
            showToast('List saved successfully!', 'success');
            return true;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to save list.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Save list error:', error);
        showToast('An error occurred while saving the list.', 'error');
        return false;
    }
}

async function fetchUserLists() {
    try {
        const response = await fetch(`${API_BASE_URL}/lists`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const lists = await response.json();
            displayUserLists(lists);
            return lists;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to fetch lists.', 'error');
            return [];
        }
    } catch (error) {
        console.error('Fetch lists error:', error);
        showToast('An error occurred while fetching lists.', 'error');
        return [];
    }
}

function displayUserLists(lists) {
    const listsContainer = document.getElementById('user-lists');
    listsContainer.innerHTML = '';
    
    if (lists.length === 0) {
        listsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">You don\'t have any saved lists yet. Go to the Search page to create one!</div></div>';
        return;
    }
    
    lists.forEach(list => {
        const listCard = document.createElement('div');
        listCard.className = 'col-md-4 mb-4';
        
        const createdAt = new Date(list.createdAt).toLocaleDateString();
        
        listCard.innerHTML = `
            <div class="card list-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${list.name}</h5>
                    <p class="card-text">
                        <small class="text-muted">Created: ${createdAt}</small>
                    </p>
                    <button class="btn btn-primary btn-sm view-list-btn" data-id="${list.id}">View Codes</button>
                </div>
            </div>
        `;
        
        listsContainer.appendChild(listCard);
        
        // Add event listener to the button
        const viewBtn = listCard.querySelector('.view-list-btn');
        viewBtn.addEventListener('click', () => {
            viewListDetails(list.id, list.name);
        });
    });
}

async function viewListDetails(listId, listName) {
    try {
        const response = await fetch(`${API_BASE_URL}/lists/${listId}/items`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const items = await response.json();
            displayListItems(items, listName);
            currentListId = listId;
            
            document.getElementById('list-detail-name').textContent = listName;
            document.getElementById('list-details').style.display = 'block';
            
            // Setup edit and delete buttons
            document.getElementById('edit-list-btn').onclick = () => {
                document.getElementById('new-list-name').value = listName;
                document.getElementById('edit-name-form').style.display = 'block';
            };
            
            document.getElementById('delete-list-btn').onclick = () => {
                if (confirm('Are you sure you want to delete this list?')) {
                    deleteList(listId);
                }
            };
            
            document.getElementById('update-name-btn').onclick = () => {
                const newName = document.getElementById('new-list-name').value;
                updateListName(listId, newName);
            };
            
            document.getElementById('cancel-edit-btn').onclick = () => {
                document.getElementById('edit-name-form').style.display = 'none';
            };
            
            return items;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to fetch list details.', 'error');
            return [];
        }
    } catch (error) {
        console.error('Fetch list details error:', error);
        showToast('An error occurred while fetching list details.', 'error');
        return [];
    }
}

function displayListItems(items, listName) {
    const itemsContainer = document.getElementById('list-items');
    itemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        itemsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">This list is empty.</div></div>';
        return;
    }
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'col-md-3 mb-4';
        itemCard.innerHTML = `
            <div class="card response-code-card h-100">
                <div class="card-header text-center">
                    <h5 class="mb-0">Code ${item.responseCodes}</h5>
                </div>
                <img src="${item.imageUrl}" class="card-img-top" alt="HTTP ${item.responseCodes}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Available'">
            </div>
        `;
        itemsContainer.appendChild(itemCard);
    });
}

async function deleteList(listId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showToast('List deleted successfully!', 'success');
            document.getElementById('list-details').style.display = 'none';
            fetchUserLists();
            return true;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to delete list.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Delete list error:', error);
        showToast('An error occurred while deleting the list.', 'error');
        return false;
    }
}

async function updateListName(listId, newName) {
    try {
        const response = await fetch(`${API_BASE_URL}/lists/${listId}?newName=${encodeURIComponent(newName)}`, {
            method: 'PUT',
            credentials: 'include'
        });
        
        if (response.ok) {
            showToast('List name updated successfully!', 'success');
            document.getElementById('list-detail-name').textContent = newName;
            document.getElementById('edit-name-form').style.display = 'none';
            fetchUserLists();
            return true;
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to update list name.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Update list name error:', error);
        showToast('An error occurred while updating the list name.', 'error');
        return false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await login(email, password);
    });
    
    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        await signup(name, email, password);
    });
    
    // Search button click
    document.getElementById('search-btn').addEventListener('click', async function() {
        const pattern = document.getElementById('search-pattern').value;
        if (!pattern) {
            showToast('Please enter a search pattern.', 'error');
            return;
        }
        await searchCodes(pattern);
    });
    
    // Save list button click
    document.getElementById('save-list-btn').addEventListener('click', async function() {
        if (!currentUser) {
            showToast('Please login to save lists.', 'error');
            return;
        }
        
        const name = document.getElementById('list-name').value;
        if (!name) {
            showToast('Please enter a name for your list.', 'error');
            return;
        }
        
        if (currentCodes.length === 0) {
            showToast('No response codes to save.', 'error');
            return;
        }
        
        await saveList(name, currentCodes);
    });
    
    // Check if user is logged in (for demo purposes)
    updateNavigation(false);
});