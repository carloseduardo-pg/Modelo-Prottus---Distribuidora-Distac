import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

/** Healthcheck mínimo da API Distac (sem rate limit). */
@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Healthcheck (sem auth / sem throttle)' })
  check() {
    return { status: 'ok', service: 'distac-api' };
  }
}
