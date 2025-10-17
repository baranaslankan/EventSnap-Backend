import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const photographer = await this.prisma.photographer.findUnique({
            where: { email },
        })

        if (!photographer) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, photographer.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: photographer.id, email: photographer.email };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            photographer: {
                id: photographer.id,
                email: photographer.email,
                name: photographer.name,
            },
        }
    }
}
