import { CheckCheck, Hash, Send, Users, FileText, Download, Smile, Plus } from "lucide-react";
import { Surface } from "../ui/surface";

const rooms = [
  { name: "design-review", count: 12, active: true, isDM: false },
  { name: "engineering", count: 6, active: false, isDM: false },
];

const dms = [
  { name: "Mira Sen", initials: "MS", active: false, online: true },
  { name: "Aarav Patel", initials: "AP", active: false, online: false },
];

const messages = [
  {
    sender: "Aarav Patel",
    initials: "AP",
    avatarBg: "bg-[#272725] text-[#d4d4d1] border border-white/[0.04]",
    time: "3:14 PM",
    text: "Here is the Satoshi specimen sheet. The weight distribution feels solid.",
    isGroupStart: true,
    attachment: {
      name: "Satoshi-Specimen.pdf",
      size: "1.4 MB",
      type: "pdf"
    }
  },
  {
    sender: "Mira Sen",
    initials: "MS",
    avatarBg: "bg-[#1f1f1e] text-[#a8a8a2] border border-white/[0.04]",
    time: "3:16 PM",
    text: "This is stunning. The vertical rhythm matches our core aesthetics perfectly.",
    isGroupStart: true,
  }
];

export function ChatPreview() {
  return (
    <Surface className="relative overflow-hidden rounded-2xl p-[1px] shadow-[0_25px_85px_rgba(0,0,0,0.45),0_1px_3px_rgba(255,255,255,0.01)] bg-gradient-to-b from-white/[0.04] to-white/[0.005] hover:shadow-[0_30px_90px_rgba(0,0,0,0.5),0_1px_8px_rgba(255,255,255,0.02)] transition-all duration-500">
      {/* Inner container */}
      <div className="grid min-h-[370px] grid-cols-[118px_1fr] overflow-hidden rounded-[15px] bg-[#141413] sm:grid-cols-[180px_1fr]">
        
        {/* Sidebar */}
        <aside className="border-r border-white/[0.03] bg-[#161615]/30 p-3 flex flex-col select-none">
          <div className="mb-4 flex items-center gap-1.5 px-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#ff5f57]/50" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#febc2e]/40" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#28c840]/40" />
          </div>

          {/* Org Selector */}
          <div className="mb-4 rounded-lg border border-white/[0.03] bg-white/[0.01] p-2 hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#e8e8e5]">
              <Users className="h-3 w-3 text-[#6f6f69]" />
              <span className="truncate">Pyro Studio</span>
            </div>
            <div className="mt-1 text-[8px] text-[#6f6f69] font-mono tracking-wider">3 MEMBERS</div>
          </div>

          {/* Channels Section */}
          <div className="mb-4">
            <span className="px-2 text-[8px] font-semibold tracking-[0.12em] text-[#4d4d48] uppercase">Rooms</span>
            <div className="mt-1.5 space-y-0.5">
              {rooms.map((room) => (
                <div
                  key={room.name}
                  className={
                    room.active
                      ? "flex items-center gap-1.5 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-[5.5px] text-[10.5px] font-medium text-[#e8e8e5] cursor-pointer"
                      : "flex items-center gap-1.5 rounded-md px-2 py-[5.5px] text-[10.5px] text-[#8a8a84] hover:bg-white/[0.01] hover:text-[#d4d4d1] transition-all duration-200 cursor-pointer"
                  }
                >
                  <Hash className="h-2.8 w-2.8 shrink-0 text-[#5a5a55]" />
                  <span className="hidden truncate sm:block">{room.name}</span>
                  {room.active && (
                    <span className="ml-auto hidden text-[8.5px] font-mono text-[#6f6f69] sm:block">
                      {room.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DMs Section */}
          <div>
            <span className="px-2 text-[8px] font-semibold tracking-[0.12em] text-[#4d4d48] uppercase">Direct Messages</span>
            <div className="mt-1.5 space-y-0.5">
              {dms.map((dm) => (
                <div
                  key={dm.name}
                  className="flex items-center gap-1.5 rounded-md px-2 py-[5.5px] text-[10.5px] text-[#8a8a84] hover:bg-white/[0.01] hover:text-[#d4d4d1] transition-all duration-200 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className="flex h-[13px] w-[13px] items-center justify-center rounded-sm bg-white/[0.04] text-[7px] font-medium text-[#6f6f69] border border-white/[0.02]">
                      {dm.initials}
                    </div>
                    <span className={`absolute -right-0.5 -bottom-0.5 h-[5px] w-[5px] rounded-full border border-[#111110] ${dm.online ? "bg-[#8da2aa]/70" : "bg-[#4d4d48]"}`} />
                  </div>
                  <span className="hidden truncate sm:block">{dm.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Panel */}
        <main className="flex min-w-0 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5 select-none bg-white/[0.002]">
            <div>
              <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#e8e8e5]">
                <Hash className="h-3.5 w-3.5 text-[#6f6f69]" />
                design-review
              </div>
              <p className="mt-0.5 text-[9px] text-[#6f6f69] font-light">
                Discussion on layouts, details, and typography spec
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-[#8a8a84] bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-full">
              <span className="h-[5px] w-[5px] rounded-full bg-[#8da2aa]/60" />
              live
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 px-4 py-4 overflow-y-auto">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex gap-3.5 group transition-all duration-200 ${message.isGroupStart ? "mt-5" : "mt-1"}`}>
                
                {/* Avatar column (only rendered on group start, otherwise replaced with custom spacing) */}
                {message.isGroupStart ? (
                  <div className={`mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md text-[9.5px] font-medium ${message.avatarBg} transition duration-200 group-hover:brightness-110`}>
                    {message.initials}
                  </div>
                ) : (
                  <div className="w-[26px] shrink-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[7.5px] text-[#4d4d48] font-mono leading-none">{message.time.split(" ")[0]}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="min-w-0 flex-1">
                  {message.isGroupStart && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10.5px] font-medium text-[#e8e8e5] hover:underline cursor-pointer">
                        {message.sender}
                      </span>
                      <span className="text-[8px] font-light text-[#4d4d48] tabular-nums select-none">
                        {message.time}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-0.5 max-w-[85%] sm:max-w-[75%]">
                    <p className="rounded-lg rounded-tl-sm border border-white/[0.02] bg-white/[0.012] px-3 py-2 text-[11px] leading-[1.6] text-[#c4c4c0] selection:bg-white/10">
                      {message.text}
                    </p>

                    {/* File Attachment Specimen */}
                    {message.attachment && (
                      <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/[0.04] bg-[#141413]/70 p-2.5 hover:border-white/[0.08] hover:bg-[#181817] transition-all duration-300 group/file cursor-pointer">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.03] bg-white/[0.01] text-[#8a8a84] group-hover/file:text-[#e8e8e5] transition duration-200">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-medium text-[#c4c4c0] group-hover/file:text-[#e8e8e5] truncate transition duration-200">
                            {message.attachment.name}
                          </div>
                          <div className="mt-0.5 text-[8.5px] text-[#6f6f69] font-mono">
                            {message.attachment.size} • PDF document
                          </div>
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.04] bg-white/[0.01] text-[#6f6f69] hover:bg-white/[0.04] hover:text-[#e8e8e5] transition-all duration-200 shadow-sm">
                          <Download className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator & Delivered Status */}
            <div className="flex items-center justify-between px-1 pt-1.5 border-t border-white/[0.01]">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.03] bg-white/[0.005] px-2.5 py-1 text-[9.5px] text-[#6f6f69]">
                <div className="flex gap-0.5 items-center h-2">
                  <span className="h-1 w-1 rounded-full bg-[#6f6f69] animate-[bounce_1.4s_infinite_both] [animation-delay:-0.32s]" />
                  <span className="h-1 w-1 rounded-full bg-[#6f6f69] animate-[bounce_1.4s_infinite_both] [animation-delay:-0.16s]" />
                  <span className="h-1 w-1 rounded-full bg-[#6f6f69] animate-[bounce_1.4s_infinite_both]" />
                </div>
                <span className="font-light">Mira is typing</span>
              </div>
              
              <div className="flex items-center gap-1 text-[9px] text-[#4d4d48] font-mono">
                <CheckCheck className="h-3 w-3 text-[#8da2aa]/50" />
                <span>synced</span>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.04] p-3 bg-white/[0.002]">
            <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-[#141413] px-3.5 py-2 text-[10.5px] text-[#5a5a55] hover:border-white/[0.08] transition duration-300">
              <Plus className="h-3.5 w-3.5 text-[#5a5a55] hover:text-[#8a8a84] transition cursor-pointer" />
              <div className="flex-1 truncate font-light">
                Message #design-review...
              </div>
              <Smile className="h-3.5 w-3.5 text-[#5a5a55] hover:text-[#8a8a84] transition cursor-pointer" />
              <Send className="h-3.5 w-3.5 text-[#5a5a55] hover:text-[#8a8a84] transition cursor-pointer" />
            </div>
          </div>
        </main>
      </div>
    </Surface>
  );
}
