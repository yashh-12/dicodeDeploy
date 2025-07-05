import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';

function Friends() {
  const friendDetails = useLoaderData();
  const [friends, setFriends] = useState(friendDetails?.data || []);

  return (
    <div className="p-6 text-white min-h-screen bg-[#0b0b0b]">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Your Friends</h1>

      {friends.length === 0 ? (
        <p className="text-gray-400 italic">No friends found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="bg-[#121212] border border-blue-500/20 rounded-xl p-4 shadow-[0_0_10px_#3b82f620] flex items-center gap-4 hover:shadow-[0_0_15px_#3b82f640] transition"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-14 h-14 rounded-full border border-blue-400/50"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-blue-300">{friend.name}</h2>
                <p className="text-sm text-gray-400">@{friend.username}</p>
                <p className="text-sm text-gray-500">{friend.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Friends;
