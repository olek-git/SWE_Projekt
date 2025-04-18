/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { typeOrmModuleOptions } from '../../config/typeormOptions.js';
import { getLogger } from '../../logger/logger.js';
import { Auto } from '../entity/auto.entity.js';
import { Marke } from '../entity/marke.entity.js';
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './pageable.js';
import { type Pageable } from './pageable.js';
import { type Suchkriterien } from './suchkriterien.js';

/** Typdefinitionen für die Suche mit der Auto-ID. */
export type BuildIdParams = {
    /** ID des gesuchten Autos. */
    readonly id: number;
    /** Soll die Marke mitgeladen werden? */
    readonly mitMarke?: boolean;
};
/** 
* Die Klasse `QueryBuilder` implementiert das Lesen für Autos und greift
* mit _TypeORM_ auf eine relationale DB zu.
*/
@Injectable()
export class QueryBuilder{
    readonly #autoAlias = `${Auto.name
    .charAt(0)
    .toLowerCase()}${Auto.name.slice(1)}`;

    readonly #ausstattungAlias = `${
    Ausstattung.name
    .charAt(0)
    .toLowerCase()}${Ausstattung.name.slice(1)}`;

    readonly #markeAlias = `${Marke.name
    .charAt(0)
    .toLowerCase()}${Marke.name.slice(1)}`;

    readonly #repo: Repository<Auto>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Auto) repo: Repository<Auto>) {
        this.#repo = repo;
    }

    /**
    * Ein Auto mit der ID suchen.
    * @param id ID des gesuchten Autos
    * @returns QueryBuilder
    * */
    buildId({ id }: BuildIdParams) {
        // QueryBuilder "buch" fuer Repository<Buch>
        const queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);

        // Fetch-Join: aus QueryBuilder "auto" die Property "ausstattung" ->  Tabelle "ausstattung"
        queryBuilder.innerJoinAndSelect(
            `${this.#autoAlias}.ausstattung`,
            this.#ausstattungAlias,
        );

        queryBuilder.leftJoinAndSelect(
            `${this.#autoAlias}.marke`,
            this.#markeAlias,
        );

        queryBuilder.where(`${this.#autoAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    /**
     * Autos asynchron suchen
     * @param suchkriterien JSON-Objekt mit Suchkriterien. Bei "marke" wird mit einem Teilstring
     * gesucht, bei "ps" mit einem Mindestwert, bei "maxGeschwindigkeit" mit einer Obergrenze, bei ausstattung
     * ob es "AUTOMATIK" oder "MANUELL" ist.
     * @param pagable Maximal Anzahl an Datensätzen und Seitennumer.
     * @returns QueryBuilder
     */
    build(
        {
            bezeichnung,
            marke,
            ps,
            baujahr,
            maxGeschwindigkeit,
            ...restProps
        }: Suchkriterien,
        pageable : Pageable,
    ):  SelectQueryBuilder<Auto> {
        this.#logger.debug(
            'build: bezeichnung=%s, marke=%s, ps=%s, baujahr=%s, maxGeschwindigkeit=%s, restProps=%o, pageable=%o',
            bezeichnung,
            marke,
            ps,
            baujahr,
            maxGeschwindigkeit,
            restProps,
            pageable,
        );

        let queryBuilder : SelectQueryBuilder<Auto> = this.#repo.createQueryBuilder(this.#autoAlias)
        queryBuilder.innerJoinAndSelect(`${this.#autoAlias}.ausstattung`, 'ausstattung');

        let useWhere : boolean = true;

        //Marke in der Query: Teilstring der Marke und "case insensitive" 
        //type-coverage: ignore-next-line

        if(bezeichnung !== undefined && typeof bezeichnung === 'string') {
            const ilike = 
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';

            const likeValue = `%${bezeichnung}%`;
                
            queryBuilder = queryBuilder.where(
                `${this.#autoAlias}.bezeichnung ${ilike} :bezeichnung`,
                { bezeichnung: likeValue }
            );
            useWhere = false;

        }

        if (ps !== undefined) {
            const psNumber : number = 
                typeof ps === 'string' ? parseInt(ps) : ps;
            if (!isNaN(psNumber)) {  // Hier prüfen wir, dass psNumber gültig ist
                queryBuilder = queryBuilder.where(
                    `${this.#autoAlias}.ps >= ${psNumber}`,
                );
                useWhere = false;
            }

        }

        if (maxGeschwindigkeit !== undefined) {
            const geschwindigkeitNumber : number = 
                typeof maxGeschwindigkeit === 'string' ? parseInt(maxGeschwindigkeit) : maxGeschwindigkeit;
            if(isNaN(geschwindigkeitNumber))  {
                queryBuilder = queryBuilder.where(
                    `${this.#autoAlias}.maxGeschwindigkeit <= ${geschwindigkeitNumber}`,
                );
                useWhere = false;
            }  

        }
    
        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.entries(restProps).forEach(([key, value]) => {
            const param: Record<string, any> = {};
            param[key] = value; // eslint-disable-line security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                    `${this.#autoAlias}.${key} = :${key}`,
                    param,
                )
                : queryBuilder.andWhere(
                    `${this.#autoAlias}.${key} = :${key}`,
                    param,
                );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());

        if (pageable?.size === 0) {
            return queryBuilder;
        }
        const size = pageable?.size ?? DEFAULT_PAGE_SIZE;
        const number = pageable?.number ?? DEFAULT_PAGE_NUMBER;
        const skip = number * size;
        this.#logger.debug('take=%s, skip=%s', size, skip);
        return queryBuilder.take(size).skip(skip);    
    }   
}