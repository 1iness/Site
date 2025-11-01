import ApiService from './ApiService.js';

export default class DataStore {
    constructor() {
        this.api = new ApiService();
        this.localUsers = JSON.parse(localStorage.getItem('localUsers')) || [];
        this.localTodos = JSON.parse(localStorage.getItem('localTodos')) || [];
    }

    async getUsers() {
        const apiUsers = await this.api.getUsers();
        return [...apiUsers, ...this.localUsers];
    }

    async getTodos() {
        const apiTodos = await this.api.getTodos();
        return [...apiTodos, ...this.localTodos];
    }

    async getPosts() {
        return this.api.getPosts();
    }

    async getComments() {
        return this.api.getComments();
    }

    addUser(user) {
        const newUser = {
            id: Date.now(),
            ...user
        };
        this.localUsers.push(newUser);
        localStorage.setItem('localUsers', JSON.stringify(this.localUsers));
        return newUser;
    }

    addTodo(todo) {
        const newTodo = {
            id: Date.now(),
            ...todo
        };
        this.localTodos.push(newTodo);
        localStorage.setItem('localTodos', JSON.stringify(this.localTodos));
        return newTodo;
    }

    deleteUser(userId) {
        this.localUsers = this.localUsers.filter(user => user.id !== userId);
        localStorage.setItem('localUsers', JSON.stringify(this.localUsers));
        
        this.localTodos = this.localTodos.filter(todo => todo.userId !== userId);
        localStorage.setItem('localTodos', JSON.stringify(this.localTodos));
    }
}