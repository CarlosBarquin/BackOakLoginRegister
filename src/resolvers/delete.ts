import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { slotCollection } from "../db/mongo.ts";
import { SlotSchema } from "../db/schemas.ts";
import { copyN } from "https://deno.land/std@0.154.0/io/util.ts";
import { Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { User } from "../types.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";


type removeSlotsContext = RouterContext<"/removeSlot", Record<string | number, string | undefined>, Record<string, any>>

export const deleteSlot = async (context : removeSlotsContext) => {
    try {
        const params = getQuery(context, { mergeParams: true });
        const day = parseInt(params.day)
        const month = parseInt(params.month)
        const year = parseInt(params.year)
        const hour = parseInt(params.hour)
        const token = params.token

            
        if(!year || !month || !day || !hour || !token) {
            context.response.status = 403
            return
        }
        
        const user: User = (await verifyJWT(
            token,
            Deno.env.get("JWT_SECRET")!
          )) as User;
    
          if(user.id === undefined){
            throw new Error("token invalido")
          }

        const found = await slotCollection.findOne({day : day, month : month, year: year, hour : hour})

        if(!found){
            context.response.status = 404
            return
        }

        if(found.avaiable === true){
            await slotCollection.deleteOne(found)
            context.response.status = 200
            context.response.body = found._id

        }else{
            context.response.status = 403
            context.response.body = found._id
        }

        
    
        
    } catch (error) {
        context.response.body = error
    }
}