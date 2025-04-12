/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import {Marke} from './marke.entity.js';
import{AutoFile} from './autofile.entity.js';
import { dbType } from '../../config/db.js';
import { Ausstattung } from './ausstattung.entity.js';

@Entity()
export class Auto{
    @PrimaryGeneratedColumn()
    id : number | undefined; 

    @VersionColumn()
    readonly version: number | undefined;

    @Column()
    @ApiProperty ({example: "Porsche 911", type: String})
    readonly bezeichnung! : String; 

    @Column()
    @ApiProperty({example: 'WVWZZZ1JZXW000001', type: String})
    readonly fahrgestellnummer! : string

    @Column()
    @ApiProperty({example: 1999, type: Number})
    readonly baujahr! : number;

    @Column()
    @ApiProperty({example: 225, type: Number})
    readonly ps! : number;

    @Column()
    @ApiProperty({ example: 20500 , type: Number })
    readonly neuKaufpreis!: number;

    @Column()
    @ApiProperty({example: 220, type: Number})
    readonly maxGeschwindigkeit! : number;

    @ManyToOne(() => Marke, (marke) => marke.autos)
    @JoinColumn({ name: 'marke_id' }) 
    readonly marke! : Marke | undefined;

    @OneToOne(() => AutoFile, (autoFile) => autoFile.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly file: AutoFile | undefined;

    @OneToOne(() => Ausstattung, (ausstattung) => ausstattung.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly ausstattung: Ausstattung | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            fahrgestellnummer: this.fahrgestellnummer,
            bezeichnung : this.bezeichnung,
            baujahr : this.baujahr,
            ps : this.ps,
            neuKaufpreis : this.neuKaufpreis,
            maxGeschwindigkeit : this.maxGeschwindigkeit,
            erzeugt: this.erzeugt,
            aktualisiert: this.aktualisiert,
        });
}