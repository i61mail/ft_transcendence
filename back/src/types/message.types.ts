export interface Message {
    id?: number;
    friendship_id: number;
    sender: number;
    receiver: number;
    content: string;
    created_at?: Date;
}
