// --------------------------------------------------------------
// User class definition.
// --------------------------------------------------------------

import { Task } from './Task'

export class User {
    name: string
    email: string
    password: string
    taskArray: Task[]
    inOrderTasks: Task[]
    categories: string[]

    constructor(name: string, email: string, password: string) {
        this.name = name
        this.email = email
        this.password = password
        this.taskArray = []
        this.inOrderTasks = []
        this.categories = ['Main']
    }

    createTask(
        title: string,
        desc?: string,
        priority?: string,
        dueDate?: Date
    ): void
    createTask(task: Task): void
    createTask(
        titleOrTask: string | Task,
        desc?: string,
        priority?: string,
        dueDate?: Date
    ): void {
        if (titleOrTask instanceof Task) {
            this.taskArray.push(titleOrTask)
            this.inOrderTasks.push(titleOrTask)
        } else {
            const newTask = new Task(titleOrTask, desc!, priority!, dueDate!)
            this.taskArray.push(newTask)
            this.inOrderTasks.push(newTask)
        }
    }

    deleteTask(task: Task): void {
        const index = this.taskArray.indexOf(task)
        if (index > -1) {
            this.taskArray.splice(index, 1)
        }
        this.inOrderTasks.splice(this.inOrderTasks.indexOf(task), 1)
    }

    startTask(task: Task): void {
        task.startTask()
    }

    pauseTask(task: Task): void {
        task.pauseTask()
    }

    closeTask(task: Task): void {
        task.closeTask()
    }

    addCategory(category: string): void {
        this.categories.push(category)
    }

    sortTasksByCreation(isAscending: boolean): Task[] {
        return isAscending ? this.inOrderTasks : this.inOrderTasks.reverse()
    }

    sortTasksByTitle(tasks: Task[], isAscending: boolean): Task[] {
        if (isAscending) {
            return tasks.sort((a, b) => {
                if (a.title < b.title) {
                    return -1
                } else if (a.title > b.title) {
                    return 1
                }
                return 0
            })
        }
        return tasks.sort((a, b) => {
            if (a.title > b.title) {
                return -1
            } else if (a.title < b.title) {
                return 1
            }
            return 0
        })
    }

    sortTasksByPriority(tasks: Task[], isAscending: boolean): Task[] {
        if (isAscending) {
            return tasks.sort((a, b) => {
                if (a.priority === 'Low') {
                    return -1
                } else if (a.priority === 'Medium') {
                    if (b.priority === 'Low') {
                        return 1
                    } else {
                        return -1
                    }
                } else {
                    return 1
                }
            })
        }
        return tasks.sort((a, b) => {
            if (a.priority === 'High') {
                return -1
            } else if (a.priority === 'Medium') {
                if (b.priority === 'High') {
                    return 1
                } else {
                    return -1
                }
            } else {
                return 1
            }
        })
    }

    sortTasksByDueDate(tasks: Task[], isAscending: boolean): Task[] {
        if (isAscending) {
            return tasks.sort((a, b) => {
                if (a.dueDate < b.dueDate) {
                    return -1
                } else if (a.dueDate > b.dueDate) {
                    return 1
                }
                return 0
            })
        }
        return tasks.sort((a, b) => {
            if (a.dueDate > b.dueDate) {
                return -1
            } else if (a.dueDate < b.dueDate) {
                return 1
            }
            return 0
        })
    }

    filterTasksByPriority(tasks: Task[], priority: string): Task[] {
        return tasks.filter((task) => task.priority === priority)
    }

    filterTasksByDate(tasks: Task[], date: Date): Task[] {
        return tasks.filter((task) => task.dueDate.getTime() === date.getTime())
    }
}
