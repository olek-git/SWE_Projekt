import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import path from 'node:path';
import { RESOURCES_DIR } from './app.js';

const schemaGraphQL = path.join(RESOURCES_DIR, 'graphql', 'schema.graphql');
console.debug('schemaGraphQL = %s', schemaGraphQL);

/**
 * Das Konfigurationsobjekt für GraphQL (siehe src\app.module.ts).
 */
export const graphQlModuleOptions: ApolloDriverConfig = {
    typePaths: [schemaGraphQL],
    driver: ApolloDriver,
    playground: false,
};
