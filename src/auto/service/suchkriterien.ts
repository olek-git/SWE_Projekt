import { getriebeArt } from '../../../src/auto/entity/ausstattung.entity.js';
/**
 * Das Modul besteht aus der Klasse {@linkcode Suchkriterien}.
 * @packageDocumentation
 */

/**
 * Typdefinition für `find` in `auto-read.service` und `QueryBuilder.build()`.
 */
export interface Suchkriterien{
    readonly bezeichnung? : string;
    readonly baujahr? : number;
    readonly ps? : number;
    readonly maxGeschwindigkeit? : number;
    readonly marke? : string;
    readonly getriebeArt? : getriebeArt
}