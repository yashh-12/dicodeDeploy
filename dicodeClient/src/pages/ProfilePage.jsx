import React, { useState } from 'react';
import FlashMsg from '../component/FlashMsg';
import { changePassword, changeUserDetails, uploadAvatar } from '../service/user.service';
import Error from '../component/Error';
import useUser from '../provider/UserProvider';

function ProfilePage() {
    const { userData: userDetails, setUserData } = useUser() || {};
    const [activeSection, setActiveSection] = useState('overall');
    const [username, setUsername] = useState(userDetails?.username || '');
    const [name, setName] = useState(userDetails?.name || '');
    const [email, setEmail] = useState(userDetails?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleAvatarChange = async (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        const res = typeof uploadAvatar === 'function' ? await uploadAvatar(file) : null;
        if (res?.success) {
            setUserData({ ...userDetails, avatar: res.data })
            setMessage('Avatar changed successfully')
        }
        else setMessage(res?.message || 'Something went wrong');
    };

    const handleProfileUpdate = async (e) => {
        e?.preventDefault();
        if (typeof changeUserDetails !== 'function') return;
        const res = await changeUserDetails(name, username, email);
        if (res?.success) {
            setMessage(res.message);
            setUsername('');
            setName('');
            setEmail('');
        } else {
            setError(res?.message);
        }
    };

    const handlePasswordChange = async (e) => {
        e?.preventDefault();
        if (typeof changePassword !== 'function') return;
        const res = await changePassword(userDetails?.email, currentPassword, newPassword);
        if (res?.success) {
            setMessage(res.message);
            setCurrentPassword('');
            setNewPassword('');
        } else {
            setError(res?.message);
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white">
            <FlashMsg message={message} setMessage={setMessage} />
            <Error error={error} setError={setError} />

            <aside className="w-64 bg-[#111] p-6 rounded-2xl border border-white/10 shadow-md space-y-4">
                <h2 className="text-xl font-bold text-cyan-400">Settings</h2>
                <button
                    className={`w-full text-left px-4 py-2 rounded-full transition ${activeSection === 'overall'
                        ? 'bg-cyan-500 text-black'
                        : 'hover:bg-[#1e293b]'}
          `}
                    onClick={() => setActiveSection('overall')}
                >
                    Overall
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-full transition ${activeSection === 'avatar'
                        ? 'bg-cyan-500 text-black'
                        : 'hover:bg-[#1e293b]'}
          `}
                    onClick={() => setActiveSection('avatar')}
                >
                    Change Avatar
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-full transition ${activeSection === 'password'
                        ? 'bg-cyan-500 text-black'
                        : 'hover:bg-[#1e293b]'}
          `}
                    onClick={() => setActiveSection('password')}
                >
                    Change Password
                </button>
            </aside>

            <main className="flex-1 p-10 overflow-y-auto">
                <h1 className="text-2xl font-bold text-cyan-300 mb-8">Profile Settings</h1>

                {activeSection === 'overall' && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6 bg-[#111] p-8 rounded-2xl border border-white/10 shadow-md max-w-xl mx-auto">
                        <h2 className="text-2xl font-semibold text-cyan-400">Update Details</h2>

                        <div>
                            <label className="block text-sm text-gray-300">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e?.target?.value || '')}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 mt-1 rounded-lg bg-[#0c0c0c] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e?.target?.value || '')}
                                placeholder="Enter your username"
                                className="w-full px-4 py-2 mt-1 rounded-lg bg-[#0c0c0c] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e?.target?.value || '')}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 mt-1 rounded-lg bg-[#0c0c0c] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-cyan-500 text-black rounded-full font-medium shadow-md hover:bg-cyan-400 transition"
                        >
                            Save Changes
                        </button>
                    </form>
                )}

                {activeSection === 'avatar' && (
                    <div className="bg-[#111] p-8 rounded-2xl border border-white/10 shadow-md max-w-md mx-auto space-y-6">
                        <h2 className="text-xl font-semibold text-cyan-400">Change Avatar</h2>
                        <div className="relative w-32 h-32 mx-auto">
                            <img
                                src={userDetails?.avatar}
                                alt={userDetails?.name || 'avatar'}
                                className="rounded-full border-4 border-white/20 w-32 h-32 object-cover"
                            />
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full cursor-pointer hover:bg-cyan-400 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6" />
                                </svg>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {activeSection === 'password' && (
                    <form onSubmit={handlePasswordChange} className="bg-[#111] p-8 rounded-2xl border border-white/10 shadow-md max-w-md mx-auto space-y-6">
                        <h2 className="text-xl font-semibold text-cyan-400">Change Password</h2>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e?.target?.value || '')}
                            placeholder="Current Password"
                            className="w-full px-4 py-2 rounded-lg bg-[#0c0c0c] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e?.target?.value || '')}
                            placeholder="New Password"
                            className="w-full px-4 py-2 rounded-lg bg-[#0c0c0c] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-cyan-500 text-black rounded-full font-medium shadow-md hover:bg-cyan-400 transition"
                        >
                            Change Password
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}

export default ProfilePage;
