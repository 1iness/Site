export default class ApiService {
    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
    }

    async makeRequest(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    }

    async getUsers() {
        return this.makeRequest('/users');
    }

    async getTodos() {
        return this.makeRequest('/todos');
    }

    async getPosts() {
        return this.makeRequest('/posts');
    }

    async getComments() {
        return this.makeRequest('/comments');
    }
}