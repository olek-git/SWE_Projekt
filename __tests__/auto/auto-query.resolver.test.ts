import { type GraphQLRequest } from '@apollo/server';
import { beforeAll, describe, expect, test } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type GraphQLResponseBody } from './graphql.mjs';
import { baseURL, httpsAgent } from '../constants.mjs';
import { AutoDTO } from '../../src/auto/resolver/autoDTO.js';

//T E S T D A T E N
const idVorhanden = '2';

const bezeichnungVorhanden = 'Porsche Panamera';
const teilBezeichnungVorhanden = 'Mercedes';
const teilBezeichnungNichtVorhanden = 'Mustang';


// T E S T S
describe('GraphQL Queries', () => {
    let client : AxiosInstance;
    const graphqlPath = 'graphql';

    //Axios einlesen
    beforeAll(async () => {
        const baseUrlGraphQL = `${baseURL}/`;
        client = axios.create({
            baseURL : baseUrlGraphQL,
            httpsAgent,
            validateStatus: () => true
        });
    });

    test.concurrent('Auto zu vorhandener ID', async () => {
        //gegeben
        const body : GraphQLRequest = {
            query : `
                {
                    auto(id: "${idVorhanden}) {
                        version
                        bezeichnung
                        fahrgestellnummer
                        baujahr
                        ps
                        neuKaufpreis
                        maxGeschwindigkeit
                        ausstattung {
                            klimaanlage
                            sitzheizung
                            getriebe
                            innenraummaterial
                        }
                        marke {
                            name
                            gruendungsjahr
                            gruender
                        }
                    }
                }
            `,  
        };

        //wenn
        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);
        
        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();
    });

    test.concurrent('Auto zu nicht-vorhandener ID', async () => {
        //gegeben
        const id = '777777'
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${id}") {
                        ausstattung {
                            klimaanlage
                            sitzheizung
                            getriebe
                            innenraummaterial
                        }                        
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.auto).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt kein Auto mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('auto');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test.concurrent('Auto zu vorhandener Bezeichnung', async () => {
        //gegeben
        const body : GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        bezeichnung: "${bezeichnungVorhanden}"
                    }) {
                        bezeichnung
                        fahrgestellnummer
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };
        
        expect(autos).not.toHaveLength(0);
        expect(autos).toHaveLength(1);

        const [auto] = autos;
        
        expect(auto!.bezeichnung).toBe(bezeichnungVorhanden);
    });

    test.concurrent('Auto zu vorhandener Teil-Bezeichnung', async () => {
        //gegeben
        const body : GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        bezeichnung: "${teilBezeichnungVorhanden}"
                    }) {
                        bezeichnung
                        fahrgestellnummer
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };
        
        expect(autos).not.toHaveLength(0);
        autos
            .map((auto) => auto.bezeichnung)
            .forEach((bezeichnung) =>
                expect(bezeichnung).toStrictEqual(
                    expect.stringContaining(teilBezeichnungVorhanden),
                ),
            );
    });
    
    test.concurrent('Auto zu nicht vorhandener Bezeichnung', async () => {
        //gegeben
        const body : GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        bezeichnung: "${teilBezeichnungNichtVorhanden}"
                    }) {
                        bezeichnung
                        fahrgestellnummer
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);
        
        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.autos).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Autos gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('autos');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
})
