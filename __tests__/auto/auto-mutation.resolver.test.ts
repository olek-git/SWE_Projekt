import { beforeAll, describe, expect, inject, test } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type GraphQLQuery, type GraphQLResponseBody } from './graphql.mjs';
import { baseURL, httpsAgent } from '../constants.mjs';

const token = inject('tokenGraphql');
const tokenUser = inject('tokenGraphqlUser');

// T E S T D A T E N
const idLoeschen = '2';

// T E S T S

//Test-Suite
describe('GraphQL Mutations', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Axios initialisieren
    beforeAll(async () => {
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    test('Neues Auto', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const body: GraphQLQuery = {
            query: `
                mutation {
                    create
                        (input: {
                            bezeichnung: "Porsche 911",
                            fahrgestellnummer: "WVWZZZ1JZXW000001",
                            baujahr: 1999,
                            ps: 280,
                            neuKaufpreis: 50000,
                            maxGeschwindigkeit: 250,
                            ausstattung: {
                            klimaanlage: true,
                            sitzheizung: true,
                            getriebe: MANUELL,
                            innenraummaterial: "leder"
                            },
                            markeId: 8
                        }
                    ) {
                        id
                    }
                }
            `
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data).toBeDefined();

        const { create } = data.data!;

        // Der Wert der Mutation ist die generierte ID
        expect(create).toBeDefined();
        expect(create.id).toBeGreaterThan(0);
    });

    test('Auto mit ungueltigen Werten neu anlegen', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const body: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            bezeichnung: 911,
                            fahrgestellnummer: "zu lange fahrgestellnummer",
                            baujahr: "keine Zahl",
                            ps: false,
                            neuKaufpreis: true,
                            maxGeschwindigkeit: "string",
                            ausstattung: {
                            klimaanlage: "kein Boolean",
                            sitzheizung: 5,
                            getriebe: false,
                            innenraummaterial: 10
                            },
                            markeId: 0
                        }
                    )
                }   
            `,
        };
        const expectedMsg = [
            expect.stringMatching(/^bezeichnung /u),
            expect.stringMatching(/^fahrgestellnummer /u),
            expect.stringMatching(/^baujahr /u),
            expect.stringMatching(/^ps /u),
            expect.stringMatching(/^neuKaufpreis /u),
            expect.stringMatching(/^maxGeschwindigkeit /u),
            expect.stringMatching(/^ausstattung.klimaanlage /u),
            expect.stringMatching(/^ausstattung.sitzheizung /u),
            expect.stringMatching(/^ausstattung.getriebe /u),
            expect.stringMatching(/^ausstattung.innenraummaterial /u),
            expect.stringMatching(/^marke /u),
        ];

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
         // then
         expect(status).toBe(HttpStatus.OK);
         expect(headers['content-type']).toMatch(/json/iu);
         expect(data.data!.create).toBeNull();
        
         const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;

        expect(error).toBeDefined();

        const { message } = error;
        const messages: string[] = message.split(',');

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toStrictEqual(expect.arrayContaining(expectedMsg));
    });

    test('Auto aktualisieren', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const body: GraphQLQuery = {
            query: `
                mutation{
                    update(
                        input:{
                            id: "1000"
                            version: 1
                            bezeichnung: "autoupdate"
                            neuKaufpreis: 10000000
                        }
                    ) {
                        version
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        const { update } = data.data!;

        // Der Wert der Mutation ist die neue Versionsnummer
        expect(update.version).toBe(1);
    });

    test('Auto mit ungueltigen Werten aktualisieren', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const id = '40';
        const body: GraphQLQuery = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "${id}",
                            fahrgestellnummer: "zu lange fahrgestellnummer"
                        }                            
                    ) {
                        version
                    }
                }
            `,
        };
        const expectedMsg = [
            expect.stringMatching(/^fahrgestellnummer /u),
        ]

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.update).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message } = error;
        const messages: string[] = message.split(',');

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toStrictEqual(expect.arrayContaining(expectedMsg));
    });

    test('Auto mit nicht vorhandener ID aktualisieren', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const id = '7777777'
        const body: GraphQLQuery = {
            query: `
                mutation{
                    update(
                        input:{
                            id: "${id}",
                            version: 1
                            bezeichnung: "autoupdate"
                            neuKaufpreis: 10000000
                        }
                    ) {
                        version
                    }
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.update).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;

        expect(error).toBeDefined();

        const { message, path, extensions } = error;

        expect(message).toBe(
            `Es gibt kein Auto mit der ID ${id.toLowerCase()}.`,
        );
        expect(path).toBeDefined();
        expect(path![0]).toBe('update');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Auto loeschen', async () => {
        //gegeben
        const authorization = { Authorization: `Bearer ${token}` };
        const body: GraphQLQuery = {
            query: `
                mutation {
                    delete(id: "${idLoeschen}")
                }
            `,
        };

        //wenn
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body, { headers: authorization });

        //dann
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        const deleteMutation = data.data!.delete as boolean;

        expect(deleteMutation).toBe(true);
    });

    test('Auto loeschen als "user"', async () => {
        // given
        const authorization = { Authorization: `Bearer ${tokenUser}` };
        const body: GraphQLQuery = {
            query: `
                mutation {
                    delete(id: "2")
                }
            `,
        };

        // when
        const {
            status,
            headers,
            data,
        }: AxiosResponse<Record<'errors' | 'data', any>> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);

        const { errors } = data as { errors: any[] };

        expect(errors[0].message).toBe('Forbidden resource');
        expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
        expect(data.data.delete).toBeNull();
    });
});
/* eslint-enable @typescript-eslint/no-non-null-assertion */