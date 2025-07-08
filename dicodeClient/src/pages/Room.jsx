import React, { useEffect, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import useUser from '../provider/UserProvider';
import Editor from '../component/Editor';
import Canvas from '../component/Canvas';
import WaitingScreen from '../component/WaitingScreen';
import useSocket from '../provider/SocketProvider';
import { Room as LiveKitRoom, RoomEvent } from 'livekit-client';
import { MdMic, MdMicOff } from 'react-icons/md';
import { useReactFlow } from '@xyflow/react';

function Room() {
  const [incommingCalls, setIncomingCalls] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [count, setCount] = useState(0)
  const { roomId } = useParams();
  const { userData } = useUser();
  const data = useLoaderData();
  const LiveKitRoomRef = useRef(null);
  const [mute, setMute] = useState(false)
  const [roomDetails, setRoomDetails] = useState(data.data || {});
  const [speakers, setSpeakers] = useState([]);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notification, setNotification] = useState("")
  const [screenShareOn, setScreenShareOn] = useState(false)
  const isCreator = roomDetails?.creator?._id === userData._id;
  const screenShareRef = useRef({})
  const [showScreenShareOption, setShowScreenShareOption] = useState(isCreator);

  useEffect(() => {
    if (!socket) return;

    socket.emit?.("register", { roomId });
    socket.emit?.("join-req", { roomId });
    socket.emit?.("need-latest-code", {});

    socket.on("give-req", ({ userData }) => {
      if (!userData?.["_id"]) return;

      setIncomingCalls((prev) => {
        const alreadyExists = prev?.some((u) => u?._id === userData?._id);
        if (alreadyExists) return prev;

        setCount((prev) => prev + 1);
        return [...prev, userData];
      });
    });

    socket.on("room-updated", ({ userId }) => {
      setRoomDetails((prev) => ({
        ...prev,
        members: prev?.members?.filter((member) => member?.user?._id !== userId) ?? [],
      }));
    });

    socket.on("navigate-room", () => {
      navigate?.("/space");
    });

    socket.on("joined-room", ({ user }) => {
      setRoomDetails((prev) => {
        const alreadyExists = prev?.members?.some((m) => m?.user?._id === user?._id);
        if (alreadyExists) return prev;

        return {
          ...prev,
          members: [...(prev?.members ?? []), { user, role: "viewer" }],
        };
      });

      setIncomingCalls((prev) => prev?.filter((u) => u?._id !== user?._id));
    });

    socket.on("joine-room", ({ user }) => {
      setRoomDetails((prev) => {
        const alreadyExists = prev?.members?.some((m) => m?.user?._id === user?._id);
        if (alreadyExists) return prev;

        return {
          ...prev,
          members: [...(prev?.members ?? []), { user, role: "viewer" }],
        };
      });

      socket.emit?.("join-req");
    });

    socket.on("role-changed", ({ userId, role }) => {
      setRoomDetails((prev) => {
        const updatedMembers = prev?.members?.map((member) => {
          if (member?.user?._id === userId) {
            return { ...member, role };
          }
          return member;
        }) ?? [];

        return {
          ...prev,
          members: updatedMembers,
        };
      });
    });

    socket.on("role-updated", ({ role }) => {
      if (role === "editor") {
        setNotification("Your are promoted as an Editor");
      } else {
        setNotification("You are demoted as a Viewer");
      }

      setTimeout(() => {
        setNotification("");
      }, 2500);
    });

    socket.on("no-host", () => {
      navigate?.("/space");
    });

    socket.on("livekit-token", async ({ token }) => {
      const room = new LiveKitRoom({ adaptiveStream: true, dynacast: true });
      LiveKitRoomRef.current = room;

      room.on(RoomEvent.ActiveSpeakersChanged, (list) => {
        setSpeakers(
          list.map((p) => {
            let metadata = {};
            try {
              metadata = JSON.parse(p?.metadata || '{}');
            } catch (err) {
              console.warn('Invalid metadata JSON for participant', p?.identity);
            }

            return {
              id: p?.identity,
              name: p?.name || 'Anonymous',
              avatar: metadata?.avatar || '',
            };
          })
        );
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication) => {
        if (track?.kind === 'video' && track?.source === 'screen_share') {
          console.log("git track ", track);

          const el = track.attach?.();
          if (!el) return;
          el.autoplay = true;
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'contain';

          const container = document.createElement('div');
          container.id = `ss-${publication?.trackSid}`;
          container.appendChild(el);
          screenShareRef.current.appendChild(container);
        }

        if (track?.kind === 'audio') {
          const el = track.attach?.();
          if (el) {
            el.autoplay = true;
            document.body.appendChild(el);
          }
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
        track?.detach?.()?.forEach((el) => el?.remove?.());

        if (track?.source === 'screen_share') {
          const container = document.getElementById(`ss-${publication?.trackSid}`);
          if (container) container.remove();
        }
      });

      try {
        await room.connect?.(import.meta.env.VITE_LIVEKIT_WEB_URL, token);
        await room.localParticipant?.setMicrophoneEnabled?.(false);
        await room.localParticipant?.setScreenShareEnabled?.(false);
      } catch (err) {
        console.error("Failed To send error", err);
      }
    });


    return () => {
      socket.emit?.("discc", {});
      socket.off("give-req");
      socket.off("joined-room");
      socket.off("no-host");
    };
  }, [socket]);


  const isMember = roomDetails?.members?.some(
    (m) => m?.user?._id === userData?._id
  );

  const userRole = roomDetails?.members?.find(
    (m) => m?.user?._id === userData?._id
  )?.role;

  const handleJoinRoom = (user) => {
    socket?.emit?.("join-room", { roomId, user });
    setCount((prev) => prev - 1);
  };

  const handleKickUser = (userId) => {
    socket?.emit?.("kick-room", { userId });
  };

  const handleLeaveRoom = () => {
    socket?.emit?.("leave-room", {});
  };

  const handleToggleRole = (userId) => {
    socket?.emit?.("change-role", { userId });
  };

  const handleToggleMic = async () => {
    const room = LiveKitRoomRef?.current;
    if (!room) return;

    await room?.localParticipant?.setMicrophoneEnabled?.(!mute);
    setMute((prev) => !prev);
  };

  const handleToggleScreenShare = async () => {
    const room = LiveKitRoomRef?.current;
    if (!room) return;

    await room?.localParticipant?.setScreenShareEnabled?.(!screenShareOn);
    setScreenShareOn((prev) => !prev);
  };



  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-cyan-400">
          Room: {roomDetails?.name}
        </h1>

        {notification || ""}

        {speakers?.length > 0 && (
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {speakers.map((speaker) => (
              <div
                key={speaker?.id}
                className="flex items-center gap-2 px-3 py-1 bg-[#1e293b] rounded-full border border-cyan-400/30"
              >
                {speaker?.avatar && (
                  <img
                    src={speaker.avatar}
                    alt={speaker.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm text-cyan-200">{speaker?.name}</span>
                <span className="animate-ping w-2 h-2 rounded-full bg-green-400"></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {screenShareRef?.current && (
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          ref={screenShareRef}
        />
      )}


      {isMember && (
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-1 rounded-full border transition-all duration-200 ${activeTab === 'editor'
              ? 'border-cyan-400 text-cyan-300 bg-[#1e293b]'
              : 'border-gray-600 text-gray-400 hover:text-cyan-200 hover:border-cyan-400'
              }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-1 rounded-full border transition-all duration-200 ${activeTab === 'canvas'
              ? 'border-indigo-400 text-indigo-300 bg-[#1e293b]'
              : 'border-gray-600 text-gray-400 hover:text-indigo-200 hover:border-indigo-400'
              }`}
          >
            Canvas
          </button>
        </div>
      )}

      {isMember ? (
        <div className="relative rounded-lg border border-white/10 overflow-hidden bg-[#111] z-10">
          <div className={activeTab === 'editor' ? 'block' : 'hidden'}>
            <Editor role={userRole} roomId={roomId} />
          </div>
          <div className={activeTab === 'canvas' ? 'block' : 'hidden'}>
            <Canvas role={userRole} roomId={roomId} />
          </div>
        </div>
      ) : (
        <WaitingScreen userdata={roomDetails?.creator} />
      )}

      {isMember && (
        <div className="mt-8 flex justify-center gap-4">
          {showScreenShareOption && (
            <button
              onClick={handleToggleScreenShare}
              className={`px-6 py-2 ${screenShareOn ? "bg-red-500 hover:bg-red-400" : "bg-yellow-500 hover:bg-yellow-400"} text-black font-medium rounded-md`}
            >
              {screenShareOn ? "Stop Sharing" : "Share Screen"}
            </button>
          )}

          <button
            onClick={handleToggleMic}
            className={`px-6 py-2 ${!mute ? "bg-red-500 hover:bg-red-400" : "bg-green-500 hover:bg-green-400"} text-black font-medium rounded-lg`}
          >
            {!mute ? <MdMicOff className='text-white' size={20} /> : <MdMic className='text-white' size={20} />}
          </button>

          {isCreator && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-400"
            >
              Show Join Requests {count}
            </button>
          )}

          <button
            onClick={() => setShowMembersModal(true)}
            className="px-6 py-2 bg-cyan-500 text-black font-medium rounded-md hover:bg-cyan-400"
          >
            View All Members
          </button>

          <button
            onClick={handleLeaveRoom}
            className="px-6 py-2 bg-red-500 text-black font-medium rounded-md hover:bg-red-400"
          >
            {isCreator ? "End Meeting" : "Leave Meeting"}
          </button>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121212] p-6 rounded-2xl max-w-md w-full border border-yellow-400/30 relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-3 right-4 text-gray-300 hover:text-red-400 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-yellow-300 mb-5">
              Incoming Join Requests
            </h2>

            {incommingCalls?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center italic">No incoming requests.</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {incommingCalls.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-yellow-500/10 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-yellow-200 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-400">@{user?.username}</p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold rounded-md"
                      onClick={() => handleJoinRoom(user)}
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121212] p-6 rounded-2xl max-w-md w-full border border-cyan-500/30 relative">
            <button
              onClick={() => setShowMembersModal(false)}
              className="absolute top-3 right-4 text-gray-300 hover:text-red-400 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-cyan-300 mb-5">All Members</h2>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {roomDetails?.members?.map(({ user }, index) => {
                const member = roomDetails?.members?.find(m => m?.user?._id === user?._id);
                const isViewer = member?.role === 'viewer';

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-cyan-500/10 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-cyan-200 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-400">@{user?.username}</p>
                      </div>
                    </div>

                    {isCreator && user?._id !== userData?._id && (
                      <div className="flex flex-col gap-3">
                        <button
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                          onClick={() => handleKickUser(user._id)}
                        >
                          Kick
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => handleToggleRole(user._id)}
                        >
                          {isViewer ? 'Make Editor' : 'Make Viewer'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );


}

export default Room;
