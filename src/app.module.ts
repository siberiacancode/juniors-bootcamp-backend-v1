import type { ApolloDriverConfig } from '@nestjs/apollo';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'node:path';

import { CarsModule } from '@/modules/cars/cars.module';
import { CinemaModule } from '@/modules/cinema/cinema.module';
import { DeliveryModule } from '@/modules/delivery/delivery.module';
import { GamesModule } from '@/modules/games/games.module';
import { OtpsModule } from '@/modules/otps/otps.module';
import { PizzaModule } from '@/modules/pizza/pizza.module';
import { TesterModule } from '@/modules/tester';
import { UsersModule } from '@/modules/users/users.module';

import { AppController } from './app.controller';
import { CronModule } from './modules/cron';
import { withBaseUrl } from './utils/helpers';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/static/locales/'),
        watch: true
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver]
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL, { dbName: 'juniors-bootcamp-v1' }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      useGlobalPrefix: true,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      formatError: (error: any) => {
        const graphQLFormattedError = {
          message: error.extensions?.exception?.response?.message || error.message,
          code: error.extensions?.code || 'SERVER_ERROR',
          name: error.extensions?.exception?.name || error.name
        };
        return graphQLFormattedError;
      },
      context: ({ req, res }) => ({ req, res })
    }),
    ServeStaticModule.forRoot({
      serveRoot: withBaseUrl('/static'),
      rootPath: path.join(__dirname, '/static')
    }),
    OtpsModule,
    UsersModule,
    CinemaModule,
    DeliveryModule,
    CarsModule,
    GamesModule,
    PizzaModule,
    TesterModule,
    CronModule
  ],
  providers: []
})
export class AppModule {}
