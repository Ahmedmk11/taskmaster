// --------------------------------------------------------------
// Home page frontend code.
// --------------------------------------------------------------

import React, { useEffect, useState, useContext } from 'react'
import NavBar from '../components/NavBar'
import ToolBar from '../components/ToolBar'
import ActionBar from '../components/ActionBar'
import Filter from '../components/Filter'
import Card from '../components/Card'
import ReactDOM from 'react-dom'
import { useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import { User } from '../../app/User'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
    readUserDataFromDb,
    db,
    updateCurrentUserTasksDocument,
    updateTaskStatus,
    updateTasksOrder,
    updateCurrentUserDocument,
} from '../../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { Task } from '../../app/Task'
import { hydrateRoot } from 'react-dom/client'
import { Skeleton } from 'antd'
import { parseDateFromString } from '../../app/Functions'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

function Home() {
    const [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const [isCol1Input, setIsCol1Input] = useState(false)
    const [isCol2Input, setIsCol2Input] = useState(false)
    const [isCol3Input, setIsCol3Input] = useState(false)

    const [appliedFilters, setAppliedFilters] = useState({
        categoryFilter: null as string[] | null,
        dateFilter: null as Date[] | null,
        priorityFilter: null as string[] | null,
    })

    const [tasks, setTasks] = useState<any>([])

    const [columns, setColumns] = useState<any>({
        todo: [],
        inprogress: [],
        done: [],
    })

    const location = useLocation()

    async function fetchUserData() {
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await readUserDataFromDb(
                    getAuth().currentUser!.uid
                )
                console.log(userData)
                setUser(userData!)
                setIsLoading(false)
                setTasks(userData!.taskArray)
                setColumns(userData!.columns)
            }
        })
    }

    useEffect(() => {
        updateFilteredTasks()
    }, [appliedFilters])

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (
                    Array.from(mutation.removedNodes).some(
                        (node) =>
                            node instanceof HTMLElement &&
                            node.id === 'create-new-task'
                    )
                ) {
                    setIsCol1Input(false)
                    setIsCol2Input(false)
                    setIsCol3Input(false)
                } else if (
                    Array.from(mutation.addedNodes).some(
                        (node) =>
                            node instanceof HTMLElement &&
                            node.id === 'create-new-task'
                    )
                ) {
                    setIsCol1Input(true)
                    setIsCol2Input(false)
                    setIsCol3Input(false)
                }
            }
        }
    })

    useEffect(() => {
        async function fetchData() {
            await fetchUserData()
        }

        fetchData()
        const config = { childList: true, subtree: true }
        observer.observe(document.body, config)
    }, [])

    useEffect(() => {
        if (location.state?.createCardPop) {
            createCardPop()
        }
    }, [location])

    const handleFiltersUpdate = (filters: any) => {
        setAppliedFilters(filters)
    }

    function updateFilteredTasks() {
        try {
            const cols = tasks.filter((task: any) => {
                const dueDate = parseDateFromString(task.dueDate)

                let dueDateDay
                let dueDateMonth
                let dueDateYear
                let startDay
                let startMonth
                let startYear
                let endDay
                let endMonth
                let endYear

                if (appliedFilters.dateFilter?.length !== 0) {
                    const dueDate = parseDateFromString(task.dueDate)
                    const startDate = appliedFilters.dateFilter![0]
                    const endDate = appliedFilters.dateFilter![1]

                    dueDateDay = dueDate.getDate()
                    dueDateMonth = dueDate.getMonth()
                    dueDateYear = dueDate.getFullYear()

                    startDay = startDate.getDate()
                    startMonth = startDate.getMonth()
                    startYear = startDate.getFullYear()

                    endDay = endDate.getDate()
                    endMonth = endDate.getMonth()
                    endYear = endDate.getFullYear()
                }

                const isCategoryFiltered =
                    appliedFilters.categoryFilter!.length === 0 ||
                    task.categories.some((category: string) =>
                        appliedFilters.categoryFilter!.includes(category)
                    )

                const isDateFiltered =
                    appliedFilters.dateFilter!.length === 0 ||
                    !appliedFilters.dateFilter ||
                    appliedFilters.dateFilter.length === 0 ||
                    ((dueDateYear! > startYear! ||
                        (dueDateYear! === startYear! &&
                            (dueDateMonth! > startMonth! ||
                                (dueDateMonth! === startMonth! &&
                                    dueDateDay! >= startDay!)))) &&
                        (dueDateYear! < endYear! ||
                            (dueDateYear! === endYear! &&
                                (dueDateMonth! < endMonth! ||
                                    (dueDateMonth! === endMonth! &&
                                        dueDateDay! <= endDay!)))))

                const isPriorityFiltered =
                    appliedFilters.priorityFilter!.length === 0 ||
                    appliedFilters.priorityFilter!.includes(
                        task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)
                    )

                return (
                    (!appliedFilters.categoryFilter ||
                        appliedFilters.categoryFilter.length === 0 ||
                        isCategoryFiltered) &&
                    isDateFiltered &&
                    (!appliedFilters.priorityFilter ||
                        appliedFilters.priorityFilter.length === 0 ||
                        isPriorityFiltered)
                )
            })
            setColumns({
                todo: cols.filter((task: any) => task.status === 'todo'),
                inprogress: cols.filter(
                    (task: any) => task.status === 'inprogress'
                ),
                done: cols.filter((task: any) => task.status === 'done'),
            })
        } catch (error) {}
    }

    function createCardPop(col = 'col-1') {
        const colEl = document.getElementById(col)
        const cardsDiv = colEl?.querySelector('.cards')
        cardsDiv?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
        const chk = document.getElementById('create-new-task')
        if (chk) {
            if (chk.closest('#' + col)) {
                return
            } else {
                chk?.remove()
            }
        }
        const container = document.createElement('div')
        container.id = 'create-new-task'
        ReactDOM.render(<Card type="create" />, container)
        const cards = colEl!.querySelector('.cards')
        cards!.insertBefore(container, cards!.childNodes[0])
        container.classList.add('show-pop')
    }

    const showFilters = () => {
        document
            .getElementById('filters-container')
            ?.classList.toggle('show-filters')
        document
            .getElementById('filters-container')
            ?.classList.toggle('hide-filters')
        document
            .getElementById('filters-button-ab')
            ?.classList.toggle('filters-active')
    }

    useEffect(() => {
        if (columns.todo.length == 0) {
            let cardsDiv = document.getElementById('col-1')?.closest('.cards')
            let newDiv = document.createElement('div')
            newDiv.id = 'col1-msg'
            newDiv.textContent =
                'No tasks to do right now. Add some tasks to get started!'
            cardsDiv?.appendChild(newDiv)
        }

        if (columns.inprogress.length == 0) {
            // <p id="col2-msg">
            //     No tasks in progress at the moment. Keep up the great work!
            // </p>
        }

        if (columns.done.length == 0) {
            // <p id="col3-msg">
            //      Congratulations! You've completed all your tasks.
            // </p>
        }
    }, [columns])

    const handleDragEnd = async (result: any) => {
        if (!result.destination) {
            return
        }

        const updatedFilteredTasks1 = Array.from(columns.todo)
        const updatedFilteredTasks2 = Array.from(columns.inprogress)
        const updatedFilteredTasks3 = Array.from(columns.done)
        let draggedItem
        switch (result.source.droppableId) {
            case 'todo':
                ;[draggedItem] = updatedFilteredTasks1.splice(
                    result.source.index,
                    1
                )
                break

            case 'inprogress':
                ;[draggedItem] = updatedFilteredTasks2.splice(
                    result.source.index,
                    1
                )
                break

            case 'done':
                ;[draggedItem] = updatedFilteredTasks3.splice(
                    result.source.index,
                    1
                )
                break

            default:
                break
        }
        switch (result.destination.droppableId) {
            case 'todo':
                updatedFilteredTasks1.splice(
                    result.destination.index,
                    0,
                    draggedItem
                )
                break

            case 'inprogress':
                updatedFilteredTasks2.splice(
                    result.destination.index,
                    0,
                    draggedItem
                )
                break

            case 'done':
                updatedFilteredTasks3.splice(
                    result.destination.index,
                    0,
                    draggedItem
                )
                break

            default:
                break
        }

        type TaskType = {
            id: string
            status: string
        }

        if (draggedItem) {
            const updatedDraggedItem = draggedItem as TaskType
            updatedDraggedItem.status = result.destination.droppableId

            await updateTaskStatus(
                updatedDraggedItem.id,
                result.destination.droppableId
            )
        }

        setColumns({
            todo: updatedFilteredTasks1,
            inprogress: updatedFilteredTasks2,
            done: updatedFilteredTasks3,
        })

        updateCurrentUserDocument(
            'columns',
            {
                todo: updatedFilteredTasks1,
                inprogress: updatedFilteredTasks2,
                done: updatedFilteredTasks3,
            },
            true
        )
    }

    return (
        <div id="home-body">
            <ToolBar loading={isLoading ? true : false} />
            <div id="home-content">
                <NavBar currentPage={'home'} />
                <div id="home-main">
                    <ActionBar
                        handleCreate={createCardPop}
                        handleFilters={showFilters}
                    />
                    <div id="home-main-content">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div id="columns-container">
                                <Filter
                                    hideFilters={showFilters}
                                    handleFiltersUpdate={handleFiltersUpdate}
                                />
                                <div id="col-1" className="column">
                                    <div className="cards-status">
                                        <p>Todo</p>
                                    </div>
                                    <Droppable
                                        droppableId="todo"
                                        direction="vertical"
                                    >
                                        {(provided) => (
                                            <div
                                                className="cards"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                    </>
                                                ) : columns.todo.filter(
                                                      (t: any) =>
                                                          t.status == 'todo'
                                                  ).length == 0 &&
                                                  !isCol1Input ? (
                                                    <p id="col1-msg">
                                                        No tasks to do right
                                                        now. Add some tasks to
                                                        get started!
                                                    </p>
                                                ) : (
                                                    columns.todo.map(
                                                        (
                                                            task: any,
                                                            index: any
                                                        ) => (
                                                            <Draggable
                                                                key={`card-container-${task.id}`}
                                                                draggableId={`card-container-${task.id}`}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="draggable-card"
                                                                        id={`card-container-${task.id}`}
                                                                        key={
                                                                            task.id
                                                                        }
                                                                    >
                                                                        <Card
                                                                            task={
                                                                                task
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>

                                <div id="col-2" className="column">
                                    <div className="cards-status">
                                        <p>In Progress</p>
                                    </div>
                                    <Droppable
                                        droppableId="inprogress"
                                        direction="vertical"
                                    >
                                        {(provided) => (
                                            <div
                                                className="cards"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                    </>
                                                ) : columns.inprogress.filter(
                                                      (t: any) =>
                                                          t.status ==
                                                          'inprogress'
                                                  ).length == 0 &&
                                                  !isCol2Input ? (
                                                    <p id="col2-msg">
                                                        No tasks in progress at
                                                        the moment. Keep up the
                                                        great work!
                                                    </p>
                                                ) : (
                                                    columns.inprogress.map(
                                                        (
                                                            task: any,
                                                            index: any
                                                        ) => (
                                                            <Draggable
                                                                key={`card-container-${task.id}`}
                                                                draggableId={`card-container-${task.id}`}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="draggable-card"
                                                                        id={`card-container-${task.id}`}
                                                                        key={
                                                                            task.id
                                                                        }
                                                                    >
                                                                        <Card
                                                                            task={
                                                                                task
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>

                                <div id="col-3" className="column">
                                    <div className="cards-status">
                                        <p>Done</p>
                                    </div>
                                    <Droppable
                                        droppableId="done"
                                        direction="vertical"
                                    >
                                        {(provided) => (
                                            <div
                                                className="cards"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                        <Skeleton active />
                                                    </>
                                                ) : columns.done.filter(
                                                      (t: any) =>
                                                          t.status == 'done'
                                                  ).length == 0 &&
                                                  !isCol3Input ? (
                                                    <p id="col3-msg">
                                                        Congratulations! You've
                                                        completed all your
                                                        tasks.
                                                    </p>
                                                ) : (
                                                    columns.done.map(
                                                        (
                                                            task: any,
                                                            index: any
                                                        ) => (
                                                            <Draggable
                                                                key={`card-container-${task.id}`}
                                                                draggableId={`card-container-${task.id}`}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="draggable-card"
                                                                        id={`card-container-${task.id}`}
                                                                        key={
                                                                            task.id
                                                                        }
                                                                    >
                                                                        <Card
                                                                            task={
                                                                                task
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home
