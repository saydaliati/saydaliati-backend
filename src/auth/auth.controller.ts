import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { AuthResponse, UserCredentials } from './interfaces/auth.interfaces';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto)
    }

    // @Put('verify-email')
    // async verifyEmail(@Body('token') token: string) {
    //     return this.authService.verifyEmail(token)
    // }

    @Post('login')
    async login(@Body() credentials: UserCredentials): Promise<AuthResponse> {
        return this.authService.login(credentials);
    }
}
