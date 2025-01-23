import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from './firebase.controller';
import { ConfigModule } from "@nestjs/config";


@Module({
    imports: [ConfigModule],
    providers: [FirebaseService],
    exports: [FirebaseService],
    controllers: [FirebaseController]
})
export class FirebaseModule {}