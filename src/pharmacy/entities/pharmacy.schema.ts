import { Prop, Schema } from "@nestjs/mongoose";


export class Pharmacy {


    @Prop()
    name: string;

    @Prop()
    address: string;

    @Prop()
    phone: string;

    @Prop()
    email: string;
}
