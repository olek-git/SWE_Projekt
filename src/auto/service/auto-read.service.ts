/**
 * Das Modul besteht aus der Klasse {@linkcode BuchReadService}.
 * @packageDocumentation
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getLogger } from '../../logger/logger.js';
import { type Pageable } from './pageable.js';
import { type Slice } from './slice.js';
import { QueryBuilder } from './query-builder.js';
import { type Suchkriterien } from './suchkriterien.js';
import { AutoFile } from '../entity/autofile.entity.js';
import { Auto } from '../entity/auto.entity.js';

/**
 * Typdefinition für `findById`
 */
export type FindByIdParams = {
    /** ID des gesuchten Autos */
    readonly id: number;
    /** Soll die Marke mitgeladen werden? */
    readonly mitMarke?: boolean;
};

/**
 * Die Klasse `AutoReadService` bietet Methoden zum Lesen von Autos und deren Dateien aus einer relationalen Datenbank.
 * Sie verwendet TypeORM und eine `QueryBuilder`-Klasse, um dynamische SQL-Abfragen zu erstellen.
 * 
 * @remarks
 * Die Klasse implementiert Methoden zur Suche von Autos basierend auf verschiedenen Suchkriterien und zur Rückgabe von Dateien, die mit einem Auto verknüpft sind.
 * 
 * @see {@link QueryBuilder} für die Logik der Abfrageerstellung.
 * @see {@link Auto} für die Struktur eines Auto-Objekts.
 * @see {@link AutoFile} für die Struktur einer Auto-Datei.
 */
@Injectable()
export class AutoReadService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #queryBuilder: QueryBuilder;

    readonly #fileRepo: Repository<AutoFile>;

    readonly #logger = getLogger(AutoReadService.name);

    constructor(
        queryBuilder: QueryBuilder,
        @InjectRepository(AutoFile) fileRepo: Repository<AutoFile>,
    ) {
        this.#queryBuilder = queryBuilder;
        this.#fileRepo = fileRepo;
    }

    /**
     * Ein Buch asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Buches
     * @returns Das gefundene Buch in einem Promise aus ES2015.
     * @throws NotFoundException falls kein Buch mit der ID existiert
     */
    async findById({ id }: FindByIdParams): Promise<Readonly<Auto>> {
        this.#logger.debug('findById: id=%d', id);

        const auto: Auto | null = await this.#queryBuilder
            .buildId({ id })
            .getOne();
        if (auto === null) {
            throw new NotFoundException(`Es gibt kein Auto mit der ID ${id}.`);
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                '#findById: auto=%satisfies, ausstattung=%o',
                auto.toString,
                auto.ausstattung,
            );
        }

        return auto;
    }

    /**
     * Binärdatei zu einem Auto suchen.
     * @param autoId ID des zugehörigen Autos.
     * @returns Binärdatei oder undefined als Promise.
     */
    async findFileByAutoId(
        autoId: number,
    ): Promise<Readonly<AutoFile> | undefined> {
        this.#logger.debug('findFileByAutoId: autoId=%s', autoId);
        const autoFile: AutoFile | null = await this.#fileRepo
            .createQueryBuilder('auto_file')
            .where('auto_id = :id', { id: autoId })
            .getOne();
        if (autoFile === null) {
            this.#logger.debug('findFileByBuchId: Keine Datei gefunden');
            return;
        }

        this.#logger.debug('findFileByBuchId: filename=%s', autoFile.filename);
        return autoFile;
    }

    /**
     * Autos asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien.
     * @param pageable Maximale Anzahl an Datensätzen und Seitennummer.
     * @returns Ein JSON-Array mit den gefundenen Autos.
     * @throws NotFoundException falls keine Autos gefunden wurden.
     */
    async find(
        suchkriterien: Suchkriterien | undefined,
        pageable: Pageable,
    ): Promise<Slice<Auto>> {
        this.#logger.debug(
            'find: suchkriterien:%o, pageable=%o',
            suchkriterien,
            pageable,
        );

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        const queryBuilder = this.#queryBuilder.build(suchkriterien, pageable);
        const autos = await queryBuilder.getMany();
        if (autos.length === 0) {
            this.#logger.debug('find: Keine Autos gefunden');
            throw new NotFoundException(
                `Keine Autos gefunden: ${JSON.stringify(suchkriterien)}, Seite ${pageable.number}}`,
            );
        }
        const totalElements = await queryBuilder.getCount();
        return this.#createSlice(autos, totalElements);
    }

    /**
     * Hilfsmethode, um alle Autos ohne Filter zu suchen.
     * 
     * @param {Pageable} pageable - Die Seiteninformationen (z.B. Seitennummer, Anzahl der Datensätze pro Seite).
     * @returns {Promise<Slice<Auto>>} Eine Seite mit allen Autos.
     * @throws {NotFoundException} Wenn keine Autos gefunden werden.
     */
    async #findAll(pageable: Pageable) {
        const queryBuilder = this.#queryBuilder.build({}, pageable);
        const autos = await queryBuilder.getMany();
        if (autos.length === 0) {
            throw new NotFoundException(
                `Ungueltige Seite "${pageable.number}"`,
            );
        }
        const totalElements = await queryBuilder.getCount();
        return this.#createSlice(autos, totalElements);
    }

    /**
     * Erzeugt ein `Slice`-Objekt aus den gefundenen Autos und der Gesamtanzahl der Elemente.
     * 
     * @param {Auto[]} autos - Die gefundenen Autos.
     * @param {number} totalElements - Die Gesamtanzahl der Elemente.
     * @returns {Slice<Auto>} Ein `Slice`-Objekt, das die gefundenen Autos und die Gesamtanzahl enthält.
     */
    #createSlice(autos: Auto[], totalElements: number): Slice<Auto> {
        const autoSlice: Slice<Auto> = {
            content: autos,
            totalElements,
        };
        this.#logger.debug('createSlice: autoSlice=%o', autoSlice);
        return autoSlice;
    }
}
