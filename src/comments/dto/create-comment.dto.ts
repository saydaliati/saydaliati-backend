import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    pharmacyId: string;

    @IsNotEmpty()
    @IsNumber()
    stars?: number;

    @IsNotEmpty()
    @IsString()
    comment: string;
}
