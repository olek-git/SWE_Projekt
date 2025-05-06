import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities.js';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AutoReadService } from './service/auto-read.service.js';
import { AutoWriteService } from './service/auto.write.service.js';
import { AutoQueryResolver } from './resolver/auto.query.resolver.js';
import { AutoMutationResolver } from './resolver/auto-mutation.resolver.js';
import { QueryBuilder } from './service/query-builder.js';
import { AutoGetController } from './controller/auto-get.controller.js';
import { AutoWriteController } from './controller/auto-write.controller.js';

/**
 * Das Modul `AutoModule` bündelt alle Komponenten, die für die Verwaltung von Autos zuständig sind.
 * Es enthält die zugehörigen Services, Resolver und stellt die Verbindung zur Datenbank mithilfe von TypeORM bereit.
 * 
 * Das Modul ist verantwortlich für die Lese- und Schreiboperationen sowie die Bearbeitung von Autodaten. 
 * Es enthält auch die Resolver für GraphQL-Queries und -Mutationen sowie die Konfiguration von Keycloak für die Authentifizierung.
 */
@Module({
    imports: [KeycloakModule, MailModule, TypeOrmModule.forFeature(entities)],
    controllers: [AutoGetController, AutoWriteController],
    providers: [
        AutoReadService,
        AutoWriteService,
        AutoQueryResolver,
        AutoMutationResolver,
        QueryBuilder,
    ],
    exports: [AutoReadService, AutoWriteService],
})
export class AutoModule {}
