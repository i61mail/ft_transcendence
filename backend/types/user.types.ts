export interface User {
    id:  number,
    username: string,
    password:  string,
    email: string,
    createdAt?: Date
}

export interface UserParams {
    id: number
}
