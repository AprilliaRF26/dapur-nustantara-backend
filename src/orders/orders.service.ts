import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ── Buat pesanan baru (customer) ───────────────────
  async create(user_id: number, dto: CreateOrderDto) {
    let subtotal = 0;
    const orderItemsData: { menu_item_id: number; quantity: number; unit_price: number }[] = [];

    for (const item of dto.items) {
      const menu = await this.prisma.menuItem.findUnique({
        where: { menu_item_id: item.menu_item_id },
      });

      if (!menu) throw new NotFoundException(`Menu id ${item.menu_item_id} tidak ditemukan`);
      if (!menu.is_available) throw new BadRequestException(`${menu.name} tidak tersedia`);
      if (menu.stock < item.quantity) throw new BadRequestException(`Stok ${menu.name} tidak cukup`);

      subtotal += menu.price * item.quantity;
      orderItemsData.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menu.price,
      });
    }

    const delivery_fee = 10000;
    const total = subtotal + delivery_fee;

    const order = await this.prisma.order.create({
      data: {
        user_id,
        delivery_address: dto.delivery_address,
        delivery_note: dto.delivery_note,
        subtotal,
        delivery_fee,
        total,
        payment_method: dto.payment_method,
        order_items: {
          create: orderItemsData,
        },
      },
      include: {
        order_items: {
          include: { menu_item: true },
        },
      },
    });

    // Kurangi stok
    for (const item of dto.items) {
      const menu = await this.prisma.menuItem.findUnique({
        where: { menu_item_id: item.menu_item_id },
      });
      const newStock = menu!.stock - item.quantity;
      await this.prisma.menuItem.update({
        where: { menu_item_id: item.menu_item_id },
        data: {
          stock: newStock,
          is_available: newStock > 0,
        },
      });
    }

    return order;
  }

  // ── Lihat pesanan milik customer ───────────────────
  async findByUser(user_id: number) {
    return this.prisma.order.findMany({
      where: { user_id },
      include: {
        order_items: {
          include: { menu_item: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Lihat detail pesanan by id ─────────────────────
  async findOne(order_id: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id },
      include: {
        user: { select: { user_id: true, name: true, phone: true, address: true } },
        employee: { select: { employee_id: true, name: true } },
        order_items: {
          include: { menu_item: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }

  // ── Lihat semua pesanan (staff & admin) ────────────
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { user_id: true, name: true, phone: true } },
        employee: { select: { employee_id: true, name: true } },
        order_items: {
          include: { menu_item: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Update status pesanan (staff & admin) ──────────
  async updateStatus(order_id: number, employee_id: number, dto: UpdateOrderStatusDto) {
    await this.findOne(order_id);
    return this.prisma.order.update({
      where: { order_id },
      data: {
        status: dto.status,
        employee_id,
      },
      include: {
        order_items: {
          include: { menu_item: true },
        },
      },
    });
  }
}