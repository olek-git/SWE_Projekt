import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AutoReadService} from './service/auto-read.service'
import { AutoWriteService } from './service/auto.write.service';
import { AutoQueryResolver} from './resolver/auto.query.resolver';
import { AutoMutationResolver } from './resolver/auto-mutation.resolver';
import { QueryBuilder } from './service/query-builder';

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