import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { findFriends } from '../service/user.service'; // API to search users
import { acceptFriendRequest } from '../service/friendship.service';

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
        console.error(err);
        setSearchResults([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleAcceptReq = async (id) => {
        const res = await acceptFriendRequest(id)

        if(res.success){
            const temp = pendingReq.filter(req => req.from._id != id)
            setPendingReq(temp)
        }
  }

  const handleRejectReq = (id) => {
    console.log(id);
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#0b0b0b]">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Add New Friends</h1>

      {/* 🔍 Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, username, or email..."
        className="w-full max-w-md mb-6 px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* 🔄 Loading */}
      {loading && <p className="text-gray-400">🔍 Searching...</p>}

      {/* 🔍 Search Results */}
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
              <button className="mt-3 w-full py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md text-white font-medium">
                ➕ Send Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ❌ No Search Matches */}
      {query && !loading && searchResults.length === 0 && (
        <p className="text-gray-500 mt-6 italic">
          No users found matching "{query.trim()}"
        </p>
      )}

      {/* 🔔 Pending Requests Section */}
      {pendingReq.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Pending Friend Requests</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pendingReq.map((req) => (
              <div
                key={req._id}
                className="bg-[#121212] border border-yellow-500/30 rounded-xl p-4 shadow-[0_0_10px_#fde04730] hover:shadow-[0_0_15px_#fde04740] transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={req.from.avatar}
                    alt={req.from.name}
                    className="w-12 h-12 rounded-full border border-yellow-300/50"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-yellow-200">{req.from.name}</h2>
                    <p className="text-sm text-gray-400">@{req.from.username}</p>
                    <p className="text-sm text-gray-500">{req.from.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="w-full py-2 text-sm bg-green-600 hover:bg-green-500 rounded-md text-white font-medium" onClick={() => handleAcceptReq(req.from._id)}>
                    ✅ Accept
                  </button>
                  <button className="w-full py-2 text-sm bg-red-600 hover:bg-red-500 rounded-md text-white font-medium" onClick={() => handleRejectReq(req.from._id)}>
                    ❌ Reject
                  </button>
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
