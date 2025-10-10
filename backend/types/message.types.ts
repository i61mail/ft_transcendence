export interface Message {
    id: BigInteger,
    friendship_id: number,
    sender: string,
    receiver: string,
    content: string,
    createdAt?: Date
}