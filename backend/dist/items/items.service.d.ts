import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
export declare class ItemsService {
    private readonly itemsRepository;
    private readonly redis;
    private readonly logger;
    constructor(itemsRepository: Repository<Item>, redis: Redis);
    create(createItemDto: CreateItemDto): Promise<Item>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateItemDto: UpdateItemDto): Promise<Item>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    private itemKey;
    private invalidateListCache;
    private invalidateItemCache;
    private cacheGet;
    private cacheSet;
    private cacheDel;
}
