import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    create(createItemDto: CreateItemDto): Promise<import("./entities/item.entity").Item>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateItemDto: UpdateItemDto): Promise<import("./entities/item.entity").Item>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
