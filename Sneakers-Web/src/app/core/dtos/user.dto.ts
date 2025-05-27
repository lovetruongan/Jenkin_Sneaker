export interface UserDto {
    id: number | null;
    fullname: string;
    phone_number: string;
    password: string;
    email: string;
    address: string;
    date_of_birth: Date | null;
    is_active: boolean;
    role: {
      id: number;
      name: string;
    };
  }