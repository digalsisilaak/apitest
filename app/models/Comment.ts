import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  username: string;
  text: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
