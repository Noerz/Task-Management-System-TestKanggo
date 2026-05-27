"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./shared/db/prisma");
const logger_1 = __importDefault(require("./shared/utils/logger"));
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.$connect();
        logger_1.default.info('Successfully connected to the database');
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`Server is running on port ${PORT}`, {
                port: PORT,
                env: process.env.NODE_ENV || 'development',
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start the server', { error });
        process.exit(1);
    }
});
startServer();
