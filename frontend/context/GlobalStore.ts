import { FriendshipProps, UserProps, MessageProps } from "@/types/common.types";
import { create } from "zustand";


interface GLobalState {
    socket: WebSocket | null,
    gameSocket: WebSocket | null,
    isLogged: boolean,
    user: UserProps | null,
    friends: FriendshipProps[],
    searchFilter: string,
    pointedUser: FriendshipProps | null,
    currentChat: number,
    messages: MessageProps[],
    latestMessage: MessageProps | null,
    updateGameSocket: (s: WebSocket | null) => void,
    changePointedUser: (newPointedUser: FriendshipProps) => void,
    login: (user: UserProps) => void,
    logout: () => void,
    createSocket: () => void,
    changeFilter: (filter: string) => void,
    updateFriendList: (friends: FriendshipProps[]) => void,
    updateCurrentChat: (id: number) => void,
    loadMessage: (messages: MessageProps[]) => void,
    addMessage: (message: MessageProps) => void,
    updateLatestMessage: (message: MessageProps | null) => void
}


const useglobalStore = create<GLobalState>((set,get) => (
{
    socket: null,
    gameSocket: null,
    user: null,
    isLogged: false,
    friends: [],
    searchFilter: '',
    currentChat: 0,
    pointedUser: null,
    messages: [],
    latestMessage: null,
    login: (user) => set(() => ({
        isLogged: true,
        user: user
    })),
    logout: () => set(() => ({
        isLogged: false,
        user: null
    })),
    createSocket: () => {
        const current = get().socket;
        if (!current)
        {
            console.log("INIT...")
            const newSocket = new WebSocket("ws://localhost:4000/sockets");
            newSocket.onopen = () =>
            {
                console.log("connecting to backend...");
                set(() => ({socket: newSocket}));
                const handshake = {type: "handshake", content: get().user?.id};
                if (newSocket.readyState === WebSocket.OPEN)
                    newSocket.send(JSON.stringify(handshake));
            }
            newSocket.onclose = () =>
            {
                console.log("closing socket...");
                newSocket.close();
                set(() => ({socket: null}));
            }
            newSocket.onerror = (event) =>
            {
                console.log("error: ", event.target);
            }
        }
    },
    updateFriendList: (friends: FriendshipProps[]) =>
    {
        set({friends: friends});
        console.log(get().friends);
    },
    changeFilter: (filter: string) =>
    {
        set({searchFilter: filter});
    },
    changePointedUser: (newPointedUser: FriendshipProps) =>
    {
        if (newPointedUser !== get().pointedUser)
            set({messages: []});
        set({pointedUser: newPointedUser});
    },
    updateCurrentChat: (id: number) => {
        set({currentChat: (Number(id))});
    },
    loadMessage: (messages: MessageProps[]) => 
    {
        set({messages: messages});
    },
    addMessage: (message: MessageProps) =>
    {
        set((state) => ({messages: [message, ...state.messages]}))
    },
    updateGameSocket: (s: WebSocket | null) =>
    {
        set(()=>({gameSocket: s}));
    },
    updateLatestMessage: (message: MessageProps | null) =>
    {
        set({latestMessage: message});
    }
}))


export default useglobalStore;
