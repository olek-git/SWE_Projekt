/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

/* eslint-disable max-classes-per-file, @typescript-eslint/no-magic-numbers */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, 
        Matches,
        IsOptional,
        ValidateNested,
        Min,
        Max
} from 'class-validator';
import {Type } from 'class-transformer';
import { AusstattungDTO } from "../resolver/ausstattungDTO.js";
import { MarkeDTO } from "../resolver/markeDTO.js";

/**
 * Entity-Klasse für Autos ohne TypeORM und ohne Referenzen.
 */
export class AutoDtoOhneRef {
    @ApiProperty ({example: "Porsche 911", type: String})
    readonly bezeichnung! : string;

    @IsString()
    @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
        message: 'Fahrgestellnummer muss 17 Zeichen lang sein und darf keine I, O oder Q enthalten.'
    })
    @ApiProperty({example: 'WVWZZZ1JZXW000001', type: String})
    readonly fahrgestellnummer! : string

    @Min(1886) // Erstes Auto :)
    @Max(new Date().getFullYear())
    @ApiProperty({example: 1999, type: Number})
    readonly baujahr! : number;

    @ApiProperty({example: 225, type: Number})
    readonly ps! : number;

    @IsOptional()
    @ApiProperty({ example: 20500 , type: Number })
    readonly neuKaufpreis!: number;

    @ApiProperty({example: 220, type: Number})
    readonly maxGeschwindigkeit! : number;
}

/**
 * Entity-Klasse für Bücher ohne TypeORM.
 */
export class AutoDTO extends AutoDtoOhneRef {
    @ValidateNested()
    @Type(() => AusstattungDTO)
    @ApiProperty({ type: [AusstattungDTO]})
    readonly ausstattung! : AusstattungDTO;

    @ApiProperty({ type: [MarkeDTO]})
    readonly marke!: MarkeDTO;
}