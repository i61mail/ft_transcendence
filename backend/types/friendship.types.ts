export interface FriendshipParams {
    id: number
}

export interface Friendship
{
    id: number,
    user1_id: number,
    user2_id: number,
    username: string
}

export interface FriendShipRequest {
    user1: string,
    user2: string
} 