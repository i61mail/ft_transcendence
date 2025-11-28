export interface Message {
    id: BigInteger,
    friendship_id: number,
    sender: number,
    receiver: number,
    content: string,
    createdAt?: Date
}