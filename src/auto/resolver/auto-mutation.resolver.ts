import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IsInt, IsNumberString, Min } from 'class-validator';// eslint-disable-line @typescript-eslint/naming-convention
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { getLogger } from '../../logger/logger.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { AutoDTO } from './autoDTO.js';
import { AutoWriteService } from '../service/auto.write.service.js';
import { Auto } from '../entity/auto.entity.js';
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { CreatePayload } from '../../../../BuchV1/dist/buch/resolver/buch-mutation.resolver.js';
import { IdInput } from './auto.query.resolver.js';

export type createPayload = {
    readonly id: number;
}

export type UpdatePayload = {
    readonly version: number;
}

export class AutoUpdateDTO extends AutoDTO {
    @IsNumberString()
    readonly id! : string

    @IsInt()
    @Min(0)
    readonly version!: number;
}

@Resolver('Auto')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoMutationResolver {
    readonly #service: AutoWriteService;

    readonly #logger = getLogger(AutoMutationResolver.name);

    constructor(service: AutoWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles('admin', 'user')
    async create(@Args('input') autoDTO: AutoDTO): Promise<CreatePayload> {
        this.#logger.debug('create: autoDTO=%o', autoDTO);

    // DTO in Entity umwandeln
    const auto = this.#autoDtoToAuto(autoDTO);

    // Übergib das Auto an den Service
    const id = await this.#service.create(auto);

    this.#logger.debug('createAuto: id=%d', id);

    return { id };
    }

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

    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deleteAuto: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }
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
        }
    }
}