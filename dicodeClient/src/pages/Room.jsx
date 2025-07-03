import React, { useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import useUser from '../provider/UserProvider';
import Editor from '../component/Editor';
import Canvas from '../component/Canvas';
import WaitingScreen from '../component/WaitingScreen';

function Room() {
  const { roomId } = useParams();
  const { userData } = useUser();
  const { data: roomDetails } = useLoaderData();

  const isMember = roomDetails.members.some(
    m => m.user._id === userData._id
  );

  const userRole = roomDetails.members.find(
    m => m.user._id === userData._id
  )?.role;

  const [activeTab, setActiveTab] = useState('editor');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4">

      {/* Header: Room name + Toggle buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-cyan-400 drop-shadow-[0_0_6px_#22d3ee]">
          Room: {roomDetails.name}
        </h1>

        {/* Toggle Buttons */}
        {isMember && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1 rounded-full border transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'editor'
                  ? 'border-cyan-400 text-cyan-300 shadow-[0_0_10px_#22d3ee]'
                  : 'border-gray-600 text-gray-400 hover:text-cyan-200 hover:border-cyan-400'
              }`}
            >
             Editor
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-4 py-1 rounded-full border transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'canvas'
                  ? 'border-indigo-400 text-indigo-300 shadow-[0_0_10px_#6366f1]'
                  : 'border-gray-600 text-gray-400 hover:text-indigo-200 hover:border-indigo-400'
              }`}
            >
              Canvas
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {isMember ? (
        <div className="rounded-lg border border-white/10 overflow-hidden shadow-md bg-[#111]">
          {activeTab === 'editor' ? (
            <Editor role={userRole} roomId={roomId} />
          ) : (
            <Canvas role={userRole} roomId={roomId} />
          )}
        </div>
      ) : (
        <WaitingScreen roomId={roomId} />
      )}
    </div>
  );
}

export default Room;
