import { FriendshipProps, User, MessageProps } from "@/types/chat.types";
import { stat } from "fs";
import { Frijole, Maname } from "next/font/google";
import { create } from "zustand";

interface Status
{
    id: number,
    status: boolean
}


interface GLobalState {
    socket: WebSocket | null,
    gameSocket: WebSocket | null,
    user: User | null,
    friends: FriendshipProps[],
    searchFilter: string,
    pointedUser: FriendshipProps | null,
    currentChat: number,
    messages: MessageProps[],
    latestMessage: MessageProps | null,
    status: Status | null,
    onlineUsers: Set<number>,
    chatIsReady: boolean,
    setChatIsReady: (s: boolean) => void,
    updateGameSocket: (s: WebSocket | null) => void,
    updateUser: (user: User | null) => void,
    updateUserStatus: (s: Status | null) => void,
    changePointedUser: (newPointedUser: FriendshipProps | null) => void,
    createSocket: () => void,
    changeFilter: (filter: string) => void,
    updateFriendList: (friends: FriendshipProps[]) => void,
    updateCurrentChat: (id: number) => void,
    loadMessage: (messages: MessageProps[]) => void,
    addMessage: (message: MessageProps) => void,
    updateLatestMessage: (message: MessageProps | null) => void,
    addOnlineUser: (id: number) => void,
    removeOnlineUser: (id: number) => void
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
    status: null,
    chatIsReady: false,
    onlineUsers: new Set<number>(),
    setChatIsReady: (s: boolean) =>
    {
        set({chatIsReady: s});
    },
    updateUser: (user: User | null) =>
    {
        set({user: user})
    },
    updateUserStatus: (s: Status | null) =>  {
            set({status: s});
    },
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
            newSocket.onmessage = (msg) =>
            {
                const {type, data} = JSON.parse(msg.data.toString());
                console.log("received", type, data);
                if (type === "friend_online")
                {
                    get().addOnlineUser(data);
                }
                else if (type === "friend_offline")
                {
                    get().removeOnlineUser(data);            
                }
            }
        }
    },
    updateFriendList: (friends: FriendshipProps[]) =>
    {
        set({friends: friends.map(value => ({ ...value, status: false }))})
        console.log(get().friends);
    },
    changeFilter: (filter: string) =>
    {
        set({searchFilter: filter});
    },
    changePointedUser: (newPointedUser: FriendshipProps | null) =>
    {
        if (newPointedUser?.id !== get().pointedUser?.id)
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
        console.log('Adding message to store:', message);
        set((state) => ({messages: [message, ...state.messages]}))
    },
    addOnlineUser(id: number)
    {
        set((state) =>{
            const updated = new Set(state.onlineUsers);
            updated.add(id);
            return ({onlineUsers: updated});
        })
    },
    removeOnlineUser(id: number)
    {
        set((state)=>{
            const updated = new Set(state.onlineUsers);
            updated.delete(id);
            return ({onlineUsers: updated})
        })
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
