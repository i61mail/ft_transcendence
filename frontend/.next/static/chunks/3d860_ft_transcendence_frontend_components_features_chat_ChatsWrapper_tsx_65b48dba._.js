(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatsWrapper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/AuthProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const ChatsWrapper = ()=>{
    _s();
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    // const chatContext = useChatContext();
    // const socket = useRef<WebSocket | null>(null) ;
    // const currentPointed = useRef<FriendshipProps>(chatContext.pointedUser);
    // useEffect(() =>
    // {
    //     currentPointed.current = chatContext.pointedUser;
    // }, [chatContext.pointedUser])
    // useEffect(()=>
    // {
    //   if (!socket.current)
    //   {
    //     socket.current = new WebSocket("ws://localhost:4000/sockets/messages");
    //     socket.current.onopen = () =>
    //     {
    //       let data = {
    //         type: "auth",
    //         content: auth.user?.username 
    //       }
    //       if (socket.current?.readyState === WebSocket.OPEN)
    //         socket.current.send(JSON.stringify(data));
    //     }
    //     socket.current.onmessage = (msg)=>
    //     {
    //       const {receiver, sender, content, id} = JSON.parse(msg.data);
    //       const newMessage: MessageProps = {sender: sender, receiver: receiver, content: content, id: id}
    //       console.log("adding new message", newMessage);
    //       if (newMessage.receiver === currentPointed.current.username || newMessage.sender === currentPointed.current.username)
    //         chatContext.updateMessages((previous) => [newMessage, ...previous]);
    //     }
    //     socket.current.onerror = (error) => {
    //       console.error('WebSocket error:', error);
    //     };
    //   }
    // },[])
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {}, void 0, false);
};
_s(ChatsWrapper, "YuJWYXaKIY31b1y7U6yy3IXSxQA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ChatsWrapper;
const __TURBOPACK__default__export__ = ChatsWrapper;
var _c;
__turbopack_context__.k.register(_c, "ChatsWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=3d860_ft_transcendence_frontend_components_features_chat_ChatsWrapper_tsx_65b48dba._.js.map