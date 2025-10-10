export interface UserProps
{
    id: bigint,
    username: string,
    name: string,
    lastName: string,
}

export interface CurrentUser
{
    name: string,
    username: string;
}


export interface LoginProps 
{
    username: string | null,
    name: string | null;
}

export interface MessageProps 
{
    id: number,
    receiver: string,
    sender: string,
    content: string,
    date?: Date
}

export interface FriendshipProps
{
    id: number,
    username: string
}


  