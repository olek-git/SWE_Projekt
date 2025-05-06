import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Auto } from './auto.entity.js';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Repräsentiert einen Fahrzeughersteller mit Name, Gründungsjahr und Gründer.
 * 
 * Eine Marke kann mehreren Fahrzeugen zugeordnet sein.
 */
@Entity()
export class Marke {
     /**
     * Eindeutige ID der Marke (Primärschlüssel).
     */
    @PrimaryGeneratedColumn()
    id: number | undefined;

     /**
     * Name der Marke, z. B. "Mercedes".
     */
    @Column()
    @ApiProperty({ example: 'Mercedes', type: String })
    readonly name!: string;

    /**
     * Jahr, in dem die Marke gegründet wurde.
     */
    @Column()
    @ApiProperty({ example: 2004, type: Number })
    readonly gruendungsjahr!: number;

     /**
     * Name des Gründers der Marke.
     */
    @Column()
    @ApiProperty({ example: 'Ferdinand Porsche', type: String })
    readonly gruender!: string;

    /**
     * Liste aller Fahrzeuge, die dieser Marke zugeordnet sind.
     */
    @OneToMany(() => Auto, (auto) => auto.marke, {
        cascade: ['insert', 'remove'],
    })
    autos: Auto[] | undefined;

     /**
     * Gibt eine JSON-Repräsentation der Marke zurück (ohne verknüpfte Autos).
     *
     * @returns JSON-String mit ID, Name, Gründungsjahr und Gründer.
     */
    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            gruendungsjahr: this.gruendungsjahr,
            gruender: this.gruender,
        });
}
