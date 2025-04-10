import { Role } from '../enums/role.enum';

export interface UserPayload {
  // Include other properties from your JWT payload if needed (e.g., id, username)
  id: string;
  username: string;
  roles: Role[];
}
