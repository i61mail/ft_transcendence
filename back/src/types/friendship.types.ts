export interface FriendshipParams {
    id: number;
}

export interface Friendship {
    id: number;
    user1_id: number;
    user2_id: number;
    friend_id?: number;
    username: string;
    avatar_url?: string;
    display_name?: string;
}

export interface FriendshipRequest {
    user1: number;
    user2: number;
}
