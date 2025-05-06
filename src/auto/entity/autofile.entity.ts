import {
    Entity,
    OneToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { Auto } from './auto.entity.js';
import { binaryType } from '../../config/db.js';

/**
 * Repräsentiert eine Datei, die einem Auto zugeordnet ist.
 * 
 * Enthält Dateimetadaten und den Binärinhalt, z. B. ein Bild oder PDF.
 */
@Entity()
export class AutoFile {

     /**
     * Eindeutige ID der Datei (Primärschlüssel).
     */
    @PrimaryGeneratedColumn()
    id: number | undefined;

    /**
     * Der Dateiname (z. B. „auto.jpg“), wie er ursprünglich hochgeladen wurde.
     */
    @Column('varchar')
    filename: string | undefined;

    /**
     * Der MIME-Typ der Datei (z. B. „image/jpeg“ oder „application/pdf“).
     */
    @Column('varchar')
    mimetype: string | undefined;

    /**
     * Verknüpft die Datei mit einem Fahrzeug (1:1-Beziehung).
     */
    @OneToOne(() => Auto, (auto) => auto.file)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    /**
     * Binärdaten der Datei (z. B. Bildinhalt als Byte-Array).
     */
    @Column({ type: binaryType })
    data: Uint8Array | undefined;

    /**
     * Gibt eine JSON-Repräsentation der Datei zurück.
     * 
     * Achtung: `data` (Binärinhalt) wird nicht mit ausgegeben.
     *
     * @returns JSON mit `id`, `filename` und `mimetype`
     */
    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            filename: this.filename,
            mimetype: this.mimetype,
        });
}
