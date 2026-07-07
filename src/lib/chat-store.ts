// Lightweight client-side chat store using localStorage.
// Ready to be swapped for a real backend later.

import type { StructuredAnswer } from "@/lib/chat-types";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: StructuredAnswer; // optional rich blocks; plain content is the fallback
  imageDataUrl?: string;
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  selectedClass: string | null;
  selectedSubject: string | null;
  selectedChapter: string | null;
  createdAt: number;
  updatedAt: number;
};

const KEY = "aurora.chats.v1";

function read(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

function write(chats: Chat[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(chats));
  window.dispatchEvent(new Event("aurora:chats"));
}

export const chatStore = {
  list(): Chat[] {
    return read().sort((a, b) => b.updatedAt - a.updatedAt);
  },
  get(id: string): Chat | undefined {
    return read().find((c) => c.id === id);
  },
  create(): Chat {
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: "New chat",
      messages: [],
      selectedClass: null,
      selectedSubject: null,
      selectedChapter: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    write([chat, ...read()]);
    return chat;
  },
  addMessage(chatId: string, msg: Omit<Message, "id" | "createdAt">): Chat | undefined {
    const chats = read();
    const idx = chats.findIndex((c) => c.id === chatId);
    if (idx === -1) return undefined;
    const message: Message = { ...msg, id: crypto.randomUUID(), createdAt: Date.now() };
    chats[idx].messages.push(message);
    chats[idx].updatedAt = Date.now();
    if (chats[idx].title === "New chat" && msg.role === "user") {
      const titleText = msg.content.trim() || (msg.imageDataUrl ? "Image" : "");
      if (titleText) chats[idx].title = titleText.slice(0, 40);
    }
    write(chats);
    return chats[idx];
  },
  updateMeta(chatId: string, meta: { selectedClass?: string | null; selectedSubject?: string | null; selectedChapter?: string | null }) {
    const chats = read();
    const idx = chats.findIndex((c) => c.id === chatId);
    if (idx === -1) return;
    if (meta.selectedClass !== undefined) chats[idx].selectedClass = meta.selectedClass;
    if (meta.selectedSubject !== undefined) chats[idx].selectedSubject = meta.selectedSubject;
    if (meta.selectedChapter !== undefined) chats[idx].selectedChapter = meta.selectedChapter;
    chats[idx].updatedAt = Date.now();
    write(chats);
  },
  remove(id: string) {
    write(read().filter((c) => c.id !== id));
  },
  clear() {
    write([]);
  },
  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => cb();
    window.addEventListener("aurora:chats", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("aurora:chats", handler);
      window.removeEventListener("storage", handler);
    };
  },
};
