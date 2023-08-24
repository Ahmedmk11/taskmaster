// --------------------------------------------------------------
// Card react component.
// --------------------------------------------------------------

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Space, Input, DatePicker, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { DatePickerProps } from 'antd'
import { format, set } from 'date-fns'

const { Option } = Select

import settingsIcn from '../../assets/icons/settings.svg'
import dateIcn from '../../assets/icons/date.svg'
import { Task } from '../../app/Task'
import { User } from '../../app/User'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
    addNewTaskToCurrentUser,
    readUserDataFromDb,
    updateCurrentUserDocument,
    updateTaskCategories,
} from '../../firebase'

import todoIcn from '../../assets/icons/todo.svg'
import inprogressIcn from '../../assets/icons/inprogress.svg'
import doneIcn from '../../assets/icons/done.svg'

type CardProps = {
    type: string
    task: Task | any
}

function Card(props: CardProps) {
    const { type, task } = props
    let id, title, desc, categories, dueDate, priority, status
    if (task) {
        ;({ id, title, desc, categories, dueDate, priority, status } = task)
    } else {
        id = ''
        title = ''
        desc = ''
        categories = []
        dueDate = ''
        priority = ''
        status = ''
    }

    const [user, setUser] = useState(null as unknown as User)
    const tasks = user ? user.taskArray : []
    const [userCategories, setUserCategories] = useState<string[]>([])
    const [userUID, setUserUID] = useState('')

    const [idState, setIdState] = useState<string>(id)
    const [titleState, setTitleState] = useState<string>(title)
    const [descState, setDescState] = useState<string>(desc)
    const [selectedCategories, setSelectedCategories] =
        useState<string[]>(categories)
    const [dueDateState, setDueDateState] = useState<any>(dueDate)
    const [priorityState, setPriorityState] = useState<string>(priority)
    const [statusState, setStatusState] = useState<string>(status)

    const [priorityInput, setPriorityInput] = useState('default')
    const [dateInput, setDateInput] = useState(null as any)
    const [inputValue, setInputValue] = useState('')

    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isEdit, setIsEdit] = useState(false)

    const TodoIcon = () => (
        <img style={{ width: 24, height: 24 }} src={todoIcn} />
    )
    const InprogressIcon = () => (
        <img style={{ width: 24, height: 24 }} src={inprogressIcn} />
    )
    const DoneIcon = () => (
        <img style={{ width: 24, height: 24 }} src={doneIcn} />
    )

    async function fetchUserData() {
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await readUserDataFromDb(
                    getAuth().currentUser!.uid
                )
                setUserUID(getAuth().currentUser!.uid)
                setUser(userData!)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        try {
            console.log('userCategories before update', userCategories)
            updateCurrentUserDocument('categories', userCategories)
        } catch (error) {
            console.log(error)
        }
    }, [userCategories])

    useEffect(() => {
        try {
            updateTaskCategories(idState, selectedCategories)
        } catch (error) {
            console.log(error)
        }
        console.log('selectedCategories', selectedCategories)
    }, [selectedCategories])

    useEffect(() => {
        async function fetchData() {
            await fetchUserData()
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (user) {
            setUserCategories(user?.categories)
        }
        let a = document.getElementsByTagName('textarea')
        for (var i = 0, inb = a.length; i < inb; i++) {
            if (a[i].getAttribute('data-resizable') == 'true')
                resizeTextarea(a[i].id)
        }
    }, [user])

    const onDateInput: DatePickerProps['onChange'] = (value) => {
        setDateInput(value)
    }

    function formatDate(date: any) {
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }
        return new Intl.DateTimeFormat('en-GB', options).format(date)
    }

    // if (isLoading) {
    //     return <div>Loading...</div>
    // }

    function saveCard(ev: any) {
        const title = document.getElementById(
            'text-area-title'
        ) as HTMLTextAreaElement
        const desc = document.getElementById(
            'text-area-desc'
        ) as HTMLTextAreaElement
        const date = new Date(dateInput)
        const formattedDate = format(date, 'dd MMMM yyyy')
        let flag = false
        if (title.value === '') {
            title.classList.add('error')
            flag = true
        }
        if (desc.value === '') {
            desc.classList.add('error')
            flag = true
        }
        if (formattedDate === null) {
            const date = document.getElementById('date-picker-ad')
            date!.classList.add('error')
            flag = true
        }
        if (priorityInput === null) {
            setPriorityInput('default')
        }
        if (flag) {
            return
        }
        console.log('date', date)
        console.log('priority', priorityInput)
        const newTask = new Task(
            `${tasks.length}`,
            title.value,
            desc.value,
            priorityInput,
            date
        )
        newTask.updateCategories(selectedCategories)
        addNewTaskToCurrentUser(newTask)
        Array.prototype.push.apply(userCategories, selectedCategories)
        cancelCard(ev)
    }

    function cancelCard(ev: any) {
        const container = ev.target.closest('#create-new-task')
        container.classList.remove('show-pop')
        container.classList.add('hide-pop')
        setTimeout(() => {
            container!.remove()
        }, 300)
    }

    function editCard(ev: any) {
        setIsEdit(true)
    }

    const expand = () => {
        setIsExpanded(!isExpanded)
        document.addEventListener('click', (ev: any) => {
            if (!ev.target.closest('.card')) {
                setIsExpanded(false)
            }
        })
    }

    function resizeTextarea(id: string) {
        var a = document.getElementById(id)
        a!.style.height = 'auto'
        a!.style.height = a!.scrollHeight + 'px'
    }

    function handleSelectChange(value: any, option: any): void {
        setSelectedCategories(value)
    }

    const handlePriorityChange = (value: any) => {
        const input = document.getElementsByClassName('card-input')[0]
        const saveBtn = document.getElementById('save-input-btn')
        input.classList.remove(
            'default-priority',
            'low-priority',
            'medium-priority',
            'high-priority'
        )
        saveBtn!.classList.remove(
            'default-priority-btn',
            'low-priority-btn',
            'medium-priority-btn',
            'high-priority-btn'
        )
        switch (value) {
            case 'default':
                input.classList.add('default-priority')
                saveBtn!.classList.add('default-priority-btn')
                break
            case 'low':
                input.classList.add('low-priority')
                saveBtn!.classList.add('low-priority-btn')
                break
            case 'medium':
                input.classList.add('medium-priority')
                saveBtn!.classList.add('medium-priority-btn')
                break
            case 'high':
                input.classList.add('high-priority')
                saveBtn!.classList.add('high-priority-btn')
                break
            default:
                console.log('default')
                break
        }

        setPriorityInput(value)
    }

    function handleCreateOption(value: string) {
        if (typeof value === 'string') {
            console.log('Created new user category:', value)
            setSelectedCategories([...selectedCategories, value])
            setUserCategories([...userCategories, value])
        }
    }

    const handleDropdownRender = (menu: any) => (
        <div>
            {menu}
            {type !== 'task' && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 8,
                    }}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={(e) => {
                            e.preventDefault()
                            handleCreateOption(inputValue)
                            setInputValue('')
                        }}
                        style={{ flex: 'auto' }}
                        placeholder="Enter new option"
                    />

                    <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            handleCreateOption(inputValue)
                            setInputValue('')
                        }}
                    />
                </div>
            )}
        </div>
    )

    return (
        <div
            className={isExpanded ? 'card expanded' : 'card'}
            id={type !== 'task' ? '' : id}
        >
            <div
                className={
                    type !== 'task'
                        ? 'card-container card-input'
                        : `card-container ${priority}-priority`
                }
            >
                <div className="card-info-settings">
                    {
                        <div className="card-categories">
                            {type !== 'task' ? (
                                <Select
                                    className="category-input"
                                    mode="multiple"
                                    placeholder="Select categories"
                                    onChange={handleSelectChange}
                                    dropdownRender={handleDropdownRender}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                        }
                                    }}
                                >
                                    {userCategories.map(
                                        (
                                            category // here
                                        ) => (
                                            <Option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </Option>
                                        )
                                    )}
                                </Select>
                            ) : (
                                categories.map((category: any) => (
                                    <div
                                        className="category no-pointer"
                                        key={category}
                                    >
                                        {category}
                                    </div>
                                ))
                            )}
                        </div>
                    }
                    <div className="card-settings">
                        {type !== 'task' ? null : (
                            <img src={settingsIcn} alt="Icon for settings" />
                        )}
                    </div>
                </div>
                <div className="card-body">
                    <div
                        className={
                            type !== 'task'
                                ? 'popup-newtask-title card-title'
                                : 'card-title'
                        }
                    >
                        {type !== 'task' ? (
                            <textarea
                                rows={1}
                                id="text-area-title"
                                className="textarea-new-task-title text-area-title"
                                placeholder="Title"
                                onKeyUp={resizeTextarea.bind(
                                    null,
                                    'text-area-title'
                                )}
                                data-resizable="true"
                                maxLength={50}
                            />
                        ) : (
                            title
                        )}
                    </div>
                    {type !== 'task' ? (
                        <div className="card-description">
                            <textarea
                                id="text-area-desc"
                                className="textarea-new-task-desc text-area-new-desc"
                                placeholder="Description"
                                onKeyUp={resizeTextarea.bind(
                                    null,
                                    'text-area-desc'
                                )}
                                data-resizable="true"
                            />
                        </div>
                    ) : (
                        <div className="card-description">{desc}</div>
                    )}
                </div>
                <div className="card-bottom">
                    {type !== 'task' ? (
                        <Space className="card-bottom-space">
                            <Space direction="vertical">
                                <DatePicker
                                    id="date-picker-ad"
                                    onChange={onDateInput}
                                    placeholder="Due date"
                                    style={{ width: 140 }}
                                />
                            </Space>
                            <Select
                                id="select-ad"
                                placeholder="Priority"
                                onChange={handlePriorityChange}
                                style={{ width: 140 }}
                            >
                                <Option value="default">Default</Option>
                                <Option value="low">Low</Option>
                                <Option value="medium">Medium</Option>
                                <Option value="high">High</Option>
                            </Select>
                        </Space>
                    ) : (
                        <div className="border">
                            <img src={dateIcn} alt="date icon" />
                            <p>
                                Due to: <span>{formatDate(dueDate)}</span>
                            </p>
                        </div>
                    )}
                </div>
                <div className="card-bottom-bottom">
                    {type !== 'task' ? (
                        <Space wrap>
                            <Button
                                onClick={(e) => {
                                    cancelCard(e)
                                }}
                                danger
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={(e) => {
                                    saveCard(e)
                                }}
                                className="default-priority-btn"
                                id="save-input-btn"
                            >
                                Save
                            </Button>
                        </Space>
                    ) : (
                        <Space
                            className="read-more"
                            onClick={() => {
                                type !== 'task' ? null : expand()
                            }}
                            wrap
                        >
                            {status === 'todo' ? (
                                <TodoIcon />
                            ) : status === 'inprogress' ? (
                                <InprogressIcon />
                            ) : (
                                <DoneIcon />
                            )}
                            <Button type="link">
                                {isExpanded ? 'Read less' : 'Read more'}
                            </Button>
                        </Space>
                    )}
                </div>
            </div>
        </div>
    )
}

Card.propTypes = {
    type: PropTypes.string,
    task: PropTypes.object as any,
}

Card.defaultProps = {
    type: 'task',
}

export default Card
