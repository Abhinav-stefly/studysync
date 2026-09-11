import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyRooms, useCreateStudyRoom, useJoinStudyRoom } from "./useStudyRooms";

export const StudyRoomsPage = () => {
  const { data: rooms, isLoading, error } = useStudyRooms();
  const createRoom = useCreateStudyRoom();
  const joinRoom = useJoinStudyRoom();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const handleCreate = async () => {
    if (!newRoomName.trim()) return;
    const room = await createRoom.mutateAsync(newRoomName.trim());
    setNewRoomName("");
    setIsCreating(false);
    navigate(`/rooms/${room._id}`);
  };

  const handleJoinAndEnter = async (roomId: string, isMember: boolean) => {
    if (!isMember) {
      await joinRoom.mutateAsync(roomId);
    }
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl text-ink">Study rooms</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90"
        >
          New room
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 flex gap-2 border border-ink/20 bg-white p-4">
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-1 border-b border-ink/20 pb-2 font-sans text-sm text-ink focus:border-signal focus:outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={createRoom.isPending}
            className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
          >
            Create & enter
          </button>
          <button onClick={() => setIsCreating(false)} className="font-sans text-sm text-ink/50 hover:text-ink">
            Cancel
          </button>
        </div>
      )}

      {isLoading && <p className="font-sans text-sm text-ink/50">Loading rooms…</p>}
      {error && <p className="font-sans text-sm text-rust">Couldn't load study rooms.</p>}
      {rooms && rooms.length === 0 && !isCreating && (
        <p className="font-sans text-sm text-ink/50">No rooms yet. Start with "New room."</p>
      )}

      <ul className="divide-y divide-ink/10 border-t border-ink/10">
        {rooms?.map((room) => (
          <li key={room._id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-sans text-sm text-ink">{room.name}</p>
              <p className="font-mono text-xs text-ink/40">
                {room.members.length} member{room.members.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => handleJoinAndEnter(room._id, room.isMember)}
              className={`px-3 py-1.5 font-sans text-sm ${
                room.isMember ? "bg-ink/5 text-ink hover:bg-ink/10" : "bg-signal text-paper hover:opacity-90"
              }`}
            >
              {room.isMember ? "Enter" : "Join"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};