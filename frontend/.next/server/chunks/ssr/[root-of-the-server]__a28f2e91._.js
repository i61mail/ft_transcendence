module.exports = [
"[project]/Desktop/ft_transcendence/frontend/.next-internal/server/app/chats/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/Desktop/ft_transcendence/frontend/app/favicon.ico.mjs { IMAGE => \"[project]/Desktop/ft_transcendence/frontend/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/app/favicon.ico.mjs { IMAGE => \"[project]/Desktop/ft_transcendence/frontend/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/Desktop/ft_transcendence/frontend/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Desktop/ft_transcendence/frontend/app/chats/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
// import { UserProps } from "../../components/features/chat/AllChats";
// import { MessageProps } from "../../components/features/chat/MainChat";
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/context/ChatContextProvider.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
;
// import { useAuth } from "@/context/AuthProvider";
// const fetchFriends = async () => {
// 	try
// 	{
// 		const res = await fetch(`http://localhost:4000/friendships/1`);
// 		const data = await res.json();
// 		return data;
// 	}
// 	catch(err)
// 	{
// 		console.error("failed to fetch friend lists")
// 	}
// };
// const fetchAllMessages = async () => {
// 	try
// 	{
// 		const response = await fetch("http://localhost:4000/messages/1", {
// 		  method: "GET",
// 		  headers: {
// 			"Content-type": "application/json",
// 		  },
// 		});
// 		const data: MessageProps[] = await response.json();
// 		return data;
// 	}
// 	catch (err)
// 	{
// 		console.error("failed to fetch messages")
// 	}
// };
'use client';
const page = ()=>{
    // const data: UserProps[] = await fetchFriends();
    // const messages: MessageProps[] = await fetchAllMessages();
    const chatContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$context$2f$ChatContextProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useChatContext"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function getFriends() {
            const res = await fetch(`http://localhost:4000/friendships/${auth.user?.id}`);
            const friends = await res.json();
            if (friends.length > 0) {
                chatContext.updateFriendList(friends);
                if (!chatContext.pointedUser) {
                    chatContext.changePointedUser(friends[0]);
                    console.log(chatContext.pointedUser);
                }
                router.push(`/chats/${chatContext.pointedUser?.id}`);
            }
        }
        getFriends();
    }, [
        chatContext.pointedUser
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$ft_transcendence$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {}, void 0, false);
};
const __TURBOPACK__default__export__ = page;
}),
"[project]/Desktop/ft_transcendence/frontend/app/chats/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/ft_transcendence/frontend/app/chats/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a28f2e91._.js.map