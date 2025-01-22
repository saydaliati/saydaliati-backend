import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    pharmacyId: string;

    @IsNotEmpty()
    @IsString()
    stars: number;

    @IsNotEmpty()
    @IsString()
    comment: string;
}
