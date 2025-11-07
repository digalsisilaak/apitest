import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import dbConnect from "../../lib/dbConnect";
import { Comment } from "../../models/Comment";
import { User } from "../../models/User";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";

interface JwtPayload {
  id: string;
  username: string;
}

async function authenticateToken(request: Request): Promise<JwtPayload | null> {
  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies.authToken;

  if (token == null) return null;

  return new Promise((resolve) => {
    jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return resolve(null);
      }
      resolve(user as JwtPayload);
    });
  });
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const authenticatedUser = await authenticateToken(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in to leave a comment." },
        { status: 401 }
      );
    }

    const { text } = await request.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { message: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const user = await User.findById(authenticatedUser.id);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized: User not found." },
        { status: 401 }
      );
    }

    const newComment = new Comment({
      userId: user._id,
      username: user.username,
      text: text.trim(),
      createdAt: new Date(),
    });

    await newComment.save();

    return NextResponse.json(
      { message: "Comment added successfully!", comment: newComment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { message: "Server error while posting comment." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const comments = await Comment.find().sort({ createdAt: -1 });
    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Server error while fetching comments." },
      { status: 500 }
    );
  }
}
