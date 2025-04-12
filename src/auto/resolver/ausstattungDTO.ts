/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean,
         IsOptional ,
         Matches 
} from 'class-validator';
import { getriebeArt } from '../entity/ausstattung.entity';

/**
 * Entity-Klasse für Ausstattung ohne TypeORM.
 */
export class AusstattungDTO {
    @IsBoolean()
    @IsOptional()
    @ApiProperty({example: true, type: Boolean})
    readonly klimaanlage! : boolean |undefined;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({example: false, type: Boolean})
    readonly sitzheizung! : boolean | undefined;

    @Matches(/^(AUTOMATIK|MANUELL)$/u)
    @ApiProperty({example: 'AUTOMATIK' , type: String})
    readonly getriebe! : getriebeArt;

    @ApiProperty({example: "leder", type: String})
    readonly innenraummaterial! : string;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */