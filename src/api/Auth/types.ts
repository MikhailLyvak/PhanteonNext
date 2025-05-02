export interface LoginResponse {
  token: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

interface UserEmail {
  email: string;
}

export interface RegisterResponse {
  user: UserEmail;
  token: string;
}

export interface User {
  id: number;
  email: string;
  avatar: string;
  slug: string;
}