import { CheckCheck, Hash, Lock, Send, Users } from "lucide-react";
import { Surface } from "../ui/surface";

const rooms = [
  { name: "design-review", count: 12, active: true },
  { name: "engineering", count: 6, active: false },
  { name: "launch-room", count: 3, active: false },
];

const messages = [
  {
    name: "Aarav",
    initials: "A",
    avatarBg: "bg-[#1e1e1d] text-[#a8a8a2]",
    text: "Shipping the composer polish. Hover states feel tighter now.",
    time: "9:41",
    wide: false,
  },
  {
    name: "Mira",
    initials: "M",
    avatarBg: "bg-[#252524] text-[#8a8a84]",
    text: "Room sync landed instantly on my side — no delay at all.",
    time: "9:42",
    wide: true,
  },
  {
    name: "Dev",
    initials: "D",
    avatarBg: "bg-[#1a1a19] text-[#6f6f69]",
    text: "Auth guard stable.",
    time: "9:43",
    wide: false,
  },
];

export function ChatPreview() {
  return (
    <Surface className="relative overflow-hidden rounded-2xl p-[1px] shadow-[0_20px_70px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[rgba(242,242,239,0.04)] to-[rgba(242,242,239,0.01)]">
      {/* Inner container */}
      <div className="grid min-h-[400px] grid-cols-[108px_1fr] overflow-hidden rounded-[15px] bg-[var(--bg-charcoal)] sm:grid-cols-[172px_1fr]">
        
        {/* Sidebar */}
        <aside className="border-r border-[var(--border-muted)] bg-[rgba(242,242,239,0.008)] p-2.5 flex flex-col">
          <div className="mb-3 flex items-center gap-1.5 px-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#ff5f57]/60" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#febc2e]/50" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#28c840]/50" />
          </div>

          <div className="mb-3 hidden rounded-lg border border-[var(--border-muted)] bg-[rgba(17,17,16,0.4)] p-2 sm:block">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-primary)]">
              <Users className="h-2.5 w-2.5 text-[var(--text-muted)]" />
              Pyro Team
            </div>
            <div className="mt-1.5 text-[8px] text-[var(--text-muted)]">3 online</div>
          </div>

          <div className="space-y-0.5 flex-1">
            {rooms.map((room) => (
              <div
                key={room.name}
                className={
                  room.active
                    ? "flex items-center gap-1.5 rounded-md border border-[rgba(242,242,239,0.06)] bg-[rgba(242,242,239,0.025)] px-2 py-[5px] text-[10px] text-[var(--text-primary)]"
                    : "flex items-center gap-1.5 rounded-md px-2 py-[5px] text-[10px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                }
              >
                <Hash className="h-2.5 w-2.5 shrink-0" />
                <span className="hidden truncate sm:block">{room.name}</span>
                {room.active && (
                  <span className="ml-auto hidden text-[8px] tabular-nums text-[var(--text-muted)] sm:block">
                    {room.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Panel */}
        <main className="flex min-w-0 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] px-3.5 py-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-primary)]">
                <Hash className="h-3 w-3 text-[var(--text-muted)]" />
                design-review
              </div>
              <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                8 online
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
              <span className="h-[5px] w-[5px] rounded-full bg-emerald-500/60" />
              live
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2.5 px-3.5 py-3.5">
            {messages.map((message) => (
              <div key={message.name} className="flex gap-2">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-medium ${message.avatarBg}`}>
                  {message.initials}
                </div>
                <div className={`min-w-0 ${message.wide ? "max-w-[88%]" : "max-w-[72%]"}`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10.5px] font-medium text-[var(--text-primary)]">
                      {message.name}
                    </span>
                    <span className="text-[8px] tabular-nums text-[#4a4a45]">
                      {message.time}
                    </span>
                  </div>
                  <p className="mt-0.5 rounded-lg rounded-tl-sm border border-[rgba(242,242,239,0.03)] bg-[rgba(242,242,239,0.012)] px-2.5 py-1.5 text-[10.5px] leading-[1.55] text-[var(--text-secondary)]">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="ml-8 flex items-center gap-1.5 text-[9px] text-[#4a4a45]">
              <CheckCheck className="h-2.5 w-2.5" />
              delivered
            </div>
            
            <div className="ml-8 inline-flex items-center gap-1 rounded-full border border-[var(--border-muted)] bg-white/[0.01] px-2 py-[3px] text-[9px] text-[#4a4a45]">
              <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--text-muted)]" />
              Mira is typing
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-[var(--border-muted)] p-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-muted)] bg-[rgba(17,17,16,0.35)] px-2.5 py-1.5 text-[10px] text-[#4a4a45]">
              <Lock className="h-3 w-3" />
              Message #design-review
              <Send className="ml-auto h-3 w-3" />
            </div>
          </div>
        </main>
      </div>
    </Surface>
  );
}
