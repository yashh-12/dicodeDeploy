import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useLoaderData, NavLink, useNavigate } from "react-router-dom";
import { createRoom, deleteRoom } from "../service/room.service";
import { FaTrashAlt } from "react-icons/fa";
import useUser from "../provider/UserProvider";

Modal.setAppElement("#root");

function Rooms() {
    const loaderData = useLoaderData() || {};
    const initialRooms = Array.isArray(loaderData.data) ? loaderData.data : [];
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [rooms, setRooms] = useState(initialRooms);

    useEffect(() => {
        setRooms(initialRooms);
    }, [initialRooms]);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setRoomName("");
        setModalIsOpen(false);
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        if (typeof createRoom !== "function" || !roomName.trim()) return;
        const res = await createRoom(roomName);
        if (res?.success && res.data) {
            setRooms((prev) => [...prev, res.data]);
        }
        closeModal();
    };

    const handleDeleteRoom = async (roomId) => {
        if (typeof deleteRoom !== "function" || !roomId) return;
        const res = await deleteRoom(roomId);
        if (res?.success) {
            setRooms((prev) => prev.filter((r) => r?._id !== roomId));
        }
    };



    return (
        <div className="p-6 text-white flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-blue-400 drop-shadow-[0_0_8px_#3b82f6]">
                    Your Rooms
                </h1>
                <button
                    onClick={openModal}
                    className="relative px-6 py-2 rounded-full bg-[#0d0d0d] text-blue-300 border border-blue-500 font-medium shadow-[inset_0_0_0_1px_#3b82f680] transition-all duration-300 hover:shadow-[0_0_10px_#3b82f680]"
                >
                    + Add Room
                </button>
            </div>


            {rooms?.length === 0 ? (
                <div className="text-gray-400 text-center mt-16 italic text-lg animate-pulse">
                    No rooms yet — hit the “Add Room” button to get started!
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div
                            key={room?._id}
                            className="relative group p-4 rounded-2xl border border-blue-500/30 bg-[#0c0c0c] hover:border-blue-400/80 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_#3b82f640] flex flex-col gap-2"
                        >
                            <NavLink
                                to={`/room/${room?._id}`}
                                className="flex flex-col gap-1 group-hover:translate-x-1 transition"
                            >
                                <h2 className="text-lg font-semibold text-blue-200 truncate">
                                    {room?.name || "Unnamed Room"}
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Created by{" "}
                                    <span className="text-indigo-400 font-medium">
                                        {room?.creator?.username || "unknown"}
                                    </span>
                                </p>
                            </NavLink>

                            <button
                                onClick={() => handleDeleteRoom(room?._id)}
                                className="absolute top-2 right-3 text-blue-400 hover:text-red-400 hover:scale-110 transition text-xl font-bold"
                                title="Delete Room"
                            >
                                <FaTrashAlt
                                    className="text-blue-400 group-hover:text-red-400 transition"
                                    size={16}
                                />
                            </button>

                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400/0 group-hover:bg-blue-400/20 transition-all rounded-b-2xl" />
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add Room Modal"
                className="bg-transparent p-0 m-0 outline-none"
                overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
            >
                <div className="bg-[#101010] border border-blue-400/20 rounded-3xl p-6 w-[90%] sm:w-full max-w-md shadow-[0_0_40px_#3b82f6aa] text-white">
                    <h2 className="text-2xl font-semibold text-blue-300 mb-4">
                        Create a New Room
                    </h2>
                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e?.target?.value || "")}
                            placeholder="Enter room name"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:shadow-[0_0_12px_#888] transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-full bg-[#0d0d0d] text-blue-300 border border-blue-500 hover:shadow-[0_0_20px_#3b82f6] transition-all duration-300"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

export default Rooms;
