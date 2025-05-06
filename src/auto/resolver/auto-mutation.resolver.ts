import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IsInt, IsNumberString, Min } from 'class-validator'; // eslint-disable-line @typescript-eslint/naming-convention
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { getLogger } from '../../logger/logger.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { AutoDTO } from './autoDTO.js';
import { AutoWriteService } from '../service/auto.write.service.js';
import { Auto } from '../entity/auto.entity.js';
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { IdInput } from './auto.query.resolver.js';

/**
 * Payload für eine erfolgreiche Erstellung eines Autos.
 */
export type createPayload = {
    readonly id: number;
};

/**
 * Payload für eine erfolgreiche Auto-Aktualisierung mit Versionsangabe.
 */
export type UpdatePayload = {
    readonly version: number;
};

/**
 * DTO für das Aktualisieren eines Autos.
 * Erbt von AutoDTO und fügt Validierungen für `id` und `version` hinzu.
 */
export class AutoUpdateDTO extends AutoDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}

/**
 * Resolver für Auto-Operationen (Mutation).
 * Handhabt das Erstellen, Aktualisieren und Löschen von Autos.
 */
@Resolver('Auto')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoMutationResolver {
    readonly #service: AutoWriteService;

    readonly #logger = getLogger(AutoMutationResolver.name);

    /**
     * Konstruktor des AutoMutationResolvers.
     * @param service Der Service, der für das Erstellen, Aktualisieren und Löschen von Autos verantwortlich ist.
     */
    constructor(service: AutoWriteService) {
        this.#service = service;
    }

    /**
     * Erzeugt ein neues Auto in der Datenbank.
     * @param autoDTO Das DTO, das die zu erstellenden Auto-Daten enthält.
     * @returns Das Payload-Objekt mit der ID des erstellten Autos.
     */
    @Mutation()
    @Roles('admin', 'user')
    async create(@Args('input') autoDTO: AutoDTO): Promise<createPayload> {
        this.#logger.debug('create: autoDTO=%o', autoDTO);

        // DTO in Entity umwandeln
        const auto = this.#autoDtoToAuto(autoDTO);

        // Übergib das Auto an den Service
        const id = await this.#service.create(auto);

        this.#logger.debug('createAuto: id=%d', id);

        return { id };
    }

    /**
     * Aktualisiert ein bestehendes Auto in der Datenbank.
     * @param autoDTO Das DTO, das die zu aktualisierenden Auto-Daten enthält.
     * @returns Das Payload-Objekt mit der neuen Version des Autos.
     */
    @Mutation()
    @Roles('admin', 'user')
    async update(@Args('input') autoDTO: AutoUpdateDTO) {
        this.#logger.debug('update: auto=%o', autoDTO);

        const auto = this.#autoUpdateDtoToAuto(autoDTO);
        const versionStr = `"${autoDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(autoDTO.id, 10),
            auto,
            version: versionStr,
        });
        this.#logger.debug('updateAuto: versionResult=%d', versionResult);
        const payload: UpdatePayload = { version: versionResult };
        return payload;
    }

    /**
     * Löscht ein Auto anhand der ID.
     * @param id Das ID-Objekt, das die zu löschende Auto-ID enthält.
     * @returns Gibt zurück, ob das Löschen erfolgreich war.
     */
    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deleteAuto: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }

     /**
     * Hilfsmethode zum Konvertieren von AutoDTO in ein Auto-Entity.
     * @param autoDTO Das DTO, das die Auto-Daten enthält.
     * @returns Die Auto-Entity.
     */
    #autoDtoToAuto(autoDTO: AutoDTO): Auto {
        const ausstattungDTO = autoDTO.ausstattung;
        const ausstattung: Ausstattung = {
            id: undefined,
            klimaanlage: ausstattungDTO.klimaanlage ?? false,
            sitzheizung: ausstattungDTO.sitzheizung ?? false,
            getriebe: ausstattungDTO.getriebe,
            innenraummaterial: ausstattungDTO.innenraummaterial,
            auto: undefined,
        };

        const auto: Auto = {
            id: undefined,
            version: undefined,
            bezeichnung: autoDTO.bezeichnung,
            fahrgestellnummer: autoDTO.fahrgestellnummer,
            baujahr: autoDTO.baujahr,
            ps: autoDTO.ps,
            neuKaufpreis: autoDTO.neuKaufpreis,
            maxGeschwindigkeit: autoDTO.maxGeschwindigkeit,
            marke: { id: autoDTO.markeId } as any, // Nur ID wird gesetzt
            file: undefined,
            ausstattung,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        ausstattung.auto = auto;

        return auto;
    }

    /**
     * Hilfsmethode zum Konvertieren von AutoUpdateDTO in ein Auto-Entity.
     * @param autoDTO Das DTO, das die Auto-Daten zum Update enthält.
     * @returns Die Auto-Entity.
     */
    #autoUpdateDtoToAuto(autoDTO: AutoUpdateDTO): Auto {
        return {
            id: undefined,
            version: undefined,
            bezeichnung: autoDTO.bezeichnung,
            fahrgestellnummer: autoDTO.fahrgestellnummer,
            baujahr: autoDTO.baujahr,
            ps: autoDTO.ps,
            neuKaufpreis: autoDTO.neuKaufpreis,
            maxGeschwindigkeit: autoDTO.maxGeschwindigkeit,
            marke: undefined,
            file: undefined,
            ausstattung: undefined,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };
    }
}
