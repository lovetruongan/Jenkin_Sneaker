export interface UserDto {
    id: number,
    fullname: string,
    phone_number: string,
    date_of_birth: Date,
    address: string,
    role: {
        id: number,
        name: string
    }
}