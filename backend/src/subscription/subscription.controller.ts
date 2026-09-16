import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('me')
  getCurrent(@CurrentUser() user: JwtAccessPayload) {
    return this.subscriptionService.getCurrentSubscription(user.sub);
  }

  @Get('usage')
  getUsage(@CurrentUser() user: JwtAccessPayload) {
    return this.subscriptionService.getCurrentUsage(user.sub);
  }

  @Post(':planId')
  subscribe(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
  ) {
    return this.subscriptionService.subscribe(user.sub, planId);
  }

  @Patch('me/cancel')
  cancel(@CurrentUser() user: JwtAccessPayload) {
    return this.subscriptionService.cancelAtPeriodEnd(user.sub);
  }
}
