import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { FileText, Trophy, UserX, Users } from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsOverviewProps {
  analytics: AnalyticsData;
}

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Games</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalGames}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Wins</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalWins}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Losses</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalLosses}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Devices</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.uniqueDevices}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}