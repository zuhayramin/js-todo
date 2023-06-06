const listsContainer = document.querySelector("[data-lists]")

const newListForm = document.querySelector("[data-new-list-form]")

const newListInput = document.querySelector("[data-new-list-input]")

const deleteListBtn = document.querySelector("[data-delete-list-button]")

const listDisplayContainer = document.querySelector("[data-list-display-container]")
const listTitleElement = document.querySelector("[data-list-title]")
const listCountElement = document.querySelector("[data-list-count]")
const tasksContainer = document.querySelector("[data-tasks]")

const taskTemplate = document.getElementById("task-template")

const newTaskForm = document.querySelector("[data-new-task-form]")

const newTaskInput = document.querySelector("[data-new-task-input]")

const clearCompletedTaskBtn = document.querySelector("[data-clear-completed-task-button]")
// This prevents you and other websites from overwriting information already in the local storage
const LOCAL_STORAGE_LIST_KEY = 'tasks.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'tasks.selectedListId'

// This returns the previous lists if they exist, otherwise you get an empty set of lists
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []

let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

listsContainer.addEventListener('click', e => {
	if(e.target.tagName.toLowerCase() === 'li'){
		selectedListId = e.target.dataset.listId
		saveAndRender()
	}
})

tasksContainer.addEventListener('click', e => {
	if(e.target.tagName.toLowerCase() === 'input'){
		const selectedList = lists.find(list => list.id === selectedListId)
		const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
		selectedTask.complete = e.target.checked
		save()
		renderTaskCount(selectedList )
	}
})

newListForm.addEventListener('submit', e => {
	// This is to prevent the page from refreshing every time we add a new list
	e.preventDefault()

	const listName = newListInput.value
	
	if (listName == null || listName === '') return

	const list = createList(listName)
	newListInput.value = null
	lists.push(list)
	saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
	// This is to prevent the page from refreshing every time we add a new list
	e.preventDefault()

	const taskName = newTaskInput.value
	
	if (taskName == null || taskName === '') return

	const task = createTask(taskName)
	newTaskInput.value = null
	const selectedList = lists.find(list => list.id === selectedListId)
	selectedList.tasks.push(task)
	saveAndRender()
})

clearCompletedTaskBtn.addEventListener('click', e => {
	const selectedList = lists.find(list => list.id === selectedListId)
	selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
	saveAndRender()
})

function createList(name){
	return {
		id: Date.now().toString(),
		name: name,
		tasks: []
	}
}

function createTask(name){
	return {
		id: Date.now().toString(),
		name: name,
		complete: false
	}
}

deleteListBtn.addEventListener('click', e => {
	lists = lists.filter(list => list.id !== selectedListId)

	selectedListId = null

	saveAndRender()
})

function render(){
	clearElement(listsContainer)
	renderList()

	const selectedList = lists.find(list => list.id === selectedListId)

	if(selectedListId === null){
		listDisplayContainer.style.display = 'none'
	} else {
		listDisplayContainer.style.display = ''
		listTitleElement.innerText = selectedList.name
		renderTaskCount(selectedList)
	}
}

function renderTaskCount(selectedList){
	const incompleteTasks = selectedList.tasks.filter(task => !task.complete).length
	const taskString = incompleteTasks === 1? 'task':'tasks'
	listCountElement.innerText = `${incompleteTasks} ${taskString} remaining`

	clearElement(tasksContainer)
	renderTasks(selectedList)
}

function renderTasks(selectedList) {
	selectedList.tasks.forEach(task => {
		// If we don't include true in the importNode, then we will only get the top div and none of the child elements
		 const taskElement = document.importNode(taskTemplate.content, true)
		 const checkbox = taskElement.querySelector('input')
		 checkbox.id = task.id
		 checkbox.checked = task.complete

		 const label = taskElement.querySelector('label')
		 label.htmlFor = task.id
		 label.append(task.name)

		 const updateButton = taskElement.querySelector('.update-button');
		 updateButton.addEventListener('click', e => {
		// Remove the task from the list
		//updateTask(task.id, e);
			const taskElement = e.target.parentElement;
			const taskName = taskElement.querySelector('label').innerText;
			const taskId = task.id
			const selectedList = lists.find(list => list.id === selectedListId)
			newTaskInput.value = taskName;
			selectedList.tasks = selectedList.tasks.filter((task) => task.id !== taskId);
			saveAndRender();
		});

		 tasksContainer.appendChild(taskElement)

		//  ,
	})
}  

function renderList(){
	lists.forEach(list => {
		const listElement = document.createElement('li')
		listElement.dataset.listId = list.id
		listElement.classList.add('list-name')
		listElement.innerText = list.name
		if(list.id === selectedListId) {
			listElement.classList.add('active-list')
		}
		listsContainer.appendChild(listElement )
	})
}

function save(){
	localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))

	localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function saveAndRender(){
	save()
	render()
}

function clearElement(element){
	while(element.firstChild){
		element.removeChild(element.firstChild )
	}
}

render()