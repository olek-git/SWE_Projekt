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
import { Marke } from './marke.entity.js';
import { AutoFile } from './autofile.entity.js';
import { dbType } from '../../config/db.js';
import { Ausstattung } from './ausstattung.entity.js';

/**
 * Repräsentiert ein Auto mit seinen technischen Daten, zugehöriger Ausstattung,
 * Herstellerinformationen sowie Datei- und Zeitstempelinformationen.
 */
@Entity()
export class Auto {

    /**
     * Die eindeutige ID des Fahrzeugs (Primärschlüssel).
     */
    @PrimaryGeneratedColumn()
    id: number | undefined;

    /**
     * Die Versionsnummer zur Unterstützung von Optimistischer Synchronisation.
     */
    @VersionColumn()
    readonly version: number | undefined;

     /**
     * Die Modellbezeichnung des Autos.
     */
    @Column()
    @ApiProperty({ example: 'Porsche 911', type: String })
    readonly bezeichnung!: String;

    /**
     * Die eindeutige Fahrgestellnummer (FIN/VIN) des Fahrzeugs.
     */
    @Column()
    @ApiProperty({ example: 'WVWZZZ1JZXW000001', type: String })
    readonly fahrgestellnummer!: string;

    /**
     * Das Baujahr des Autos.
     */
    @Column()
    @ApiProperty({ example: 1999, type: Number })
    readonly baujahr!: number;

    /**
     * Die Leistung des Fahrzeugs in PS (Pferdestärken).
     */
    @Column()
    @ApiProperty({ example: 225, type: Number })
    readonly ps!: number;

    /**
     * Der Neupreis des Fahrzeugs zum Zeitpunkt des Kaufs.
     */
    @Column({ name: 'neukaufpreis' })
    @ApiProperty({ example: 20500, type: Number })
    readonly neuKaufpreis!: number;

    /**
     * Die maximale Geschwindigkeit des Autos in km/h.
     */
    @Column({ name: 'maxgeschwindigkeit' })
    @ApiProperty({ example: 220, type: Number })
    readonly maxGeschwindigkeit!: number;

    /**
     * Referenz zur zugehörigen Marke des Fahrzeugs.
     */
    @ManyToOne(() => Marke, (marke) => marke.autos)
    @JoinColumn({ name: 'marke_id' })
    marke: Marke | undefined;

    /**
     * Verknüpfung zu einer optionalen Datei (z. B. Bild) des Fahrzeugs.
     * 
     * Wird beim Erstellen und Entfernen automatisch mitbearbeitet.
     */
    @OneToOne(() => AutoFile, (autoFile) => autoFile.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly file: AutoFile | undefined;

    /**
     * Verknüpfung zur Ausstattung des Fahrzeugs.
     * 
     * Wird beim Erstellen und Entfernen automatisch mitbearbeitet.
     */
    @OneToOne(() => Ausstattung, (ausstattung) => ausstattung.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly ausstattung: Ausstattung | undefined;

    /**
     * Zeitstempel, wann das Fahrzeug in der Datenbank angelegt wurde.
     */
    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    /**
     * Zeitstempel der letzten Änderung an den Fahrzeugdaten.
     */
    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    /**
     * Gibt eine JSON-Repräsentation des Fahrzeugs zurück.
     * 
     * Beinhaltet: `id`, `version`, `fahrgestellnummer`, `bezeichnung`, `baujahr`,
     * `ps`, `neuKaufpreis`, `maxGeschwindigkeit`, `erzeugt`, `aktualisiert`
     * 
     * @returns JSON-String mit den Fahrzeugdaten
     */
    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            fahrgestellnummer: this.fahrgestellnummer,
            bezeichnung: this.bezeichnung,
            baujahr: this.baujahr,
            ps: this.ps,
            neuKaufpreis: this.neuKaufpreis,
            maxGeschwindigkeit: this.maxGeschwindigkeit,
            erzeugt: this.erzeugt,
            aktualisiert: this.aktualisiert,
        });
}
