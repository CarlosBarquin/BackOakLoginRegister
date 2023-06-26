import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { UsersCollection, slotCollection } from "../db/mongo.ts";
import { SlotSchema, UserSchema } from "../db/schemas.ts";
import { copyN } from "https://deno.land/std@0.154.0/io/util.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { User } from "../types.ts";

type putSlotsContext = RouterContext<"/bookSlot", Record<string | number, string | undefined>, Record<string, any>>

type loginContext = RouterContext<"/login", Record<string | number, string | undefined>, Record<string, any>>


export const bookSlot = async ( context : putSlotsContext) => {
    try {
        const result = context.request.body({ type: "json" });
        const value = await  result.value 
    
        if (!value?.day || !value?.hour || !value?.dni ||!value?.doctor || !value?.token)  {
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


        

        const Found = await slotCollection.findOne({day: value.day, hour : value.hour, avaiable : true, doctor: value.doctor})

        if(!Found){
            context.response.status = 404
            return
        }

        await slotCollection.updateOne({_id : Found._id}, {$set : {
            avaiable : false,
            dni : value.dni,
            updatedBy : new ObjectId(user.id)
        }})

        context.response.status = 200

    } catch (error) {
        context.response.body = error
    }
}

export const login = async (context : loginContext) => {
    try {
        const params = getQuery(context, { mergeParams: true });
        const username = params.username
        const password = params.password

        if(!username || !password){
            context.response.status = 403
        }

        const user: UserSchema | undefined = await UsersCollection.findOne({
            username: username,
          });
          if (!user) {
            throw new Error("User does not exist");
          }
          const pass = user.password as string
          const validPassword = await bcrypt.compare(password, pass);
          if (!validPassword) {
            throw new Error("Invalid password");
          }
          const token = await createJWT(
            {
              username: user.username,
              email: user.email,
              name: user.name,
              surname: user.surname,
              id: user._id.toString(),
            },
            Deno.env.get("JWT_SECRET")!
          );
          context.response.body = token;
    
           
    } catch (error) {
        context.response.body = error
    }
}