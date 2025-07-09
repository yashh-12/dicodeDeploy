import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { findFriends } from '../service/user.service';
import { acceptFriendRequest, rejectFriendRequest, sendFriendRequest } from '../service/friendship.service';

function AddFriend() {
  const pendingReqDetails = useLoaderData();
  const [pendingReq, setPendingReq] = useState(pendingReqDetails?.data || []);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await findFriends(trimmed);
        if (res.success && Array.isArray(res.data)) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        setSearchResults([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleAcceptReq = async (id) => {
    const res = await acceptFriendRequest(id)

    if (res.success) {
      const temp = pendingReq.filter(req => req.from._id != id)
      setPendingReq(temp)
    }
  }

  const handleRejectReq = async (id) => {
    const res = await rejectFriendRequest(id);
    if (res.success) {
      setPendingReq(prev => prev.filter(req => req._id != id));
    }
  }

  const handleSendReq = async (id) => {
    const res = await sendFriendRequest(id)
    if (res.success) {
      setSearchResults(prev => prev.filter(req => req._id != id));

    }
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#0b0b0b]">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Add New Friends</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, username, or email..."
        className="w-full max-w-md mb-6 px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading && <p className="text-gray-400">🔍 Searching...</p>}

      {searchResults.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="bg-[#121212] border border-blue-500/20 rounded-xl p-4 shadow-[0_0_10px_#3b82f620] hover:shadow-[0_0_15px_#3b82f640] transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-blue-400/50"
                />
                <div>
                  <h2 className="text-lg font-semibold text-blue-300">{user.name}</h2>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md text-white font-medium" onClick={() => handleSendReq(user._id)}>
                Send Request
              </button>
            </div>
          ))}
        </div>
      )}

      {query && !loading && searchResults.length === 0 && (
        <p className="text-gray-500 mt-6 italic">
          No users found matching "{query.trim()}"
        </p>
      )}

      {pendingReq.length > 0 && (
        <div className="mb-10 w-full max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Pending Friend Requests</h2>

          <div className="flex flex-col gap-4">
            {pendingReq.map((req) => (
              <div
                key={req._id}
                className="w-full bg-[#121212] border border-yellow-500/30 rounded-xl p-4 shadow-[0_0_10px_#fde04730] hover:shadow-[0_0_15px_#fde04740] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto">
                    <img
                      src={req.from.avatar}
                      alt={req.from.name}
                      className="w-12 h-12 rounded-full border border-yellow-300/50 object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                      <h2 className="text-lg font-semibold text-yellow-200 truncate">{req.from.name}</h2>
                      <p className="text-sm text-gray-400 truncate">@{req.from.username}</p>
                      <p className="text-sm text-gray-500 break-all">{req.from.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:ml-auto w-full sm:w-auto">
                    <button
                      className="flex-1 sm:flex-none py-2 px-4 text-sm bg-green-600 hover:bg-green-500 rounded-md text-white font-medium"
                      onClick={() => handleAcceptReq(req.from._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 sm:flex-none py-2 px-4 text-sm bg-red-600 hover:bg-red-500 rounded-md text-white font-medium"
                      onClick={() => handleRejectReq(req.from._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

export default AddFriend;
