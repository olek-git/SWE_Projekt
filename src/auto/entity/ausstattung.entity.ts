import { ApiProperty } from '@nestjs/swagger';
import { Auto } from './auto.entity.js';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';

/**
 * Alias-Typ für gültige Strings bei der Art des Getriebes.
 */
export type getriebeArt = 'AUTOMATIK' | 'MANUELL';

/**
 * Die Klasse repräsentiert die Ausstattung eines Fahrzeugs.
 * 
 * Enthält Informationen zur Innenausstattung, Getriebeart und Verbindung zu einem Fahrzeug.
 */
@Entity()
export class Ausstattung {

    /**
     * Die eindeutige ID der Ausstattung (Primärschlüssel).
     */
    @PrimaryGeneratedColumn()
    id: number | undefined;

    /**
     * Gibt an, ob das Fahrzeug mit einer Klimaanlage ausgestattet ist.
     */
    @Column()
    @ApiProperty({ example: true, type: Boolean })
    readonly klimaanlage!: boolean;

    /**
     * Gibt an, ob das Fahrzeug mit einer Sitzheizung ausgestattet ist.
     */
    @Column()
    @ApiProperty({ example: false, type: Boolean })
    readonly sitzheizung!: boolean;

    /**
     * Die Art des Getriebes des Fahrzeugs.
     * 
     * Mögliche Werte: `'AUTOMATIK'`, `'MANUELL'`
     */
    @Column('varchar')
    @ApiProperty({ example: 'AUTOMATIK', type: String })
    readonly getriebe!: getriebeArt;

    /**
     * Das Material des Innenraums.
     */
    @Column()
    @ApiProperty({ example: 'leder', type: String })
    readonly innenraummaterial!: string;

    @OneToOne(() => Auto, (auto) => auto.file)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    /**
     * Gibt die Ausstattung als JSON-String zurück.
     * 
     * Beinhaltet: `id`, `klimaanlage`, `sitzheizung`, `getriebe`, `innenraumfarbe`
     * 
     * @returns JSON-Repräsentation der Ausstattung
     */
    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            klimaanlage: this.klimaanlage,
            sitzheizung: this.sitzheizung,
            getriebe: this.getriebe,
            innenraumfarbe: this.innenraummaterial,
        });
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
