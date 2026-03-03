import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import User, { IUser } from "@/database/userSchema";
import { auth, clerkClient } from "@clerk/nextjs/server";

// get all users
export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();
      let user = await User.findOne({ email: normalizedEmail }).lean();

      // First-login fallback: if the user doesn't exist in Mongo yet,
      // create one from Clerk user data on the server.
      if (!user) {
        const { userId } = await auth();

        if (userId) {
          const client = clerkClient();
          const clerkUser = await client.users.getUser(userId);
          const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();

          if (clerkEmail === normalizedEmail) {
            const createdUser = await User.findOneAndUpdate(
              { email: normalizedEmail },
              {
                $setOnInsert: {
                  name: clerkUser.fullName || clerkUser.firstName || normalizedEmail,
                  email: normalizedEmail,
                  role: "Volunteer",
                  active: true,
                },
                $set: {
                  phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
                },
              },
              { upsert: true, new: true },
            );

            user = createdUser?.toObject() ?? null;
          }
        }
      }

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user, { status: 200 });
    }
    const users = await User.find().lean();
    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    return NextResponse.json("Failed to fetch users: " + err, { status: 400 });
  }
}

// create a new user
export async function POST(req: Request) {
  await connectDB();

  try {
    const userData = await req.json();
    const normalizedEmail = userData?.email?.toLowerCase()?.trim();
    if (!normalizedEmail) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const newUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: userData?.name || normalizedEmail,
          email: normalizedEmail,
          role: userData?.role || "Volunteer",
          phoneNumber: userData?.phoneNumber || "",
          active: userData?.active ?? true,
          profileURL: userData?.profileURL || "",
        },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
  } catch (err) {
    return NextResponse.json("Failed to create new user: " + err, { status: 400 });
  }
}
