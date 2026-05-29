import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeeRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EmployeeRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/dashboard
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // GET /admin/employees
  @Get('employees')
  findAllEmployees() {
    return this.adminService.findAllEmployees();
  }

  // GET /admin/employees/:id
  @Get('employees/:id')
  findOneEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneEmployee(id); 
  }

  // GET /admin/employees/name/:name
  @Get('employees/name/:name')
  findEmployeeByName(@Param('name') name: string) {
    return this.adminService.findEmployeeByName(name);
  }

  // POST /admin/employees
  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  // PATCH /admin/employees/:id
  @Patch('employees/:id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.adminService.updateEmployee(id, dto);
  }

  // DELETE /admin/employees/:id (nonaktifkan)
  @Delete('employees/:id')
  deactivateEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deactivateEmployee(id);
  }

  // GET /admin/users
  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }
}