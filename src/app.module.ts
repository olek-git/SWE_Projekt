import { type ApolloDriverConfig } from '@nestjs/apollo';
import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { AdminModule } from './admin/admin.module.js';
import { DevModule } from './config/dev/dev.module.js';
import { typeOrmModuleOptions } from './config/typeormOptions.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { KeycloakModule } from './security/keycloak/keycloak.module.js';
import { AutoModule } from './auto/auto.module.js';
import { graphQlModuleOptions } from './config/graphql.js';
import { AutoWriteController } from './auto/controller/auto-write.controller.js';
import { AutoGetController } from './auto/controller/auto-get.controller.js';

/**
 * Das `AppModule` ist das zentrale Modul der Anwendung, das alle anderen Module und deren Abhängigkeiten zusammenführt.
 * Es konfiguriert die grundlegenden Funktionalitäten der Anwendung, einschließlich der Verbindung zur Datenbank,
 * GraphQL-Server, Sicherheitsmechanismen und Logging.
 *
 * In diesem Modul werden alle notwendigen Module importiert, wie das Admin-, Auto- und Keycloak-Modul.
 * Zudem wird die GraphQL-Konfiguration vorgenommen und eine Middleware für das Logging von Anfragen gesetzt.
 */
@Module({
    imports: [
        AdminModule,
        AutoModule,
        DevModule,
        GraphQLModule.forRoot<ApolloDriverConfig>(graphQlModuleOptions),
        LoggerModule,
        KeycloakModule,
        TypeOrmModule.forRoot(typeOrmModuleOptions),
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes(
                AutoGetController,
                AutoWriteController,
                'auth',
                'graphql',
            );
    }
}
