import { Document } from 'mongoose';
export type RoleType = "candidate" | "employer" | "none";
export type ProviderType = "credentials" | "google" | "github";
export interface UserType extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: RoleType;
  provider: ProviderType;
  description?: string;
  isVerified: boolean;
  status?: "pending" | "isRoleAssigned" | "isOnboarded"
  comparePassword(password: string): Promise<boolean>;
} 