// --------------------------------------------------------------
// Home page frontend code.
// --------------------------------------------------------------

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import NavBar from '../components/NavBar'
import ToolBar from '../components/ToolBar'
import ActionBar from '../components/ActionBar'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import { Task } from '../../app/Task'
import Filter from '../components/Filter'
import { User } from '../../app/User'
import { getAuth } from 'firebase/auth'
import { readUserDataFromDb } from '../../firebase'

function Search() {
    const [isVisible, setIsVisible] = useState(false)
    const [searchParams] = useSearchParams()
    const query = searchParams.get('query')

    const [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)
    const tasks = user ? user.taskArray : []
    const currentUser = getAuth().currentUser

    async function fetchUserData() {
        const userData = await readUserDataFromDb(currentUser!.uid)
        setUser(userData!)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    if (isLoading) {
        return <div>Loading...</div>
    }

    useEffect(() => {
        document
            .getElementById('filters-container')
            ?.classList.add('visibility-hidden')
    }, [])

    const getSearchResults = (tasks: Task[]) => {
        return tasks.filter((task) => {
            const titleMatch = task.title
                .toLowerCase()
                .includes(query!.toLowerCase())
            const descMatch = task.desc
                .toLowerCase()
                .includes(query!.toLowerCase())
            const categoriesMatch = task.categories.some((category) =>
                category.toLowerCase().includes(query!.toLowerCase())
            )
            return titleMatch || descMatch || categoriesMatch
        })
    }

    const showFilters = () => {
        setIsVisible(true)
        document
            .getElementById('filters-container')
            ?.classList.remove('visibility-hidden')
    }

    const hideFilters = () => {
        setIsVisible(false)
        setTimeout(() => {
            document
                .getElementById('filters-container')
                ?.classList.add('visibility-hidden')
        }, 300)
    }

    return (
        <div id="search-body">
            <ToolBar user={user} />
            <div id="search-content">
                <NavBar />
                <div id="search-main">
                    <ActionBar
                        isHideButton={true}
                        isDisabled={
                            getSearchResults(tasks).length === 0 ? true : false
                        }
                        handleFilters={showFilters}
                        title={`${
                            getSearchResults(tasks).length === 0
                                ? 'No results found'
                                : `Found ${
                                      getSearchResults(tasks).length
                                  } result${
                                      getSearchResults(tasks).length === 1
                                          ? ''
                                          : 's'
                                  }`
                        } for "${query}"`}
                    />
                    <div
                        id="search-main-content"
                        className={
                            isVisible
                                ? 'show-filter-container-srch'
                                : 'hide-filter-container-srch'
                        }
                    >
                        <Filter
                            className={isVisible ? '' : 'hide-filters'}
                            hideFilters={hideFilters}
                            categories={user!.categories}
                        />
                        <div id="result-items">
                            {getSearchResults(tasks)!.map((task) => (
                                <Card task={task} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Search
