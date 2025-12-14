export interface MessageProps {
  id: number;
  receiver: number;
  sender: number;
  content: string;
  date?: Date;
  friendship_id?: number;
  inviteCode: string | null,
  inviter: number
}

export interface FriendshipProps {
  id: number;
  friend_id: number;
  username: string;
  avatar_url?: string;
  display_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string | undefined;
  avatar_url?: string | null | undefined;
}
