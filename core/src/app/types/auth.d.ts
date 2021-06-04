interface IUser {
  id: number;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  token: string;
}

interface IGeohubApiLogin {
  id: number;
  email?: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updated_at?: string;
  role?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  access_token: string;
}
