// localStorage.clear();

//Selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
const todoContainer = document.querySelector('.todo-container');

//Event listeners
document.addEventListener('DOMContentLoaded', getTodos); //attaching event listener to document (or window) - when overything on page is loaded, run getTodos function
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', deleteCheck); //listening what is being clicked (todo-item or complete-btn or trash-btn)
filterOption.addEventListener('click', filterTodo);

//Functions
function addTodo(event) {
    event.preventDefault(); //preventing form from refreshing
    //create div (will contain li and two buttons)
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    const todo = todoInput.value;
    todoDiv.setAttribute('id', todo);
    //create li
    const newTodo = document.createElement('li');
    newTodo.innerText = todoInput.value;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo); //putting li inside div (div is parent now)
    //add todo to local storage (adding what's written in input window)
    saveLocalTodos(todoInput.value);
    //create buttons
    //options button
    const optionsButton = document.createElement('button');
    optionsButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
    optionsButton.classList.add('options-btn');
    optionsButton.setAttribute('id', todo + '-op'); //selector that points to the popup we want to open
    todoDiv.appendChild(optionsButton);
    //completed button
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add('complete-btn');
    todoDiv.appendChild(completedButton);
    //trash button
    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add('trash-btn');
    todoDiv.appendChild(trashButton);

    //create popup
    const popup = document.createElement('div');
    popup.classList.add('popup-div');
    const popupHeader = document.createElement('div');
    popupHeader.classList.add('popup-header-div');
    const popupTitle = document.createElement('p');
    popupTitle.innerText = todo;
    popupHeader.appendChild(popupTitle);
    const popupExitButton = document.createElement('button');
    popupExitButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    const exitITag = popupExitButton.innerHTML;
    popupExitButton.classList.add('popup-exit-btn');
    popupExitButton.addEventListener('click', (e) => {
        const item = e.target;
        const div = item.closest('.popup-div'); //from X to closest popup div
        div.classList.toggle('popup-active');
    })
    popupHeader.appendChild(popupExitButton);
    popup.appendChild(popupHeader);
    const popupNote = document.createElement('div');
    popupNote.classList.add('popup-note-div');

    const noteTitleDiv = document.createElement('div');
    noteTitleDiv.classList.add('note-title-div');

    const popupNoteTitle = document.createElement('p');
    popupNoteTitle.innerText = 'Note';
    noteTitleDiv.appendChild(popupNoteTitle);

    //saving note
    const saveButton = document.createElement('button');
    const noteKey = `${todo}-key`;
    saveButton.innerText = 'save';
    //saved icon
    const savedIcon = document.createElement('i');
    savedIcon.setAttribute('class', 'fa-solid fa-check saved-icon');
    saveButton.onclick = function () {
        localStorage.setItem(noteKey, JSON.stringify(popupNoteInput.value));

        //saved notification
        savedIcon.classList.add('active');
        setTimeout(() => savedIcon.classList.remove('active'), 5000);
    };
    noteTitleDiv.appendChild(saveButton);
    noteTitleDiv.appendChild(savedIcon);
    popupNote.appendChild(noteTitleDiv);

    const popupNoteInput = document.createElement('textarea');
    popupNoteInput.classList.add('popup-note-input');
    popupNoteInput.setAttribute('id', 'input-window');
    popupNoteInput.setAttribute('type', 'text');
    popupNoteInput.setAttribute('placeholder', 'Type your note here');
    popupNote.appendChild(popupNoteInput);
    popup.appendChild(popupNote);
    todoDiv.appendChild(popup);

    //append div to the upper ul
    todoList.appendChild(todoDiv);

    //clear todoInput value (no text in window after it's been added)
    todoInput.value = "";
}

function deleteCheck(e) {
    const item = e.target; //item clicked
    let todosUncompleted;
    let todosCompleted;
    //delete todo
    if (item.classList[0] === "trash-btn") { //[0] - name of item's class
        const todo = item.parentElement; //parent of item - div 'todo'
        todo.classList.add('fall'); //transition
        removeLocalTodos(todo);
        todo.addEventListener('transitionend', () => {
            todo.remove(); //deleting item's parent, not just item itself
        })
    }

    //check todo
    if (item.classList[0] === "complete-btn") {
        const todo = item.parentElement;
        const todoValue = item.parentElement.children[0].innerText;
        todo.classList.toggle('completed'); //we're adding class

        todosUncompleted = JSON.parse(localStorage.getItem('todosUncompleted'));
        if (localStorage.getItem('todosCompleted') === null) {
            todosCompleted = [];
        } else {
            todosCompleted = JSON.parse(localStorage.getItem('todosCompleted'));
        }

        //todo from uncompleted to completed
        if (todosUncompleted.includes(todoValue)) {
            todosUncompleted.splice(todosUncompleted.indexOf(todoValue), 1);
            todosCompleted.push(todoValue);
        } else if (todosCompleted.includes(todoValue)) { //todo from completed to uncompleted
            todosCompleted.splice(todosCompleted.indexOf(todoValue), 1);
            todosUncompleted.push(todoValue);
        }
        localStorage.setItem('todosCompleted', JSON.stringify(todosCompleted));
        localStorage.setItem('todosUncompleted', JSON.stringify(todosUncompleted));
    }

    //options for todo
    if (item.classList[0] === 'options-btn') {
        //closing opened popups before opening a new one
        const popup = item.parentElement.lastChild;
        const popupParent = item.parentElement; //div I've clicked
        const activePopups = document.querySelectorAll('.popup-div.popup-active');
        activePopups.forEach(popupActive => {
            const popupActiveParent = popupActive.parentElement; //div that is active
            if (popupParent !== popupActiveParent) { //close popup if divs different
                popupActive.classList.remove('popup-active');
            }
        })
        //toggling popup
        popup.classList.toggle('popup-active');
    }

}

function filterTodo(e) {
    const todos = todoList.childNodes; //divs
    todos.forEach(todo => { //switch regarding every todo item
        switch (e.target.value) { //what is being clicked (value)
            case "all":
                todo.style.display = 'flex'; //flex because we gave it
                break;
            case "completed": //if this clicked go through each and check
                if (todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
            case "uncompleted":
                if (!todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
        }
    })
}

function saveLocalTodos(todo) {
    let todos;
    //check if there's something in local storage
    if (localStorage.getItem('todosAll') === null) {
        todos = []; //creating array if there's nothing
    } else {
        todos = JSON.parse(localStorage.getItem('todosAll')); //parse existing todos array from JSON string into JS array
    }
    todos.push(todo);
    localStorage.setItem("todosAll", JSON.stringify(todos)); //putting back the todos array into local storage - saving
    //saving to uncompleted
    saveToLocalStorage('todosUncompleted', todo);
}

function saveToLocalStorage(localStorageArrName, todoValue) {
    let localStorageArr;

    if (localStorage.getItem(localStorageArrName) === null) {
        localStorageArr = [];
    } else {
        localStorageArr = JSON.parse(localStorage.getItem(localStorageArrName));
    }
    if (!localStorageArr.includes(todoValue)) {
        localStorageArr.push(todoValue);
    }
    localStorage.setItem(localStorageArrName, JSON.stringify(localStorageArr));
}

function getArrFromLocalStorage(arrName) {
    let todosArr;
    //check if there's something in local storage
    if (localStorage.getItem(arrName) === null) {
        todosArr = [];
    } else {
        todosArr = JSON.parse(localStorage.getItem(arrName));
    }
    return todosArr;
}

function getTodos() { //displaying todos from local storage (ie after refresh)
    const todosAll = getArrFromLocalStorage('todosAll');
    const todosCompleted = getArrFromLocalStorage('todosCompleted');

    todosAll.forEach(todo => {
        if (todosAll.includes(todo) && todosCompleted.includes(todo)) {
            //create div (will contain li and two buttons)
            const todoDiv = document.createElement('div');
            todoDiv.classList.add('todo');
            todoDiv.classList.toggle('completed');
            todoDiv.setAttribute('id', todo);
            //create li
            const newTodo = document.createElement('li');
            newTodo.innerText = todo; //take todos from local storage
            newTodo.classList.add('todo-item');
            todoDiv.appendChild(newTodo); //putting li inside div
            //create buttons
            //options button
            const optionsButton = document.createElement('button');
            optionsButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
            optionsButton.classList.add('options-btn');
            optionsButton.setAttribute('id', todo + '-op'); //selector that points to the popup we want to open
            todoDiv.appendChild(optionsButton);
            //completed button
            const completedButton = document.createElement('button');
            completedButton.innerHTML = '<i class="fas fa-check"></i>'; //add <i> tag to the html element
            completedButton.classList.add('complete-btn');
            todoDiv.appendChild(completedButton);
            //trash button
            const trashButton = document.createElement('button');
            trashButton.innerHTML = '<i class="fas fa-trash"></i>';
            trashButton.classList.add('trash-btn');
            todoDiv.appendChild(trashButton);

            //create popup
            const popup = document.createElement('div');
            popup.classList.add('popup-div');
            const popupHeader = document.createElement('div');
            popupHeader.classList.add('popup-header-div');
            const popupTitle = document.createElement('p');
            popupTitle.innerText = todo;
            popupHeader.appendChild(popupTitle);
            const popupExitButton = document.createElement('button');
            popupExitButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            const exitITag = popupExitButton.innerHTML;
            popupExitButton.classList.add('popup-exit-btn');
            popupExitButton.addEventListener('click', (e) => {
                const item = e.target;
                const div = item.closest('.popup-div'); //from X to closest popup div
                div.classList.toggle('popup-active');
            })
            popupHeader.appendChild(popupExitButton);
            popup.appendChild(popupHeader);
            const popupNote = document.createElement('div');
            popupNote.classList.add('popup-note-div');

            const noteTitleDiv = document.createElement('div');
            noteTitleDiv.classList.add('note-title-div');

            const popupNoteTitle = document.createElement('p');
            popupNoteTitle.innerText = 'Note';
            noteTitleDiv.appendChild(popupNoteTitle);

            //saving note
            const saveButton = document.createElement('button');
            saveButton.innerText = 'save';
            //saved icon
            const savedIcon = document.createElement('i');
            savedIcon.setAttribute('class', 'fa-solid fa-check saved-icon');
            saveButton.onclick = function () {
                localStorage.setItem(noteKey, JSON.stringify(popupNoteInput.value));

                //saved notification
                savedIcon.classList.add('active');
                setTimeout(() => savedIcon.classList.remove('active'), 5000);
            };
            noteTitleDiv.appendChild(saveButton);
            noteTitleDiv.appendChild(savedIcon);
            popupNote.appendChild(noteTitleDiv);

            const popupNoteInput = document.createElement('textarea');
            popupNoteInput.classList.add('popup-note-input');
            popupNoteInput.setAttribute('id', 'input-window');
            popupNoteInput.setAttribute('type', 'text');
            popupNoteInput.setAttribute('placeholder', 'Type your note here');
            popupNote.appendChild(popupNoteInput);
            popup.appendChild(popupNote);
            todoDiv.appendChild(popup);

            //append div to the upper ul
            todoList.appendChild(todoDiv);

            //loading note
            const noteKey = `${todo}-key`;
            if (localStorage.getItem(noteKey) === null) {
                noteValue = '';
            } else {
                noteValue = JSON.parse(localStorage.getItem(noteKey));
            }
            popupNoteInput.value = noteValue;
        } else {
            //create div (will contain li and two buttons)
            const todoDiv = document.createElement('div');
            todoDiv.classList.add('todo');
            todoDiv.setAttribute('id', todo);
            //create li
            const newTodo = document.createElement('li');
            newTodo.innerText = todo; //take todos from local storage
            newTodo.classList.add('todo-item');
            todoDiv.appendChild(newTodo); //putting li inside div
            //create buttons
            //options button
            const optionsButton = document.createElement('button');
            optionsButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
            optionsButton.classList.add('options-btn');
            optionsButton.setAttribute('id', todo + '-op'); //selector that points to the popup we want to open
            todoDiv.appendChild(optionsButton);
            //completed button
            const completedButton = document.createElement('button');
            completedButton.innerHTML = '<i class="fas fa-check"></i>';
            completedButton.classList.add('complete-btn');
            todoDiv.appendChild(completedButton);
            //trash button
            const trashButton = document.createElement('button');
            trashButton.innerHTML = '<i class="fas fa-trash"></i>';
            trashButton.classList.add('trash-btn');
            todoDiv.appendChild(trashButton);
            //create popup
            const popup = document.createElement('div');
            popup.classList.add('popup-div');
            const popupHeader = document.createElement('div');
            popupHeader.classList.add('popup-header-div');
            const popupTitle = document.createElement('p');
            popupTitle.innerText = todo;
            popupHeader.appendChild(popupTitle);
            const popupExitButton = document.createElement('button');
            popupExitButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            const exitITag = popupExitButton.innerHTML;
            popupExitButton.classList.add('popup-exit-btn');
            popupExitButton.addEventListener('click', (e) => {
                const item = e.target;
                const div = item.closest('.popup-div'); //from X to closest popup div
                div.classList.toggle('popup-active');
            })
            popupHeader.appendChild(popupExitButton);
            popup.appendChild(popupHeader);
            const popupNote = document.createElement('div');
            popupNote.classList.add('popup-note-div');

            const noteTitleDiv = document.createElement('div');
            noteTitleDiv.classList.add('note-title-div');

            const popupNoteTitle = document.createElement('p');
            popupNoteTitle.innerText = 'Note';
            noteTitleDiv.appendChild(popupNoteTitle);

            //saving note
            const saveButton = document.createElement('button');
            saveButton.innerText = 'save';
            //saved icon
            const savedIcon = document.createElement('i');
            savedIcon.setAttribute('class', 'fa-solid fa-check saved-icon');
            saveButton.onclick = function () {
                localStorage.setItem(noteKey, JSON.stringify(popupNoteInput.value));

                //saved notification
                savedIcon.classList.add('active');
                setTimeout(() => savedIcon.classList.remove('active'), 5000);
            };
            noteTitleDiv.appendChild(saveButton);
            noteTitleDiv.appendChild(savedIcon);
            popupNote.appendChild(noteTitleDiv);

            const popupNoteInput = document.createElement('textarea');
            popupNoteInput.classList.add('popup-note-input');
            popupNoteInput.setAttribute('id', 'input-window');
            popupNoteInput.setAttribute('type', 'text');
            popupNoteInput.setAttribute('placeholder', 'Type your note here');
            popupNote.appendChild(popupNoteInput);
            popup.appendChild(popupNote);
            todoDiv.appendChild(popup);

            //append div to the upper ul
            todoList.appendChild(todoDiv);

            //loading note
            const noteKey = `${todo}-key`;
            if (localStorage.getItem(noteKey) === null) {
                noteValue = '';
            } else {
                noteValue = JSON.parse(localStorage.getItem(noteKey));
            }
            popupNoteInput.value = noteValue;
        }
    })
}

function removeLocalTodos(todo) {
    let todos;
    let todosCompleted;
    let todosUncompleted;
    //check if there's something in local storage
    if (localStorage.getItem('todosAll') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todosAll'));
    }
    const todoText = todo.children[0].innerText; //getting text of clicked item
    todos.splice(todos.indexOf(todoText), 1); //removing item from array
    localStorage.setItem("todosAll", JSON.stringify(todos)); //setting changed array back to local storage

    todosCompleted = JSON.parse(localStorage.getItem('todosCompleted'));
    todosUncompleted = JSON.parse(localStorage.getItem('todosUncompleted'));
    //removing from completed or uncompleted
    if (todosCompleted.includes(todoText)) {
        todosCompleted.splice(todosCompleted.indexOf(todoText), 1);
    } else if (todosUncompleted.includes(todoText)) {
        todosUncompleted.splice(todosUncompleted.indexOf(todoText), 1);
    }
    localStorage.setItem('todosCompleted', JSON.stringify(todosCompleted));
    localStorage.setItem('todosUncompleted', JSON.stringify(todosUncompleted));

    //removing note
    const todoId = todo.getAttribute('id');
    const noteKey = `${todoId}-key`;
    localStorage.removeItem(noteKey);

}