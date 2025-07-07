import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { removeFriend } from '../service/friendship.service';

function Friends() {
  const friendDetails = useLoaderData();
  const [friends, setFriends] = useState(friendDetails?.data || []);

  const removeAFriend = async (friendId) => {
    const res = await removeFriend(friendId);
    if(res.success){
      const temp = friends.filter(prev => prev._id != friendId)
      setFriends(temp)
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Your Friends</h1>

      {friends.length === 0 ? (
        <p className="text-gray-400 italic">No friends found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="w-full bg-[#121212] border border-blue-500/20 rounded-xl p-4 shadow-[0_0_10px_#3b82f620] hover:shadow-[0_0_15px_#3b82f640] transition flex items-center gap-4"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-14 h-14 rounded-full border border-blue-400/50 object-cover flex-shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-grow">
                <h2 className="text-lg font-semibold text-blue-300 truncate">{friend.name}</h2>
                <p className="text-sm text-gray-400 truncate">@{friend.username}</p>
                <p className="text-sm text-gray-500 break-all">{friend.email}</p>
              </div>
              <button
                onClick={() => removeAFriend(friend._id)}
                className="text-red-400 border border-red-500 hover:bg-red-500/10 rounded-md px-3 py-1 text-sm transition whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Friends;
