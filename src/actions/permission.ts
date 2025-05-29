'use server'
import { auth } from "@/auth";

export const isPermissionAllowed = async () => {
    const session = await auth();
    if (!session) {
        return false;
    }
    try {
        const users = JSON.parse(process.env.PERMISSION as string);
        return users.includes(session.user.email);
    } catch (error) {
        console.error("Error checking permission:", error);
        return false;
    }
}