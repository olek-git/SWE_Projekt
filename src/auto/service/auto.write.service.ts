/**
 * Das Modul besteht aus der Klasse {@linkcode AutoWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeleteResult, Repository } from 'typeorm';
import { getLogger } from '../../logger/logger.js';
import { MailService } from '../../mail/mail.service.js';
import { AutoReadService } from './auto-read.service.js';
import {
    FahrgestellnummerExistsException,
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { Auto } from '../entity/auto.entity.js';
import { AutoFile } from '../entity/autofile.entity.js';
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { Marke } from '../entity/marke.entity.js';
import { EntityManager } from 'typeorm';

/**Typedefinitionen zum Aktualisieren eines Autos mit `update`. */
export type UpdateParams = {
    /**Id des zu aktualisierendes Autos.*/
    readonly id: number | undefined;
    /** Buch-Objekt mit den aktualisierten Werten. */
    readonly auto: Auto;
    /** Versionsnummer für die aktualisierenden Werte. */
    readonly version: string;
}

/**
 * Die Klasse `AutoWriteService` implementiert den Anwendungskern für das
 * Schreiben von Autos und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class AutoWriteService {
    private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

    readonly #repo: Repository<Auto>;

    readonly #fileRepo: Repository<AutoFile>;

    readonly #readService: AutoReadService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(AutoWriteService.name); 

    readonly #markeRepository : Repository<Marke>;

    constructor(
        @InjectRepository(Auto) repo: Repository<Auto>,
        @InjectRepository(AutoFile) fileRepo: Repository<AutoFile>,
        @InjectRepository(Marke) markeRepo: Repository<Marke>,
        readService: AutoReadService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#fileRepo = fileRepo;
        this.#readService = readService;
        this.#markeRepository = markeRepo;
        this.#mailService = mailService;
    }

    /**
     * Ein neues Auto soll angelegt werden.
     * @param auto Das neu abzulegende Auto
     * @returns Die ID des neu angelegten Autos
     */
   async create(auto: Auto) {
    this.#logger.debug('create: auto=%o', auto);
    await this.#validateCreate(auto);

    // Marke anhand der ID aus der Datenbank laden
    const markeId = auto.marke?.id;
    if (!markeId) {
        throw new Error('Marken-ID muss angegeben werden');
    }

    const marke = await this.#markeRepository.findOne({ where: { id: markeId } });
    if (!marke) {
        throw new Error(`Marke mit ID ${markeId} nicht gefunden`);
    }

    // Marke zuweisen (nur Referenz, kein neues Objekt)
    auto.marke = marke;

    const autoDb = await this.#repo.save(auto); // implizite Transaktion
    await this.#sendmail(autoDb);

    return autoDb.id!;
    }
    /**
     * Zu einem vorhandenen Auto eine Binärdatei mit z.B. einem Bild abspeichern.
     * @param autoId ID des vorhandenen Autos
     * @param data Bytes der Datei
     * @param filename Dateiname
     * @param mimetype MIME-Type
     * @returns Entity-Objekt für `AutoFile`
     */
    // eslint-disable-next-line max-params
    async addFile(
        autoId: number,
        data: Buffer,
        filename: string,
        mimetype: string,
    ): Promise<Readonly<AutoFile>> {
        this.#logger.debug(
            'addFile: autoId: %d, filename:%s, mimetype: %s',
            autoId,
            filename,
            mimetype,
        );

        // Auto ermitteln, falls vorhanden
        const auto = await this.#readService.findById({ id: autoId });

        // evtl. vorhandene Datei loeschen
        await this.#fileRepo
            .createQueryBuilder('auto_file')
            .delete()
            .where('auto_id = :id', { id: autoId })
            .execute();

        // Entity-Objekt aufbauen, um es spaeter in der DB zu speichern (s.u.)
        const autoFile = this.#fileRepo.create({
            filename,
            data,
            mimetype,
            auto,
        });

        // Den Datensatz fuer Buch mit der neuen Binaerdatei aktualisieren
        await this.#repo.save({
            id: auto.id,
            file: autoFile,
        });

        return autoFile;
    }

    /**
     * Ein vorhandenes Auto soll aktualisiert werden.
     * @returns Die neue Wersionsnummer gemäß optimitscher Synchronisaton
     * @throws NotFoundException falls kein Auot zur ID gefunden wird
     * @throws VersionInvalidException falls die Versionsnummer ungültig ist
     * @throws VersionOutdatedException falls die Versionsnummer veraltet ist
     */
    async update({ id, auto, version} : UpdateParams){
        this.#logger.debug(
            'update: id=%d, auto=%o, version=%s',
            id,
            auto,
            version
        );
        if(id === undefined) {
            this.#logger.debug('update: Keine gültige ID');
            throw new NotFoundException(`Es gibt kein Auto mit der ID ${id}`)
        }

        const validateResult : Auto = await this.#validateUpdate(auto, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if(!(validateResult instanceof Auto)) {
            return validateResult;
        }

        const autoNeu : Auto = validateResult;
        const merged : Auto = this.#repo.merge(autoNeu, auto);
        this.#logger.debug('update: merged=%o', merged);
        const updated : Auto = await this.#repo.save(merged);
        this.#logger.debug('update: updated=%o', updated)

        return updated.version!;
    }

    /**
     * Ein Auto wird asynchron gelöscht anhand der ID
     * @param id ID des zu löschenden Autos
     * @returns true, falls das Auto vorhanden war und gelöscht wurde
     */
    async delete(id: number): Promise<boolean> {
        this.#logger.debug('delete: id=%d', id);
    
        const auto: Readonly<Auto> = await this.#readService.findById({
            id,
            mitMarke: true,
        });
    
        let deleteResult: DeleteResult | undefined;
    
        // Beginne eine Transaktion, um sicherzustellen, dass keine ungewollten Änderungen passieren
        await this.#repo.manager.transaction(async (transactionMgr: EntityManager): Promise<void> => {
            // Lösche zuerst die Ausstattung, falls vorhanden
            const ausstattungId: number | undefined = auto.ausstattung?.id;
            if (ausstattungId !== undefined) {
                await transactionMgr.delete(Ausstattung, ausstattungId);
            }    
            // Lösche nur das Auto
            deleteResult = await transactionMgr.delete(Auto, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });
    
        // Rückgabe, ob das Auto erfolgreich gelöscht wurde
        return deleteResult?.affected !== undefined &&
               deleteResult.affected !== null &&
               deleteResult.affected > 0;
    }
    


    async #validateCreate({ fahrgestellnummer }: Auto): Promise<undefined> {
        this.#logger.debug('#validateCreate: fahrgestellnummer=%s', fahrgestellnummer);
        if (await this.#repo.existsBy({ fahrgestellnummer})) {
            throw new FahrgestellnummerExistsException(fahrgestellnummer);
        }
    }

    async #sendmail(auto: Auto) {
        const subject = `Neues Auto ${auto.id}`;
        const bezeichnung = auto.bezeichnung
        const body = `Das Auto mit der Bezeichnung <strong>${bezeichnung}</strong> ist angelegt`;
        await this.#mailService.sendmail({ subject, body });
    }

    async #validateUpdate(
        auto: Auto,
        id: number,
        versionStr: string,
    ): Promise<Auto> {
        this.#logger.debug(
            '#validateUpdate: buch=%o, id=%s, versionStr=%s',
            auto,
            id,
            versionStr,
        );
        if (!AutoWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidException(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);
        this.#logger.debug(
            '#validateUpdate: buch=%o, version=%d',
            auto,
            version,
        );

        const autoDb = await this.#readService.findById({ id });

        const versionDb = autoDb.version!;
        if (version < versionDb) {
            this.#logger.debug('#validateUpdate: versionDb=%d', version);
            throw new VersionOutdatedException(version);
        }
        this.#logger.debug('#validateUpdate: buchDb=%o', autoDb);
        return autoDb;
    }
}