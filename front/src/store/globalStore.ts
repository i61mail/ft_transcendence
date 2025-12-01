'use client';

import { create } from 'zustand';
import { MessageProps, FriendshipProps, User } from '../types/chat.types';

interface GlobalState {
  socket: WebSocket | null;
  isLogged: boolean;
  user: User | null;
  friends: FriendshipProps[];
  searchFilter: string;
  pointedUser: FriendshipProps | null;
  currentChat: number;
  messages: MessageProps[];
  latestMessage: MessageProps | null;
  changePointedUser: (newPointedUser: FriendshipProps) => void;
  login: (user: User) => void;
  logout: () => void;
  createSocket: () => void;
  changeFilter: (filter: string) => void;
  updateFriendList: (friends: FriendshipProps[]) => void;
  updateCurrentChat: (id: number) => void;
  loadMessage: (messages: MessageProps[]) => void;
  addMessage: (message: MessageProps) => void;
  updateLatestMessage: (message: MessageProps | null) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const useGlobalStore = create<GlobalState>((set, get) => ({
  socket: null,
  user: null,
  isLogged: false,
  friends: [],
  searchFilter: '',
  currentChat: 0,
  pointedUser: null,
  messages: [],
  latestMessage: null,
  login: (user) =>
    set(() => ({
      isLogged: true,
      user: user,
    })),
  logout: () =>
    set(() => ({
      isLogged: false,
      user: null,
    })),
  createSocket: () => {
    const current = get().socket;
    if (!current) {
      console.log('Initializing WebSocket...');
      const newSocket = new WebSocket(`${API_URL.replace('http', 'ws')}/sockets`);
      newSocket.onopen = () => {
        console.log('Connected to WebSocket');
        set(() => ({ socket: newSocket }));
        const handshake = { type: 'handshake', content: get().user?.id };
        if (newSocket.readyState === WebSocket.OPEN) newSocket.send(JSON.stringify(handshake));
      };
      newSocket.onclose = () => {
        console.log('WebSocket closed');
        set(() => ({ socket: null }));
      };
      newSocket.onerror = (event) => {
        console.log('WebSocket error: ', event);
      };
    }
  },
  updateFriendList: (friends: FriendshipProps[]) => {
    set({ friends: friends });
  },
  changeFilter: (filter: string) => {
    set({ searchFilter: filter });
  },
  changePointedUser: (newPointedUser: FriendshipProps) => {
    if (newPointedUser !== get().pointedUser) set({ messages: [] });
    set({ pointedUser: newPointedUser });
  },
  updateCurrentChat: (id: number) => {
    set({ currentChat: Number(id) });
  },
  loadMessage: (messages: MessageProps[]) => {
    set({ messages: messages });
  },
  addMessage: (message: MessageProps) => {
    set((state) => ({ messages: [message, ...state.messages] }));
  },
  updateLatestMessage: (message: MessageProps | null) => {
    set({ latestMessage: message });
  },
}));

export default useGlobalStore;
