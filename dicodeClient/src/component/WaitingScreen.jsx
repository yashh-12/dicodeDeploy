import React from 'react';

function WaitingScreen({ roomId }) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-300">
            <div className="text-2xl font-bold mb-4 animate-pulse">
                Waiting for host approval...
            </div>
            <p className="text-sm text-gray-400">
                Room ID: <span className="text-cyan-400">{roomId}</span>
            </p>
        </div>
    );
}

export default WaitingScreen;
