import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { REDIS_CLIENT } from '../redis/redis.constants';

const LIST_CACHE_KEY = 'items:all';
const CACHE_TTL_SECONDS = 60;

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const item = this.itemsRepository.create(createItemDto);
    const saved = await this.itemsRepository.save(item);
    await this.invalidateListCache();
    return saved;
  }

  async findAll() {
    const cached = await this.cacheGet(LIST_CACHE_KEY);
    if (cached) return cached;

    const items = await this.itemsRepository.find({ order: { id: 'ASC' } });
    await this.cacheSet(LIST_CACHE_KEY, items);
    return items;
  }

  async findOne(id: number) {
    const key = this.itemKey(id);
    const cached = await this.cacheGet(key);
    if (cached) return cached;

    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    await this.cacheSet(key, item);
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    Object.assign(item, updateItemDto);
    const saved = await this.itemsRepository.save(item);
    await this.invalidateItemCache(id);
    return saved;
  }

  async remove(id: number) {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    await this.itemsRepository.remove(item);
    await this.invalidateItemCache(id);
    return { deleted: true };
  }

  private itemKey(id: number) {
    return `items:${id}`;
  }

  private async invalidateListCache() {
    await this.cacheDel(LIST_CACHE_KEY);
  }

  private async invalidateItemCache(id: number) {
    await Promise.all([this.cacheDel(this.itemKey(id)), this.invalidateListCache()]);
  }

  // --- helpers que "fallan abierto": si Redis no responde, seguimos con la DB ---

  private async cacheGet(key: string) {
    try {
      const raw = await this.redis.get(key);
      if (!raw) {
        this.logger.debug(`cache MISS ${key}`);
        return null;
      }
      this.logger.debug(`cache HIT ${key}`);
      return JSON.parse(raw);
    } catch (err) {
      this.logger.warn(`cache GET falló para ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  private async cacheSet(key: string, value: unknown) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', CACHE_TTL_SECONDS);
    } catch (err) {
      this.logger.warn(`cache SET falló para ${key}: ${(err as Error).message}`);
    }
  }

  private async cacheDel(key: string) {
    try {
      await this.redis.del(key);
      this.logger.debug(`cache INVALIDATE ${key}`);
    } catch (err) {
      this.logger.warn(`cache DEL falló para ${key}: ${(err as Error).message}`);
    }
  }
}
