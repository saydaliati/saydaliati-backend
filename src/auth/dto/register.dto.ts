import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/role.enum";

export class RegisterDto {
    @IsString()
    @MinLength(4)
    name: string;

    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(4)
    password: string;

    @IsEnum(UserRole)
    role: UserRole = UserRole.USER;
}