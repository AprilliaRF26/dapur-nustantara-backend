import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeeRole } from '@prisma/client';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // GET /menu — publik
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // GET /menu/admin — admin & staff
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN, EmployeeRole.STAFF)
  findAllAdmin() {
    return this.menuService.findAllAdmin();
  }

  // GET /menu/categories — publik
  @Get('categories')
  findAllCategories() {
    return this.menuService.findAllCategories();
  }

  // GET /menu/:id — publik
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  // GET /menu/categories/:id
  @Get('categories/:id')
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOneCategory(id);
  }

  // GET /menu/search/:name — publik
  @Get('search/:name')
  findByName(@Param('name') name: string) {
    return this.menuService.findByName(name);
  }

  // POST /menu — admin only
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN)
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  // POST /menu/categories — admin only
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN)
  createCategory(@Body() body: { name: string; icon?: string }) {
    return this.menuService.createCategory(body.name, body.icon);
  }

  // PATCH /menu/:id — admin only
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  // PATCH /menu/:id/stock — staff & admin
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN, EmployeeRole.STAFF)
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stock: number },
  ) {
    return this.menuService.updateStock(id, body.stock);
  }

  // DELETE /menu/:id — admin only
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EmployeeRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}