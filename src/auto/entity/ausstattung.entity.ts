import { ApiProperty } from '@nestjs/swagger';
import { Auto } from './auto.entity.js'
import { Entity,
         PrimaryGeneratedColumn,
         Column,
         OneToOne,
         JoinColumn
 } from "typeorm"

/**
 * Alias-Typ für gültige Strings bei der Art des Getriebes.
 */
export type getriebeArt = 'AUTOMATIK' | 'MANUELL'

@Entity()
export class Ausstattung{

    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column()
    @ApiProperty({example: true, type: Boolean})
    readonly klimaanlage! : boolean;

    @Column()
    @ApiProperty({example: false, type: Boolean})
    readonly sitzheizung! : boolean;
    
    @Column('varchar')
    @ApiProperty({example: "AUTOMATIK", type: String})
    readonly getriebe! : getriebeArt;

    @Column()
    @ApiProperty({example: "leder", type: String})
    readonly innenraummaterial! : string;

    @OneToOne(() => Auto, (auto) => auto.file)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            klimaanlage : this.klimaanlage,
            sitzheizung : this.sitzheizung,
            getriebe : this.getriebe,
            innenraumfarbe : this.innenraummaterial
        });

}
/* eslint-enable @typescript-eslint/no-magic-numbers */