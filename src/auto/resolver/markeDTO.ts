/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

/**
 * Entity-Klasse für Abbildung ohne TypeORM.
 */
export class MarkeDTO {
    @ApiProperty({example: "Mercedes", type: String})
    readonly name! : string;

    @Matches(/^\d{4}$/, {
            message: 'Baujahr muss genau 4 Ziffern enthalten.'
    })
    @ApiProperty({example: 2004, type: Number})
    readonly gründungsjahr! : number

    @ApiProperty({example: "Ferdinand Porsche", type: String})
    readonly gründer! : string
}
/* eslint-enable @typescript-eslint/no-magic-numbers */