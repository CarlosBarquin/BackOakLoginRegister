import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { UsersCollection, slotCollection } from "../db/mongo.ts";
import { SlotSchema } from "../db/schemas.ts";
import { copyN } from "https://deno.land/std@0.154.0/io/util.ts";
import { User } from "../types.ts";
import { verifyJWT } from "../libs/jwt.ts";

type getSlotsContext = RouterContext<"/availableSlots", Record<string | number, string | undefined>, Record<string, any>>

type MeContext = RouterContext<"/Me/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>

type getDoctorContext = RouterContext<"/doctorAppointments/:id_doctor", {
    id_doctor: string;
} & Record<string | number, string | undefined>, Record<string, any>>

type getPatientContext = RouterContext<"/patientAppointments/:id_patient", {
    id_patient: string;
} & Record<string | number, string | undefined>, Record<string, any>>


export const availableSlots = async (context : getSlotsContext) => {
    try {
        const params = getQuery(context, { mergeParams: true });
        const day = parseInt(params.day)
        const month = parseInt(params.month)
        const year = parseInt(params.year)
        const doctor = params.doctor
    
        if(!year || !month){
            context.response.status = 403
            return
        }
    
        if(day){

            if(doctor){
                const Slots = await slotCollection.find({day: day , month : month, year: year, avaiable : true, doctor: doctor}).toArray()

                if(Slots.length===0){
                    context.response.body = []
                    return
                }

                const SLOTS  = await Promise.all(Slots.map(async (slot) => ({
                    id : slot._id,
                    day : slot.day,
                    month : slot.month,
                    year : slot.year,
                    hour : slot.hour,
                    available : slot.avaiable,
                    doctor : slot.doctor,
                    updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
                })))

    
                context.response.body = SLOTS
                return
            }else{
                const Slots = await slotCollection.find({day: day , month : month, year: year, avaiable : true}).toArray()

                if(Slots.length===0){
                    context.response.body = []
                    return
                }

                const SLOTS  = await Promise.all(Slots.map(async (slot) => ({
                    id : slot._id,
                    day : slot.day,
                    month : slot.month,
                    year : slot.year,
                    hour : slot.hour,
                    available : slot.avaiable,
                    doctor : slot.doctor,
                    updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
                })))

    
                context.response.body = SLOTS
                return
            }

        }else{
            if(doctor){
                const Slots = await slotCollection.find({ month : month, year: year, avaiable : true, doctor: doctor}).toArray()

                if(Slots.length===0){
                    context.response.body = []
                    return
                }

                const SLOTS  = await Promise.all(Slots.map(async (slot) => ({
                    id : slot._id,
                    day : slot.day,
                    month : slot.month,
                    year : slot.year,
                    hour : slot.hour,
                    available : slot.avaiable,
                    doctor : slot.doctor,
                    updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
                })))

    
                context.response.body = SLOTS
                return
            }else{
                const Slots = await slotCollection.find({month : month, year: year, avaiable : true}).toArray()

                if(Slots.length===0){
                    context.response.body = []
                    return
                }   
                
                const SLOTS  = await Promise.all(Slots.map(async (slot) => ({
                    id : slot._id,
                    day : slot.day,
                    month : slot.month,
                    year : slot.year,
                    hour : slot.hour,
                    available : slot.avaiable,
                    doctor : slot.doctor,
                    updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
                })))

    
                context.response.body = SLOTS
                return
            }
        }

        
    } catch (error) {
        context.response.body = error
    }

}

export const doctorApp = async ( context : getDoctorContext) => {
    try {
        const params = getQuery(context, { mergeParams: true });
        const day = parseInt(params.day)
        const month = parseInt(params.month)
        const year = parseInt(params.year)
        const hour = parseInt(params.hour)

        const doctor = context.params.id_doctor

            
        if(!year || !month || !day || !hour){
            context.response.status = 403
            return
        }

        const date = new Date(year,month,day,hour)

        const slots = (await slotCollection.find({doctor : doctor, avaiable : false}).toArray()).filter((slot : SlotSchema) => {
            const slotDate = new Date(slot.year,slot.month,slot.day,slot.hour)
            return slotDate.getTime() >= date.getTime()
        })


        const SLOTS  = await Promise.all(slots.map(async (slot) => ({
            id : slot._id,
            day : slot.day,
            month : slot.month,
            year : slot.year,
            hour : slot.hour,
            available : slot.avaiable,
            doctor : slot.doctor,
            updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
        })))


        context.response.body = SLOTS
        
        

        
        
        
    } catch (error) {
        context.response.body = error
    }
}

export const  patientApp = async ( context : getPatientContext) => {
    try {
        const params = getQuery(context, { mergeParams: true });
        const day = parseInt(params.day)
        const month = parseInt(params.month)
        const year = parseInt(params.year)
        const hour = parseInt(params.hour)

        const dni = context.params.id_patient

            
        if(!year || !month || !day || !hour){
            context.response.status = 403
            return
        }

        const date = new Date(year,month,day,hour)

        const slots = (await slotCollection.find({dni : dni}).toArray()).filter((slot : SlotSchema) => {
            const slotDate = new Date(slot.year,slot.month,slot.day,slot.hour)
            return slotDate.getTime() >= date.getTime()
        })


        const SLOTS  = await Promise.all(slots.map(async (slot) => ({
            id : slot._id,
            day : slot.day,
            month : slot.month,
            year : slot.year,
            hour : slot.hour,
            available : slot.avaiable,
            doctor : slot.doctor,
            updatedBy : await UsersCollection.findOne({_id : slot.updatedBy})
        })))


        context.response.body = SLOTS
        
        

        
        
        
    } catch (error) {
        context.response.body = error
    }
}

export const meeee = async ( context : MeContext ) => {
    try {
        const token = context.params.id

        const user: User = (await verifyJWT(
            token,
            Deno.env.get("JWT_SECRET")!
          )) as User;
          

          context.response.body = user

          
    } catch (error) {
        context.response.body = error
    }
}