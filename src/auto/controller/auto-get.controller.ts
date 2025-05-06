import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Res,
    StreamableFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { Readable } from 'node:stream';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { AutoReadService } from '../service/auto-read.service.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';
import { Response } from 'express';

/**
 * Die Controller-Klasse für die Verwaltung von Autos.
 */
@Controller(paths.rest)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Auto REST-API')
export class AutoGetController {
    // readonly in TypeScript, vgl. C#
    // private ab ES 2019
    readonly #service: AutoReadService;

    readonly #logger = getLogger(AutoGetController.name);

    // Dependency Injection (DI) bzw. Constructor Injection
    // constructor(private readonly service: BuchReadService) {}
    // https://github.com/tc39/proposal-type-annotations#omitted-typescript-specific-features-that-generate-code
    constructor(service: AutoReadService) {
        this.#service = service;
    }

    @Get('/file/:id')
    @Public()
    @ApiOperation({ description: 'Suche nach Datei mit der Auto-ID' })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 1',
    })
    @ApiNotFoundResponse({ description: 'Keine Datei zur Auto-ID gefunden' })
    @ApiOkResponse({ description: 'Die Datei wurde gefunden' })
    async getFileById(
        @Param('id') idStr: number,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.#logger.debug('getFileById: buchId:%s', idStr);

        const id = Number(idStr);
        if (!Number.isInteger(id)) {
            this.#logger.debug('getById: not isInteger()');
            throw new NotFoundException(`Die Buch-ID ${idStr} ist ungueltig.`);
        }

        const autoFile = await this.#service.findFileByAutoId(id);
        if (autoFile?.data === undefined) {
            throw new NotFoundException('Keine Datei gefunden.');
        }

        const stream = Readable.from(autoFile.data);
        res.set('Content-Type', autoFile.mimetype ?? 'image/png');
        res.set('Content-Disposition', `inline; filename="${autoFile.filename}"`);

        return new StreamableFile(stream);
    }
}
