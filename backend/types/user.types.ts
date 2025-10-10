export interface User {
    id:  number,
    name:  string,
    lastName:  string,
    username: string,
    password:  string,
    createdAt?: Date
}

export interface UserParams {
    id: number
}
