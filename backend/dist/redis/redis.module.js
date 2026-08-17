"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_constants_1 = require("./redis.constants");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: redis_constants_1.REDIS_CLIENT,
                useFactory: () => {
                    const logger = new common_1.Logger('Redis');
                    const client = new ioredis_1.default({
                        host: process.env.REDIS_HOST ?? 'localhost',
                        port: Number(process.env.REDIS_PORT ?? 6379),
                        maxRetriesPerRequest: 1,
                        retryStrategy: () => 1000,
                    });
                    client.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
                    return client;
                },
            },
        ],
        exports: [redis_constants_1.REDIS_CLIENT],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map