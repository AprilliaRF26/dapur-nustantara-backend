import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Lihat semua employee ───────────────────────────
  async findAllEmployees() {
    return this.prisma.employee.findMany({
      select: {
        employee_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Lihat detail employee by id ────────────────────
  async findOneEmployee(employee_id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id },
      select: {
        employee_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
    if (!employee) throw new NotFoundException('Employee tidak ditemukan');
    return employee;
  }
  
  // ── Cari employee by nama ──────────────────────────
  async findEmployeeByName(name: string) {
    const employees = await this.prisma.employee.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      select: {
        employee_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!employees.length) throw new NotFoundException('Employee tidak ditemukan');

    return employees;
  }

  // ── Tambah employee baru ───────────────────────────
  async createEmployee(dto: CreateEmployeeDto) {
    const exists = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.employee.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: dto.role,
      },
      select: {
        employee_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  // ── Update employee (role, is_active, dll) ─────────
  async updateEmployee(employee_id: number, dto: UpdateEmployeeDto) {
    await this.findOneEmployee(employee_id);
    return this.prisma.employee.update({
      where: { employee_id },
      data: { ...dto },
      select: {
        employee_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  // ── Nonaktifkan employee ───────────────────────────
  async deactivateEmployee(employee_id: number) {
    await this.findOneEmployee(employee_id);
    return this.prisma.employee.update({
      where: { employee_id },
      data: { is_active: false },
      select: {
        employee_id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });
  }

  // ── Lihat semua user (customer) ────────────────────
  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Statistik dashboard ────────────────────────────
  async getDashboardStats() {
    const [totalOrders, pendingOrders, totalUsers, totalMenuItems] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.menuItem.count(),
    ]);

    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_users: totalUsers,
      total_menu_items: totalMenuItems,
    };
  }
}