import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';

/**
 * Monolito restante na fase do grupo atomico (Transacoes / s1).
 *
 * Mantem apenas autenticacao, usuarios (para o handshake do socket) e o tempo
 * real. Leiloes, lances, cartas e o worker estao no servico atomico.
 */
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    RealtimeModule,
  ],
})
export class AppModule {}
