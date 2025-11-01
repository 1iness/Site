export default class Component {
    constructor(tag, props = {}) {
        this.element = document.createElement(tag);
        
        if (props.className) {
            this.element.className = props.className;
        }
        
        if (props.id) {
            this.element.id = props.id;
        }
        
        if (props.text) {
            this.element.textContent = props.text;
        }
        
        if (props.html) {
            this.element.innerHTML = props.html;
        }
        
        if (props.children) {
            props.children.forEach(child => {
                if (child instanceof Component) {
                    this.element.appendChild(child.element);
                } else {
                    this.element.appendChild(child);
                }
            });
        }
        
        if (props.attrs) {
            Object.keys(props.attrs).forEach(key => {
                this.element.setAttribute(key, props.attrs[key]);
            });
        }
        
        if (props.events) {
            Object.keys(props.events).forEach(event => {
                this.element.addEventListener(event, props.events[event]);
            });
        }
        
        return this.element;
    }
}