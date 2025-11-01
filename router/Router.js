import DataStore from '../services/DataStore.js';
import { Utils } from '../utils/Utils.js';

export default class Router {
    constructor() {
        this.routes = {
            'users': this.renderUsers.bind(this),
            'todos': this.renderTodos.bind(this),
            'posts': this.renderPosts.bind(this),
            'comments': this.renderComments.bind(this)
        };
        
        this.currentRoute = 'users';
        this.dataStore = new DataStore();
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        this.renderApp();
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        this.handleHashChange();
    }

    renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="grid-overlay"></div>
            <div id="root">
                <header>
                    <div class="logo">Nexus Dashboard</div>
                    <nav>
                        <ul>
                            <li><a href="#users" class="nav-link">Пользователи</a></li>
                            <li><a href="#todos" class="nav-link">Задачи</a></li>
                            <li><a href="#posts" class="nav-link">Посты</a></li>
                            <li><a href="#comments" class="nav-link">Комментарии</a></li>
                        </ul>
                    </nav>
                </header>
                
                <div class="breadcrumbs" id="breadcrumbs">
                    <a href="#users">Главная</a>
                </div>
                
                <div class="search-container">
                    <div class="search-icon">🔍</div>
                    <input type="text" id="searchInput" class="search-input" placeholder="Поиск...">
                </div>
                
                <div class="content" id="content">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        Загрузка...
                    </div>
                </div>
            </div>
        `;

        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);
        searchInput.addEventListener('input', debouncedSearch);
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        const baseRoute = hash.split('?')[0] || 'users';
        this.currentRoute = baseRoute;
        this.render();
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.render();
    }

    async render() {
        this.updateBreadcrumbs();
        this.updateActiveNav();
        
        if (this.routes[this.currentRoute]) {
            await this.routes[this.currentRoute]();
        } else {
            this.renderNotFound();
        }
    }

    updateBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        const hash = window.location.hash.substring(1);
        
        let breadcrumbHTML = '<a href="#users">Главная</a>';
        
        if (hash) {
            const parts = hash.split('?')[0].split('/');
            
            parts.forEach((part, index) => {
                if (part) {
                    const route = parts.slice(0, index + 1).join('/');
                    const name = this.getRouteName(part);
                    
                    if (index < parts.length - 1) {
                        breadcrumbHTML += `<span> / </span><a href="#${route}">${name}</a>`;
                    } else {
                        breadcrumbHTML += `<span> / </span>${name}`;
                    }
                }
            });
        }
        
        breadcrumbs.innerHTML = breadcrumbHTML;
    }

    getRouteName(route) {
        const names = {
            'users': 'Пользователи',
            'todos': 'Задачи',
            'posts': 'Посты',
            'comments': 'Комментарии'
        };
        
        return names[route] || route;
    }

    updateActiveNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('href').substring(1);
            if (this.currentRoute === linkRoute) {
                link.classList.add('active');
            }
        });
    }

    async renderUsers() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                Загрузка пользователей...
            </div>
        `;
        
        const users = await this.dataStore.getUsers();
        let filteredUsers = users;
        
        if (this.searchTerm) {
            filteredUsers = users.filter(user => 
                user.name.toLowerCase().includes(this.searchTerm) || 
                user.email.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (filteredUsers.length === 0) {
            content.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">👥</div>
                    <h3>Пользователи не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }
        
        let usersHTML = `
            <div class="content-header">
                <h2 class="content-title">Пользователи</h2>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${filteredUsers.length}</div>
                    <div class="stat-label">Всего пользователей</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${filteredUsers.filter(u => u.id > 1000).length}</div>
                    <div class="stat-label">Локальные пользователи</div>
                </div>
            </div>
            
            <div class="add-user-form">
                <h3>Добавить пользователя</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="userName">Имя</label>
                        <input type="text" id="userName" placeholder="Введите имя">
                    </div>
                    <div class="form-group">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" placeholder="Введите email">
                    </div>
                </div>
                <button id="addUserBtn" class="btn">Добавить пользователя</button>
            </div>
            
            <div class="users-list">
        `;
        
        filteredUsers.forEach(user => {
            const isLocal = user.id > 1000;
            usersHTML += `
                <div class="user-card">
                    <h3>${user.name}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
                    <p><strong>Вебсайт:</strong> ${user.website || 'Не указан'}</p>
                    <p><strong>Компания:</strong> ${user.company?.name || 'Не указана'}</p>
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <a href="#todos?userId=${user.id}" class="btn" style="padding: 10px 20px; font-size: 14px;">Задачи</a>
                        <a href="#posts?userId=${user.id}" class="btn" style="padding: 10px 20px; font-size: 14px;">Посты</a>
                    </div>
                    ${isLocal ? `<button class="delete-btn" data-user-id="${user.id}">Удалить пользователя</button>` : ''}
                </div>
            `;
        });
        
        usersHTML += '</div>';
        content.innerHTML = usersHTML;
        
        document.getElementById('addUserBtn').addEventListener('click', () => {
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            
            if (name && email) {
                this.dataStore.addUser({ name, email });
                document.getElementById('userName').value = '';
                document.getElementById('userEmail').value = '';
                this.render();
            } else {
                alert('Пожалуйста, заполните все поля');
            }
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.target.getAttribute('data-user-id'));
                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                    this.dataStore.deleteUser(userId);
                    this.render();
                }
            });
        });
    }

    async renderTodos() {
        const content = document.getElementById('content');
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const userId = urlParams.get('userId');
        
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                Загрузка задач...
            </div>
        `;
        
        const todos = await this.dataStore.getTodos();
        let filteredTodos = todos;
        
        if (userId) {
            filteredTodos = todos.filter(todo => todo.userId == userId);
        }
        
        if (this.searchTerm) {
            filteredTodos = filteredTodos.filter(todo => 
                todo.title.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (filteredTodos.length === 0) {
            content.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">📝</div>
                    <h3>Задачи не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }
        
        const completedCount = filteredTodos.filter(t => t.completed).length;
        const pendingCount = filteredTodos.filter(t => !t.completed).length;
        
        let todosHTML = `
            <div class="content-header">
                <h2 class="content-title">Задачи</h2>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${filteredTodos.length}</div>
                    <div class="stat-label">Всего задач</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${completedCount}</div>
                    <div class="stat-label">Выполнено</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${pendingCount}</div>
                    <div class="stat-label">В процессе</div>
                </div>
            </div>
            
            <div class="add-todo-form">
                <h3>Добавить задачу</h3>
                <div class="form-group">
                    <label for="todoTitle">Название задачи</label>
                    <input type="text" id="todoTitle" placeholder="Введите название задачи">
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="todoCompleted">
                    <label for="todoCompleted">Выполнено</label>
                </div>
                <button id="addTodoBtn" class="btn">Добавить задачу</button>
            </div>
            
            <div class="todos-list">
        `;
        
        filteredTodos.forEach(todo => {
            const statusClass = todo.completed ? 'completed' : 'pending';
            const statusText = todo.completed ? 'Выполнено' : 'В процессе';
            
            todosHTML += `
                <div class="todo-item ${statusClass}">
                    <div class="todo-content">
                        <h3>${Utils.formatText(todo.title, 60)}</h3>
                        <p>ID пользователя: ${todo.userId}</p>
                    </div>
                    <div class="todo-status">
                        <span class="status-badge status-${todo.completed ? 'completed' : 'pending'}">${statusText}</span>
                    </div>
                </div>
            `;
        });
        
        todosHTML += '</div>';
        content.innerHTML = todosHTML;
        
        document.getElementById('addTodoBtn').addEventListener('click', () => {
            const title = document.getElementById('todoTitle').value;
            const completed = document.getElementById('todoCompleted').checked;
            
            if (title) {
                this.dataStore.addTodo({ 
                    title, 
                    completed, 
                    userId: userId || 1 
                });
                document.getElementById('todoTitle').value = '';
                document.getElementById('todoCompleted').checked = false;
                this.render();
            } else {
                alert('Пожалуйста, введите название задачи');
            }
        });
    }

    async renderPosts() {
        const content = document.getElementById('content');
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const userId = urlParams.get('userId');
        
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                Загрузка постов...
            </div>
        `;
        
        const posts = await this.dataStore.getPosts();
        let filteredPosts = posts;
        
        if (userId) {
            filteredPosts = posts.filter(post => post.userId == userId);
        }
        
        if (this.searchTerm) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(this.searchTerm) || 
                post.body.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (filteredPosts.length === 0) {
            content.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">📰</div>
                    <h3>Посты не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }
        
        let postsHTML = `
            <div class="content-header">
                <h2 class="content-title">Посты</h2>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${filteredPosts.length}</div>
                    <div class="stat-label">Всего постов</div>
                </div>
            </div>
            
            <div class="posts-list">
        `;
        
        filteredPosts.forEach(post => {
            postsHTML += `
                <div class="post-item">
                    <h3>${Utils.formatText(post.title, 80)}</h3>
                    <p>${Utils.formatText(post.body, 150)}</p>
                    <div style="margin-top: 20px;">
                        <a href="#comments?postId=${post.id}" class="btn" style="padding: 10px 20px; font-size: 14px;">Комментарии</a>
                    </div>
                </div>
            `;
        });
        
        postsHTML += '</div>';
        content.innerHTML = postsHTML;
    }

    async renderComments() {
        const content = document.getElementById('content');
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const postId = urlParams.get('postId');
        
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                Загрузка комментариев...
            </div>
        `;
        
        const comments = await this.dataStore.getComments();
        let filteredComments = comments;
        
        if (postId) {
            filteredComments = comments.filter(comment => comment.postId == postId);
        }
        
        if (this.searchTerm) {
            filteredComments = filteredComments.filter(comment => 
                comment.name.toLowerCase().includes(this.searchTerm) || 
                comment.body.toLowerCase().includes(this.searchTerm) ||
                comment.email.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (filteredComments.length === 0) {
            content.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">💬</div>
                    <h3>Комментарии не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }
        
        let commentsHTML = `
            <div class="content-header">
                <h2 class="content-title">Комментарии</h2>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${filteredComments.length}</div>
                    <div class="stat-label">Всего комментариев</div>
                </div>
            </div>
            
            <div class="comments-list">
        `;
        
        filteredComments.forEach(comment => {
            commentsHTML += `
                <div class="comment-item">
                    <h3>${Utils.formatText(comment.name, 60)}</h3>
                    <p><strong>Email:</strong> ${comment.email}</p>
                    <p>${Utils.formatText(comment.body, 120)}</p>
                </div>
            `;
        });
        
        commentsHTML += '</div>';
        content.innerHTML = commentsHTML;
    }

    renderNotFound() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">❓</div>
                <h3>Страница не найдена</h3>
                <p>Запрашиваемая страница не существует</p>
                <a href="#users" class="btn" style="margin-top: 20px;">Вернуться на главную</a>
            </div>
        `;
    }
}