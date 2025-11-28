export interface UserProps
{
    id: number,
    username: string,
    name?: string,
    lastName?: string,
}

export interface CurrentUser
{
    name?: string,
    username: string;
}


export interface LoginProps 
{
    username: string | null,
    password: string | null;
}

export interface MessageProps 
{
    id: number,
    receiver: number,
    sender: number,
    content: string,
    date?: Date,
    friendship_id?: number,
}

export interface FriendshipProps
{
    id: number,
    friend_id: number,
    username: string
}


  