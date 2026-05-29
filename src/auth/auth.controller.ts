import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login
  @Post('login')
  @HttpCode(200)
  loginUser(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }

  // POST /auth/employee/login
  @Post('employee/login')
  @HttpCode(200)
  loginEmployee(@Body() dto: LoginDto) {
    return this.authService.loginEmployee(dto);
  }
}