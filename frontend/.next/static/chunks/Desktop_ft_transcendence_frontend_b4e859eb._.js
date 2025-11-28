(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/Message.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const Message = (msg)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-auto flex ".concat(msg.type === "sent" && "flex-row-reverse", " px-4"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[40%] p-3 items-end h-auto ".concat(msg.type === "sent" ? "bg-[#7d8fb8]" : "bg-gray-200", " rounded-md"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: msg.message
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/Message.tsx",
                lineNumber: 13,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/Message.tsx",
            lineNumber: 12,
            columnNumber: 9
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/Message.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Message;
const __TURBOPACK__default__export__ = Message;
var _c;
__turbopack_context__.k.register(_c, "Message");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg (static in ecmascript)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/sendButton.a80de124.svg");}),
"[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg.mjs { IMAGE => \"[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg (static in ecmascript)\" } [app-client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg__$28$static__in__ecmascript$29$__["default"],
    width: 24,
    height: 24,
    blurWidth: 0,
    blurHeight: 0
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg.mjs { IMAGE => "[project]/Desktop/ft_transcendence/frontend/public/sendButton.svg (static in ecmascript)" } [app-client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/ChatContextProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const MessageForm = (user)=>{
    _s();
    const chatContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"])();
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const sendMessage = async (data)=>{
        let value = data.get("message");
        if (!value) return;
        try {
            var _chatContext_pointedUser, _chatContext_pointedUser1, _auth_user, _user_ref_current, _user_ref_current1, _user_ref_current2;
            value = value.toString();
            let response = await fetch('http://localhost:4000/messages', {
                method: "POST",
                body: JSON.stringify({
                    friendship_id: (_chatContext_pointedUser = chatContext.pointedUser) === null || _chatContext_pointedUser === void 0 ? void 0 : _chatContext_pointedUser.id,
                    receiver: (_chatContext_pointedUser1 = chatContext.pointedUser) === null || _chatContext_pointedUser1 === void 0 ? void 0 : _chatContext_pointedUser1.username,
                    sender: (_auth_user = auth.user) === null || _auth_user === void 0 ? void 0 : _auth_user.username,
                    content: value
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            });
            response = await response.json();
            console.log("sending message to", chatContext.pointedUser, response);
            let reply = {
                type: "message",
                content: response
            };
            if (((_user_ref_current = user.ref.current) === null || _user_ref_current === void 0 ? void 0 : _user_ref_current.readyState) === WebSocket.CLOSED) alert("unexpected socket disconnection");
            else if (((_user_ref_current1 = user.ref.current) === null || _user_ref_current1 === void 0 ? void 0 : _user_ref_current1.readyState) === WebSocket.OPEN) (_user_ref_current2 = user.ref.current) === null || _user_ref_current2 === void 0 ? void 0 : _user_ref_current2.send(JSON.stringify(reply));
        } catch (err) {
            alert(err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        action: sendMessage,
        className: "flex-1 flex justify-between items-center gap-4 bg-[#92A0BD] px-14",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "message",
                    type: "text",
                    placeholder: "Type a message",
                    className: "text-[20px] rounded-full w-full h-13 bg-white outline-none px-6"
                }, void 0, false, {
                    fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
                    lineNumber: 58,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-13 bg-white rounded-full flex justify-center items-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "submit",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        className: "size-8",
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$sendButton$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"],
                        alt: "send button"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
                        lineNumber: 61,
                        columnNumber: 35
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
                    lineNumber: 61,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MessageForm, "uKu95fcEwlhrRg49Suy4lHlxt88=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = MessageForm;
const __TURBOPACK__default__export__ = MessageForm;
var _c;
__turbopack_context__.k.register(_c, "MessageForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/Desktop/ft_transcendence/frontend/public/defaultUser.svg.mjs { IMAGE => "[project]/Desktop/ft_transcendence/frontend/public/defaultUser.svg (static in ecmascript)" } [app-client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$Message$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/components/features/chat/Message.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/ChatContextProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$MessageForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/components/features/chat/MessageForm.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
const MainChat = (client)=>{
    var _chatContext_pointedUser, _chatContext_pointedUser1;
    _s();
    const chatContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MainChat.useEffect": ()=>{
            async function getMessages() {
                try {
                    var _chatContext_pointedUser;
                    const response = await fetch("http://localhost:4000/messages/friendship/".concat((_chatContext_pointedUser = chatContext.pointedUser) === null || _chatContext_pointedUser === void 0 ? void 0 : _chatContext_pointedUser.id), {
                        method: "GET",
                        headers: {
                            "Content-type": "application/json"
                        }
                    });
                    const data = await response.json();
                    chatContext.updateMessages(data.reverse());
                } catch (err) {
                    console.error("failed to fetch messages");
                }
            }
            let timeout = setTimeout(getMessages, 100);
            return ({
                "MainChat.useEffect": ()=>clearTimeout(timeout)
            })["MainChat.useEffect"];
        }
    }["MainChat.useEffect"], [
        (_chatContext_pointedUser = chatContext.pointedUser) === null || _chatContext_pointedUser === void 0 ? void 0 : _chatContext_pointedUser.id
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex-3 flex flex-col h-full rounded-t-[30] bg-[#B0BBCF]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex justify-left items-center gap-4 bg-[#92A0BD] rounded-tl-[30] px-14",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-11 flex justify-center items-end rounded-full bg-gray-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            className: "fill-current",
                            alt: "user",
                            src: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"]
                        }, void 0, false, {
                            fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                            lineNumber: 48,
                            columnNumber: 17
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                        lineNumber: 47,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-[24px]",
                        children: (_chatContext_pointedUser1 = chatContext.pointedUser) === null || _chatContext_pointedUser1 === void 0 ? void 0 : _chatContext_pointedUser1.username
                    }, void 0, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                        lineNumber: 50,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-15 flex flex-col-reverse py-5 gap-8 wrap-anywhere overflow-scroll",
                children: chatContext.messages.map((msg)=>{
                    var _chatContext_pointedUser;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$Message$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        message: msg.content,
                        type: msg.receiver === ((_chatContext_pointedUser = chatContext.pointedUser) === null || _chatContext_pointedUser === void 0 ? void 0 : _chatContext_pointedUser.username) ? "sent" : "received"
                    }, msg.id, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                        lineNumber: 55,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0));
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$MessageForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                ref: client.ref
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MainChat, "L6mryW/3I5ZFGJb0JlCYkbDWfxY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"]
    ];
});
_c = MainChat;
const __TURBOPACK__default__export__ = MainChat;
var _c;
__turbopack_context__.k.register(_c, "MainChat");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatsWrapper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$MainChat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/components/features/chat/MainChat.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/ChatContextProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const ChatsWrapper = (param)=>{
    let { chat_id } = param;
    _s();
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const chatContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"])();
    const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentChatId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(chat_id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatsWrapper.useEffect": ()=>{
            console.log("now in", chat_id);
            currentChatId.current = chat_id;
            chatContext.friends.forEach({
                "ChatsWrapper.useEffect": (element)=>{
                    if (element.id == currentChatId.current) {
                        chatContext.changePointedUser(element);
                        return;
                    }
                }
            }["ChatsWrapper.useEffect"]);
        }
    }["ChatsWrapper.useEffect"], [
        chat_id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatsWrapper.useEffect": ()=>{
            if (!socket.current) {
                socket.current = new WebSocket("ws://localhost:4000/sockets/messages");
                socket.current.onopen = ({
                    "ChatsWrapper.useEffect": ()=>{
                        var _auth_user, _socket_current;
                        let data = {
                            type: "auth",
                            content: (_auth_user = auth.user) === null || _auth_user === void 0 ? void 0 : _auth_user.username
                        };
                        if (((_socket_current = socket.current) === null || _socket_current === void 0 ? void 0 : _socket_current.readyState) === WebSocket.OPEN) socket.current.send(JSON.stringify(data));
                    }
                })["ChatsWrapper.useEffect"];
                socket.current.onmessage = ({
                    "ChatsWrapper.useEffect": (msg)=>{
                        console.log("received message on", currentChatId.current);
                        const { receiver, sender, content, id, friendship_id } = JSON.parse(msg.data);
                        if (currentChatId.current == friendship_id) {
                            const newMessage = {
                                sender: sender,
                                receiver: receiver,
                                content: content,
                                id: id
                            };
                            console.log("currently in chat", currentChatId.current);
                            console.log("adding message to chat", currentChatId.current, chat_id);
                            chatContext.updateMessages({
                                "ChatsWrapper.useEffect": (previous)=>[
                                        newMessage,
                                        ...previous
                                    ]
                            }["ChatsWrapper.useEffect"]);
                        }
                    }
                })["ChatsWrapper.useEffect"];
                socket.current.onerror = ({
                    "ChatsWrapper.useEffect": (error)=>{
                        console.error('WebSocket error:', error);
                    }
                })["ChatsWrapper.useEffect"];
            }
        }
    }["ChatsWrapper.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$components$2f$features$2f$chat$2f$MainChat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            ref: socket
        }, void 0, false, {
            fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatsWrapper.tsx",
            lineNumber: 66,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false);
};
_s(ChatsWrapper, "uhMCFsdgpb8toBSUzXUJmwtRhss=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"]
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
"[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/Desktop/ft_transcendence/frontend/public/defaultUser.svg.mjs { IMAGE => "[project]/Desktop/ft_transcendence/frontend/public/defaultUser.svg (static in ecmascript)" } [app-client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/ChatContextProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const ChatPreview = (data)=>{
    var _chatContext_pointedUser;
    _s();
    const chatContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"])();
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [latestMessage, setLatestMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [notification, setNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const messageNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentPointed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(chatContext.pointedUser);
    const getCondition = ()=>{
        var _currentPointed_current;
        return data.friend.username === ((_currentPointed_current = currentPointed.current) === null || _currentPointed_current === void 0 ? void 0 : _currentPointed_current.username);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPreview.useEffect": ()=>{
            currentPointed.current = chatContext.pointedUser;
        }
    }["ChatPreview.useEffect"], [
        chatContext.pointedUser
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPreview.useEffect": ()=>{
            if (!messageNotification.current) {
                messageNotification.current = new WebSocket("ws://localhost:4000/sockets/notifications/chatPreview");
                messageNotification.current.onopen = ({
                    "ChatPreview.useEffect": ()=>{
                        var _auth_user, _messageNotification_current;
                        let value = {
                            type: "registration",
                            sender: data.friend.username,
                            receiver: (_auth_user = auth.user) === null || _auth_user === void 0 ? void 0 : _auth_user.username
                        };
                        if (((_messageNotification_current = messageNotification.current) === null || _messageNotification_current === void 0 ? void 0 : _messageNotification_current.readyState) === WebSocket.OPEN) messageNotification.current.send(JSON.stringify(value));
                    }
                })["ChatPreview.useEffect"];
                messageNotification.current.onmessage = ({
                    "ChatPreview.useEffect": (msg)=>{
                        const { type, message } = JSON.parse(msg.data.toString());
                        console.log("receiving noti", message);
                        setLatestMessage(message);
                        if (getCondition() === false) setNotification(true);
                    }
                })["ChatPreview.useEffect"];
                messageNotification.current.onerror = ({
                    "ChatPreview.useEffect": (error)=>{
                        console.error('WebSocket error:', error);
                    }
                })["ChatPreview.useEffect"];
            }
        }
    }["ChatPreview.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: ()=>{
            setNotification(false);
            router.push("/chats/".concat(data.friend.id));
        },
        className: "h-20 w-full rounded-xl flex px-3 gap-x-5 items-center ".concat(((_chatContext_pointedUser = chatContext.pointedUser) === null || _chatContext_pointedUser === void 0 ? void 0 : _chatContext_pointedUser.username) === data.friend.username && "bg-[#B0BBCF]", " ").concat(notification && "border-2 bg-blue-100 border-white"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-[60] rounded-full bg-gray-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    className: "size-fit",
                    src: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$public$2f$defaultUser$2e$svg__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"],
                    alt: "search icon"
                }, void 0, false, {
                    fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
                    lineNumber: 69,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-y-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-[24px]",
                        children: data.friend.username
                    }, void 0, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "px-3",
                        children: latestMessage
                    }, void 0, false, {
                        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
                        lineNumber: 73,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
                lineNumber: 71,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/ft_transcendence/frontend/components/features/chat/ChatPreview.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ChatPreview, "ZqZ+oxFvtuxts9ehApnB03+5E7g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ChatPreview;
const __TURBOPACK__default__export__ = ChatPreview;
var _c;
__turbopack_context__.k.register(_c, "ChatPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/ft_transcendence/frontend/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=Desktop_ft_transcendence_frontend_b4e859eb._.js.map