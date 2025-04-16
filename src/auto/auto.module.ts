import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities.js';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AutoReadService} from './service/auto-read.service.js'
import { AutoWriteService } from './service/auto.write.service.js';
import { AutoQueryResolver} from './resolver/auto.query.resolver.js';
import { AutoMutationResolver } from './resolver/auto-mutation.resolver.js';
import { QueryBuilder } from './service/query-builder.js';

@Module({
    imports: [KeycloakModule, MailModule,TypeOrmModule.forFeature(entities)],
    providers: [
        AutoReadService,
        AutoWriteService,
        AutoQueryResolver,
        AutoMutationResolver,
        QueryBuilder,
    ],
    exports: [AutoReadService, AutoWriteService],
})
export class AutoModule{}