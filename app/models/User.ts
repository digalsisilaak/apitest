import mongoose, { Schema, Document, Model } from "mongoose";

interface IHistoryItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  timestamp: number;
}

const HistoryItemSchema: Schema = new Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

interface IUser extends Document {
  username: string;
  password: string;
  purchaseHistory: IHistoryItem[];
  lastLoginDate: string | null;
  streak: number;
  refreshTokens: string | null;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchaseHistory: [HistoryItemSchema],
  lastLoginDate: { type: String, default: null },
  streak: { type: Number, default: 0 },
  refreshTokens: { type: String, default: null },
});

UserSchema.virtual("id").get(function (this: mongoose.Document) {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (doc: Document, ret: any) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toHexString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
