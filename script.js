/**
 * @Class Model
 *
 * 管理应用的数据
 */
class Model {
    constructor() {
        //从 localStorage 里面取值
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    }

    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback;
    }

    //保存在本地
    _commit(todos) {
        this.onTodoListChanged(todos);
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    addTodo(todoText) {
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,
        };

        this.todos.push(todo);

        this._commit(this.todos);
    }

    editTodo(id, updatedText) {
        this.todos = this.todos.map(todo =>
            todo.id === id
                ? {id: todo.id, text: updatedText, complete: todo.complete}
                : todo
        );
        this._commit(this.todos)
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);

        this._commit(this.todos)
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id
                ? {id: todo.id, text: todo.text, complete: !todo.complete}
                : todo
        );

        this._commit(this.todos)
    }
}

/**
 * @class View
 * model层的可视化展示
 */
class View {
    constructor() {
        //创造DOM树需要展示的各种节点
        //DOM树根节点
        this.app = this.getElement("#root");

        //heading
        this.title = this.createElement("h1");
        this.title.textContent = "Todos";

        //form
        this.form = this.createElement("form");
        //form content
        this.input = this.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "Add todo";
        this.input.name = "todo";
        //add button
        this.submitButton = this.createElement("button");
        this.submitButton.textContent = "Submit";
        this.form.append(this.input, this.submitButton);
        //todo things List
        this.todoList = this.createElement("ul", "todo-list");
        this.app.append(this.title, this.form, this.todoList);

        this._temporaryTodoText = '';
        this._initLocalListeners()
    }

    //获得输入的input 的 value
    get _todoText() {
        return this.input.value;
    }

    //重置
    _resetInput() {
        this.input.value = "";
    }

    //重载createElement 方法
    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className);
        }
        return element;
    }

    //根据selector 获得 节点
    getElement = selector => document.querySelector(selector);

    //Todo 列表的展示
    displayTodos(todos) {
        //先删除所有的子节点元素
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }
        //展示默认的消息
        if (todos.length === 0) {
            const p = this.createElement("p");
            p.textContent = "Nothing to do ! Add a task?";
            this.todoList.append(p);
        } else {
            //创建节点
            todos.forEach(todo => {
                const li = this.createElement("li");
                li.id = todo.id;

                //每个代办项都有一个checkbox
                const checkbox = this.createElement("input");
                checkbox.type = "checkbox";
                checkbox.complete = todo.complete;

                const span = this.createElement("span");
                span.contentEditable = true;
                span.classList.add("editable");

                //如果已经完成，添加一条删除线 表示已经完成
                if (todo.complete) {
                    const strike = this.createElement("s");
                    strike.textContent = todo.text;
                    span.append(strike);
                } else {
                    //直接展示文字
                    span.textContent = todo.text;
                }
                //删除按钮
                const deleteButton = this.createElement("button", "delete");
                deleteButton.textContent = "Delete";
                li.append(checkbox, span, deleteButton);

                //将li 节点 加入到 todoList
                this.todoList.append(li);
            });
        }
        //调试
        console.log(todos)
    }

    _initLocalListeners() {
        this.todoList.addEventListener('input', event => {
            if (event.target.className === 'editable') {
                this._temporaryTodoText = event.target.innerText
            }
        })
    }

    bindAddTodo(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault();

            if (this._todoText) {
                handler(this._todoText);
                this._resetInput()
            }
        });
    }

    bindDeleteTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id);

                handler(id)
            }
        })
    }

    bindEditTodo(handler) {
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id);

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = ''
            }
        })
    }

    bindToggleTodo(handler) {
        this.todoList.addEventListener('change', event => {
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.parentElement.id);

                handler(id);
            }
        })
    }
}

/**
 * @class Controller
 *
 * 连接用户输入和视图输出
 * @param model
 * @param view
 */
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        //视图与model 绑定
        this.model.bindTodoListChanged(this.onTodoListChanged);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);

        //初始化展示 todos
        this.onTodoListChanged(this.model.todos);

    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos);
    };
    //方法函数
    handleAddTodo = todoText => {
        this.model.addTodo(todoText);
    };

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText);
    };
    handleDeleteTodo = id => {
        this.model.deleteTodo(id);
    };
    handleToggleTodo = id => {
        this.model.toggleTodo(id);
    };
}

const app = new Controller(new Model(), new View());
