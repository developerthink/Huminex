import mongoose, {
  Schema,
  CallbackWithoutResultAndOptionalError,
  CallbackError,
} from "mongoose";
import type { UserType } from "../../types/models/user/user";
import bcrypt from "bcryptjs";

const userSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      select: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    // authProviderId: {
    //   type: String,
    //   select: false,
    // },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "isRoleAssigned", "isOnboarded"],
      default: "pending",
    },
    role: {
      type: String,
      default: "none",
      enum: ["candidate", "employer", "none"],
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    collection: "users",
  }
);

userSchema.pre(
  "save",
  async function (
    this: UserType,
    next: CallbackWithoutResultAndOptionalError
  ): Promise<void> {
    // Only hash the password if it exists and was modified
    if (this.password && this.isModified("password")) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error: unknown) {
        next(error as CallbackError);
      }
    } else {
      next();
    }
  }
);

userSchema.methods.comparePassword = async function (
  this: UserType,
  candidatePassword: string
): Promise<boolean> {
  // If no password exists (OAuth user), return false
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User =
  mongoose.models?.["User"] || mongoose.model<UserType>("User", userSchema);

export default User;
