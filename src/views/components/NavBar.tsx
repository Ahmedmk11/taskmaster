import React, { useEffect, useRef, useState } from 'react'
import homeIcn from '../../assets/icons/home.svg'
import calendarIcn from '../../assets/icons/calendar.svg'
import categoryIcn from '../../assets/icons/category.svg'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

type NavBarProps = {
    currentPage: string
}

function NavBar(props: NavBarProps) {
    const { currentPage } = props
    const navigate = useNavigate()

    const classSelect = (page: string): string => {
        if (currentPage === page) {
            return 'nav-item selected-nav-item'
        }
        return 'nav-item'
    }

    return (
        <div id="nav-bar">
            <div id="nav-bar-top">
                <div
                    className={classSelect('home')}
                    onClick={() => {
                        navigate('/home')
                    }}
                >
                    <img src={homeIcn} alt="Icon for home page" />
                </div>
                <div
                    className={classSelect('calendar')}
                    onClick={() => {
                        navigate('/calendar')
                    }}
                >
                    <img src={calendarIcn} alt="Icon for calendar page" />
                </div>
                <div
                    className={classSelect('categories')}
                    onClick={() => {
                        navigate('/my-categories')
                    }}
                >
                    <img src={categoryIcn} alt="Icon for categories page" />
                </div>
            </div>
        </div>
    )
}

NavBar.propTypes = {
    currentPage: PropTypes.string,
}

NavBar.defaultProps = {
    currentPage: 'None',
}

export default NavBar
