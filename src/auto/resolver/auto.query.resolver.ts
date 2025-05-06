import { type Suchkriterien } from '../service/suchkriterien.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AutoReadService } from '../service/auto-read.service.js';
import { getLogger } from '../../logger/logger.js';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Public } from 'nest-keycloak-connect';
import { createPageable } from '../service/pageable.js';

/**
 * Eingabedaten für das Abrufen eines Autos anhand der ID.
 */
export type IdInput = {
    readonly id: number;
};

/**
 * Eingabedaten für die Suchkriterien eines Autos.
 */
export type SuchkriterienInput = {
    readonly suchkriterien: Suchkriterien;
};

/**
 * Resolver für Auto-Abfragen (Query).
 * Handhabt das Abrufen von Auto-Daten aus der Datenbank.
 */
@Resolver('Auto')
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoQueryResolver {
    readonly #service: AutoReadService;

    readonly #logger = getLogger(AutoQueryResolver.name);

    /**
     * Konstruktor des AutoQueryResolvers.
     * @param service Der Service, der für das Abrufen von Auto-Daten verantwortlich ist.
     */
    constructor(service: AutoReadService) {
        this.#service = service;
    }

    /**
     * Abfrage, um ein Auto anhand der ID zu finden.
     * @param id Die ID des Autos, das abgerufen werden soll.
     * @returns Das Auto-Objekt, das der gegebenen ID entspricht.
     */
    @Query('auto')
    @Public()
    async findById(@Args() { id }: IdInput) {
        this.#logger.debug('findById: id=%d', id);
        const auto = await this.#service.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: auto=%s, ausstattung=%o, marke=%r',
                auto.toString(),
                auto.marke,
                auto.ausstattung,
            );
        }
        return auto;
    }

    /**
     * Abfrage, um eine Liste von Autos basierend auf den Suchkriterien zu finden.
     * @param input Die Suchkriterien, die auf die Autos angewendet werden.
     * @returns Eine Liste von Autos, die den Suchkriterien entsprechen.
     */
    @Query('autos')
    @Public()
    async find(@Args() input: SuchkriterienInput | undefined) {
        this.#logger.debug('find: input=%o', input);
        const pageable = createPageable({});
        const autosSlice = await this.#service.find(
            input?.suchkriterien,
            pageable,
        );
        this.#logger.debug('find: autoSlice=%o', autosSlice);
        return autosSlice.content;
    }
}
