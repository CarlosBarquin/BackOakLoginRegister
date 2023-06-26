import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Slot, User } from "../types.ts";

export type SlotSchema = Omit<Slot, "updatedBy"> & {
    updatedBy : ObjectId
    _id : ObjectId
}

export type UserSchema = Omit<User, "id" | "token"> & {
    _id : ObjectId
}