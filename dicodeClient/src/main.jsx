// main.jsx or index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from "react-router-dom";

import "./index.css";

import { UserProvider } from "./provider/UserProvider.jsx";

// Layouts and Pages
import Layout from "./component/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

import Space from "./pages/Space.jsx"
import Rooms from "./component/Rooms.jsx";
import roomsLoader from "./loaders/roomsLoader.js";
import layoutLoader from "./loaders/layoutLoader.js";
import Friends from "./component/Friends.jsx";
import { LoaderProvider } from "./provider/LoaderProvider.jsx";
import Room from "./pages/Room.jsx";
import roomLoader from "./loaders/roomLoader.js";
import friendLoader from "./loaders/friendsLoader.js";
import AddFriend from "./component/AddFriend.jsx";
import addFriendsLoader from "./loaders/add-friendsLoader.js";
import { SocketProvider } from "./provider/SocketProvider.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} loader={layoutLoader} >
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      <Route path="space" element={<Space />}>
        <Route index element={<Navigate to="rooms" replace />} />
        <Route path="rooms" element={<Rooms />} loader={roomsLoader} />
        <Route path="friends" loader={friendLoader} element={<Friends />} />
        <Route path="add-friend" loader={addFriendsLoader} element={<AddFriend />} />
      </Route>

      <Route path="room/:roomId" loader={roomLoader} element={<Room />} />


      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <LoaderProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </LoaderProvider>
  </SocketProvider>
);
