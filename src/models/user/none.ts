import { Model, Schema } from "mongoose";
import User from "./user";

type NoneType = {
   none: string;
}   
const noneSchema = new Schema<NoneType>({
   none: { type: String },
});

const None = (User.discriminators?.['none'] ||
  User.discriminator('none', noneSchema)) as Model<NoneType>;

export default None;
