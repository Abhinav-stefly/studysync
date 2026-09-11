import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRoomMessages } from "../../api/studyRooms.api";
import { useRoomSocket } from "./useRoomSocket";
import { useAuth } from "../../auth/useAuth";

export const StudyRoomViewPage = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ["roomMessages", roomId],
    queryFn: () => fetchRoomMessages(roomId!),
    enabled: !!roomId,
  });

  const { messages, onlineUserIds, activeUserIds, connectionError, sendMessage, startActivity, stopActivity } =
    useRoomSocket(roomId!, history ?? []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  };

  if (isLoading) return <p className="font-sans text-sm text-ink/50">Loading room…</p>;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-ink/10 pb-3">
        <Link to="/rooms" className="font-sans text-sm text-ink/50 hover:text-ink">
          ← Rooms
        </Link>
        <p className="font-sans text-xs text-ink/40">
          {onlineUserIds.size} online{activeUserIds.size > 0 && ` · ${activeUserIds.size} active`}
        </p>
      </div>

      {connectionError && (
        <p className="mb-3 font-sans text-sm text-rust">{connectionError}</p>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div key={msg._id} className={msg.userId === user?.id ? "text-right" : ""}>
            <p
              className={`inline-block max-w-md px-3 py-2 font-sans text-sm ${
                msg.userId === user?.id ? "bg-signal text-paper" : "bg-white text-ink"
              }`}
            >
              {msg.content}
            </p>
            <p className="mt-0.5 font-mono text-xs text-ink/30">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t border-ink/10 pt-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={startActivity}
          onBlur={stopActivity}
          placeholder="Type a message…"
          className="flex-1 border border-ink/20 bg-white px-3 py-2 font-sans text-sm text-ink focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          className="bg-signal px-4 py-2 font-sans text-sm text-paper hover:opacity-90"
        >
          Send
        </button>
      </form>
    </div>
  );
};