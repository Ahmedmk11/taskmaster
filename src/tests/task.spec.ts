import { Task } from '../app/Task'

describe('Task', () => {
    let task: Task

    beforeEach(() => {
        task = new Task(
            '0',
            'Task 1',
            'Description',
            'low',
            new Date('2023-08-08')
        )
    })

    it('should update task title', () => {
        task.updateTitle('New Title')
        expect(task.title).toBe('New Title')
    })

    it('should update task description', () => {
        task.updateDesc('New Description')
        expect(task.desc).toBe('New Description')
    })

    it('should update task priority', () => {
        task.updatePriority('high')
        expect(task.priority).toBe('high')
    })

    it('should update task dueDate date', () => {
        const newdueDateDate = new Date('2023-09-09')
        task.updatedueDate(newdueDateDate)
        expect(task.dueDate).toEqual(newdueDateDate)
    })

    it('should update task categories', () => {
        const newCategories = ['Main', 'Secondary']
        task.updateCategories(newCategories)
        expect(task.categories).toEqual(newCategories)
    })

    it('should update task status', () => {
        task.updateStatus('done')
        expect(task.status).toBe('done')
    })
})
