import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ── Register customer ──────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        address: dto.address,
      },
    });

    const { password, ...result } = user;
    return { message: 'Registrasi berhasil', user: result };
  }

  // ── Login customer ─────────────────────────────────
  async loginUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    const token = this.jwt.sign({
      sub: user.user_id,
      email: user.email,
      role: 'customer',
    });

    const { password, ...result } = user;
    return { access_token: token, user: result };
  }

  // ── Login employee (staff / admin) ─────────────────
  async loginEmployee(dto: LoginDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (!employee) throw new UnauthorizedException('Email atau password salah');
    if (!employee.is_active) throw new UnauthorizedException('Akun tidak aktif');

    const valid = await bcrypt.compare(dto.password, employee.password);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    const token = this.jwt.sign({
      sub: employee.employee_id,
      email: employee.email,
      role: employee.role,
    });

    const { password, ...result } = employee;
    return { access_token: token, employee: result };
  }
}