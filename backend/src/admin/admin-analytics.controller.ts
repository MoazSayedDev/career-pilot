import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAnalyticsController {
  constructor(
    private readonly adminAnalyticsService: AdminAnalyticsService,
  ) {}

  @Get('overview')
  getOverview() {
    return this.adminAnalyticsService.getOverview();
  }

  @Get('users')
  getAllUsers() {
    return this.adminAnalyticsService.getAllUsers();
  }

  @Get('users/verified')
  getVerifiedUsers() {
    return this.adminAnalyticsService.getVerifiedUsers();
  }

  @Get('users/unverified')
  getUnverifiedUsers() {
    return this.adminAnalyticsService.getUnverifiedUsers();
  }
}