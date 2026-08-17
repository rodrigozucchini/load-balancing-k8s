"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ItemsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const item_entity_1 = require("./entities/item.entity");
const redis_constants_1 = require("../redis/redis.constants");
const LIST_CACHE_KEY = 'items:all';
const CACHE_TTL_SECONDS = 60;
let ItemsService = ItemsService_1 = class ItemsService {
    itemsRepository;
    redis;
    logger = new common_1.Logger(ItemsService_1.name);
    constructor(itemsRepository, redis) {
        this.itemsRepository = itemsRepository;
        this.redis = redis;
    }
    async create(createItemDto) {
        const item = this.itemsRepository.create(createItemDto);
        const saved = await this.itemsRepository.save(item);
        await this.invalidateListCache();
        return saved;
    }
    async findAll() {
        const cached = await this.cacheGet(LIST_CACHE_KEY);
        if (cached)
            return cached;
        const items = await this.itemsRepository.find({ order: { id: 'ASC' } });
        await this.cacheSet(LIST_CACHE_KEY, items);
        return items;
    }
    async findOne(id) {
        const key = this.itemKey(id);
        const cached = await this.cacheGet(key);
        if (cached)
            return cached;
        const item = await this.itemsRepository.findOneBy({ id });
        if (!item) {
            throw new common_1.NotFoundException(`Item #${id} not found`);
        }
        await this.cacheSet(key, item);
        return item;
    }
    async update(id, updateItemDto) {
        const item = await this.itemsRepository.findOneBy({ id });
        if (!item) {
            throw new common_1.NotFoundException(`Item #${id} not found`);
        }
        Object.assign(item, updateItemDto);
        const saved = await this.itemsRepository.save(item);
        await this.invalidateItemCache(id);
        return saved;
    }
    async remove(id) {
        const item = await this.itemsRepository.findOneBy({ id });
        if (!item) {
            throw new common_1.NotFoundException(`Item #${id} not found`);
        }
        await this.itemsRepository.remove(item);
        await this.invalidateItemCache(id);
        return { deleted: true };
    }
    itemKey(id) {
        return `items:${id}`;
    }
    async invalidateListCache() {
        await this.cacheDel(LIST_CACHE_KEY);
    }
    async invalidateItemCache(id) {
        await Promise.all([this.cacheDel(this.itemKey(id)), this.invalidateListCache()]);
    }
    async cacheGet(key) {
        try {
            const raw = await this.redis.get(key);
            if (!raw) {
                this.logger.debug(`cache MISS ${key}`);
                return null;
            }
            this.logger.debug(`cache HIT ${key}`);
            return JSON.parse(raw);
        }
        catch (err) {
            this.logger.warn(`cache GET falló para ${key}: ${err.message}`);
            return null;
        }
    }
    async cacheSet(key, value) {
        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', CACHE_TTL_SECONDS);
        }
        catch (err) {
            this.logger.warn(`cache SET falló para ${key}: ${err.message}`);
        }
    }
    async cacheDel(key) {
        try {
            await this.redis.del(key);
            this.logger.debug(`cache INVALIDATE ${key}`);
        }
        catch (err) {
            this.logger.warn(`cache DEL falló para ${key}: ${err.message}`);
        }
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = ItemsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(1, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ioredis_1.default])
], ItemsService);
//# sourceMappingURL=items.service.js.map