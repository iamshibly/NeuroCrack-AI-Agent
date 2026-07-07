import { useEffect, useState } from "react";
import { MessageSquarePlus, MessageSquare, Trash2, LogOut, Settings, X, History } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { chatStore, type Chat } from "@/lib/chat-store";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// No credits backend yet — placeholder balance until wired up to a real account.
const BYTESTONES_BALANCE = 4;

type Props = {
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
};

export function ChatSidebar({ activeChatId, onSelect, onNewChat, onClose }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [user, setUser] = useState(authStore.current());
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setChats(chatStore.list());
    refresh();
    return chatStore.subscribe(refresh);
  }, []);

  useEffect(() => authStore.subscribe(() => setUser(authStore.current())), []);

  const handleLogout = () => {
    authStore.signOut();
    navigate({ to: "/login" });
  };

  const handleClearAll = () => {
    chatStore.clear();
    onNewChat();
  };

  return (
    <aside className="h-full w-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 pb-5 flex items-center justify-between">
        <div className="flex items-center px-2">
          <img src="/neurocrack-logo.svg" alt="NeuroCrack" className="h-8 w-auto" />
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-3 pb-2">
        <Button
          onClick={onNewChat}
          className="w-full h-11 rounded-full justify-center gap-2 text-primary-foreground font-medium"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-soft)" }}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="px-3 pb-3">
        <div className="w-full h-10 rounded-full bg-accent flex items-center justify-between px-3.5">
          <div className="flex items-center gap-2">
            <img src="/bytestone-icon.svg" alt="" className="h-4 w-auto" />
            <span className="text-sm font-medium text-accent-foreground">ByteStones</span>
          </div>
          <span className="text-sm font-semibold text-accent-foreground">{BYTESTONES_BALANCE}</span>
        </div>
      </div>

      {/* Chats */}
      <div className="px-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent
        </span>
        {chats.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
          >
            <History className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {chats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No previous chats yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={cn(
                "group w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors",
                activeChatId === chat.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
              <span className="flex-1 truncate">{chat.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  chatStore.remove(chat.id);
                  if (activeChatId === chat.id) onNewChat();
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </button>
          ))
        )}
      </div>

      {/* Profile */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent/60 transition-colors">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            {(user?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name ?? "Guest"}
            </div>
            <div className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
