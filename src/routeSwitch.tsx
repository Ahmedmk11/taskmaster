// eslint-disable-next-line no-unused-vars
import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './views/pages/Home'
import Login from './views/pages/LoginPage'
import Register from './views/pages/RegisterPage'
import Placeholder from './views/pages/Placeholder'
import NotFound from './views/pages/NotFound'

const RouteSwitch = () => {
    return (
        <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" />
            <Route path="inprogress" element={<Home status={'inprogress'} />} />
            <Route path="todo" element={<Home status={'todo'} />} />
            <Route path="completed" element={<Home status={'completed'} />} />
            <Route path="pending" element={<Home status={'pending'} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/placeholder" element={<Placeholder />} />
        </Routes>
    )
}

export default RouteSwitch