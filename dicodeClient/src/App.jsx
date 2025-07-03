import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Layout from './component/Layout'
import Register from './pages/Register'
import Space from './pages/Space'
import Rooms from './component/Rooms'
import roomsLoader from './loaders/roomsLoader'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/space' element={<Space />} >
          <Route index element={<Navigate to="rooms" replace />} />

          <Route path='rooms' loader={roomsLoader} element={<Rooms />} />

        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
