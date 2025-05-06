// Copyright (C) 2024 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Die Standardgröße für eine Seite.
 * Wird verwendet, wenn die Seitengröße nicht angegeben oder ungültig ist.
 */
export const DEFAULT_PAGE_SIZE = 5;
/**
 * Die maximale Anzahl von Elementen pro Seite.
 * Diese Grenze sollte nicht überschritten werden.
 */
export const MAX_PAGE_SIZE = 100;
/**
 * Die Standardseite (Seite 0).
 * Wird verwendet, wenn die Seitennummer nicht angegeben oder ungültig ist.
 */
export const DEFAULT_PAGE_NUMBER = 0;

/**
 * Ein Typ, der die Seitenangabe und die Seitengröße enthält.
 * Wird verwendet, um Seiteninformationen für paginierte API-Anfragen zu beschreiben.
 */
export type Pageable = {
    readonly number: number;
    readonly size: number;
};

type PageableProps = {
    readonly number?: string;
    readonly size?: string;
};

/**
 * Erzeugt ein `Pageable`-Objekt aus den optionalen Parametern `number` und `size`.
 * 
 * - Falls keine gültige Seitenzahl oder Seitengröße angegeben wird, wird auf die Standardwerte `DEFAULT_PAGE_NUMBER` und `DEFAULT_PAGE_SIZE` zurückgegriffen.
 * - Die Seitenzahl wird um 1 verringert (weil die erste Seite mit der Zahl 0 beginnt).
 * - Die Seitengröße wird auf `DEFAULT_PAGE_SIZE` gesetzt, wenn sie kleiner als 1 oder größer als `MAX_PAGE_SIZE` ist.
 * 
 * @param params Die optionalen Parameter `number` und `size`, die als Strings übergeben werden.
 * @returns Ein `Pageable`-Objekt, das die Seitenzahl und Seitengröße enthält.
 */
export function createPageable({ number, size }: PageableProps): Pageable {
    let numberFloat = Number(number);
    let numberInt: number;
    if (isNaN(numberFloat) || !Number.isInteger(numberFloat)) {
        numberInt = DEFAULT_PAGE_NUMBER;
    } else {
        numberInt = numberFloat - 1;
        if (numberInt < 0) {
            numberInt = DEFAULT_PAGE_NUMBER;
        }
    }

    let sizeFloat = Number(size);
    let sizeInt: number;
    if (isNaN(sizeFloat) || !Number.isInteger(sizeFloat)) {
        sizeInt = DEFAULT_PAGE_SIZE;
    } else {
        sizeInt = sizeFloat;
        if (sizeInt < 1 || sizeInt > MAX_PAGE_SIZE) {
            sizeInt = DEFAULT_PAGE_NUMBER;
        }
    }

    return { number: numberInt, size: sizeInt };
}
