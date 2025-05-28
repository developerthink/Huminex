// models/user/user.ts - Fixed User Model with Proper Cache Handling
import mongoose, {
  Schema,
  CallbackWithoutResultAndOptionalError,
  CallbackError,
} from "mongoose";
import type { UserType } from "../../types/models/user/user";
import bcrypt from "bcryptjs";

// Clear existing models to prevent caching issues
if (mongoose.models.User) {
  delete mongoose.models.User;
}
if (mongoose.models.candidate) {
  delete mongoose.models.candidate;
}
if (mongoose.models.employer) {
  delete mongoose.models.employer;
}
if (mongoose.models.none) {
  delete mongoose.models.none;
}

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
    // Add strict mode to prevent schema conflicts
    strict: true,
  }
);

userSchema.pre(
  "save",
  async function (
    this: UserType,
    next: CallbackWithoutResultAndOptionalError
  ): Promise<void> {
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
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the User model only once
const User = mongoose.model<UserType>("User", userSchema);

export default User;