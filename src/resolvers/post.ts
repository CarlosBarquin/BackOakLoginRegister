import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { UsersCollection, slotCollection } from "../db/mongo.ts";
import { SlotSchema, UserSchema } from "../db/schemas.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { User } from "../types.ts";

type addSlotContext = RouterContext<"/addSlot", Record<string | number, string | undefined>, Record<string, any>>

type registerContext = RouterContext<"/register", Record<string | number, string | undefined>, Record<string, any>>

export const addSlot = async (context : addSlotContext) => {
    try {
        const result = context.request.body({ type: "json" });
        const value = await  result.value 
    
        if (!value?.year || !value?.month || !value?.day || !value?.hour || !value.doctor || !value?.token) {
            context.response.status = 400;
           return
        }

        if(value.day > 23 || value.day < 1 ){
            context.response.status = 400;
            return
        }

        if(value.month > 12 || value.month < 1 ){
            context.response.status = 400;
            return
        }

        if(value.hour > 23 || value.month < 0 ){
            context.response.status = 400;
            return
        }

        const user: User = (await verifyJWT(
            value.token,
            Deno.env.get("JWT_SECRET")!
          )) as User;
    
          if(user.id === undefined){
            throw new Error("token invalido")
          }


        const Found = await slotCollection.findOne({year : value.year, month : value.month, day:value.day, hour : value.hour})
        if(Found){

            if(Found.doctor === value.doctor){

                if(Found.avaiable === true){
                    context.response.status = 200
                    return
                }
                context.response.status = 409
                    return
            }

        }

     

        const Slot : SlotSchema = {
            _id : new ObjectId(),
            year : value.year,
            month : value.month,
            day : value.day,
            hour : value.hour,
            avaiable : true,
            dni : "",
            doctor : value.doctor,
            updatedBy : new ObjectId(user.id)
            
        }

        await slotCollection.insertOne(Slot)

        context.response.body = Slot._id
    
    
    } catch (e) {
        context.response.body = e
    }
}

export const register = async ( context : registerContext) => {
    try {
        const result = context.request.body({ type: "json" });
        const value = await  result.value 

        if (!value?.username || !value?.email || !value?.password || !value?.name || !value.surname) {
            context.response.status = 400;
           return
        }

        const user: UserSchema | undefined = await UsersCollection.findOne({
            username: value.username,
          });
          if (user) {
            throw new Error("User already exists");
          }
          const hashedPassword = await bcrypt.hash(value.password);
          const _id = new ObjectId();
          const token = await createJWT(
            {
              username: value.username,
              email: value.email,
              name: value.name,
              surname: value.surname,
              id: _id.toString(),
            },
            Deno.env.get("JWT_SECRET")!
          );
          const newUser: UserSchema = {
            _id,
            username: value.username,
            email: value.email,
            password: hashedPassword,
            name: value.name,
            surname: value.surname,
          };
          await UsersCollection.insertOne(newUser);
          context.response.body = {
            ...newUser,
            token,
          };


    
    } catch (error) {
        context.response.body = error
    }
}