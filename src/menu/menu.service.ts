import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ── Get semua menu (publik) ────────────────────────
  async findAll() {
    return this.prisma.menuItem.findMany({
      where: { is_available: true },
      include: { category: true },
      orderBy: { category_id: 'asc' },
    });
  }

  // ── Get menu by id ─────────────────────────────────
  async findOne(menu_item_id: number) {
    const menu = await this.prisma.menuItem.findUnique({
      where: { menu_item_id },
      include: { category: true },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return menu;
  }

  async findOneCategory(category_id: number) {
    const category = await this.prisma.category.findUnique({
      where: { category_id },
      include: { menu_items: true },
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  // ── Get semua menu termasuk yg tidak available (admin/staff) ──
  async findAllAdmin() {
    return this.prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { category_id: 'asc' },
    });
  }

  // ── Cari menu by nama ──────────────────────────────
  async findByName(name: string) {
    const menus = await this.prisma.menuItem.findMany({
      where: {
        name: {
          contains: name,
        },
        is_available: true,
      },
      include: { category: true },
    });

    if (!menus.length) throw new NotFoundException('Menu tidak ditemukan');

    return menus;
  }

  // ── Tambah menu (admin) ────────────────────────────
  async create(dto: CreateMenuDto) {
    return this.prisma.menuItem.create({
      data: {
        category_id: dto.category_id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image_url: dto.image_url,
        stock: dto.stock ?? 0,
        is_available: dto.is_available ?? true,
      },
      include: { category: true },
    });
  }

  // ── Update menu (admin) ────────────────────────────
  async update(menu_item_id: number, dto: UpdateMenuDto) {
    await this.findOne(menu_item_id);
    return this.prisma.menuItem.update({
      where: { menu_item_id },
      data: { ...dto },
      include: { category: true },
    });
  }

  // ── Update stok saja (staff) ───────────────────────
  async updateStock(menu_item_id: number, stock: number) {
    await this.findOne(menu_item_id);
    return this.prisma.menuItem.update({
      where: { menu_item_id },
      data: { stock,
        is_available: stock > 0 ? true : false,
       },
    });
  }

  // ── Hapus menu (admin) ─────────────────────────────
  async remove(menu_item_id: number) {
    await this.findOne(menu_item_id);
    await this.prisma.menuItem.delete({ where: { menu_item_id } });
    return { message: 'Menu berhasil dihapus' };
  }

  // ── Get semua kategori ─────────────────────────────
  async findAllCategories() {
    return this.prisma.category.findMany();
  }

  // ── Tambah kategori (admin) ────────────────────────
  async createCategory(name: string, icon?: string) {
    return this.prisma.category.create({
      data: { name, icon },
    });
  }
}