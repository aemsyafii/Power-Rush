import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { FileText, Filter, Search, Download, Trash2 } from 'lucide-react';
import { GameLog, LogFilter, TimeFilter } from '../types';
import { filterLogs, exportLogsToCSV } from '../utils';
import { FILTER_OPTIONS, ADMIN_MESSAGES, ADMIN_CONSTANTS } from '../constants';

interface GameLogsProps {
  logs: GameLog[];
  onClearLogs: () => void;
}

export function GameLogs({ logs, onClearLogs }: GameLogsProps) {
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportLogs = () => {
    const filtered = filterLogs(logs, logFilter, searchTerm, timeFilter);
    exportLogsToCSV(filtered, `analytics-logs-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleClearLogs = () => {
    if (confirm(ADMIN_MESSAGES.CONFIRM_RESET_LOGS)) {
      onClearLogs();
    }
  };

  const filteredLogs = filterLogs(logs, logFilter, searchTerm, timeFilter);

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Game Logs & History
        </CardTitle>
        <p className="text-gray-600">
          Riwayat permainan dengan detail player dan device tracking
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Label className="text-gray-800">Result:</Label>
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value as LogFilter)}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
            >
              {FILTER_OPTIONS.LOG_FILTERS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-gray-800">Time:</Label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
            >
              {FILTER_OPTIONS.TIME_FILTERS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 flex-1 min-w-64">
            <Search className="w-4 h-4 text-gray-600" />
            <Input
              type="text"
              placeholder="Cari nama pemain atau device ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-2 border-gray-300"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              className="border-2 border-green-300 text-green-700 hover:bg-green-50"
              disabled={filteredLogs.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            
            <Button
              onClick={handleClearLogs}
              variant="outline"
              className="border-2 border-red-300 text-red-700 hover:bg-red-50"
              disabled={logs.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Logs Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-semibold">Filtered</p>
            <p className="text-xl font-bold text-blue-900">{filteredLogs.length}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800 font-semibold">Total</p>
            <p className="text-xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold">Wins</p>
            <p className="text-xl font-bold text-green-900">{filteredLogs.filter(log => log.result === 'win').length}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800 font-semibold">Losses</p>
            <p className="text-xl font-bold text-red-900">{filteredLogs.filter(log => log.result === 'loss').length}</p>
          </div>
        </div>

        {/* Logs Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">
              Game History ({filteredLogs.length} results)
            </h4>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-gray-200">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">
                {logs.length === 0 
                  ? 'Belum ada game logs' 
                  : 'Tidak ada logs yang sesuai dengan filter'
                }
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {filteredLogs.slice(0, ADMIN_CONSTANTS.MAX_LOGS_DISPLAY).map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Player:</p>
                          <p className="text-gray-900 font-semibold">{log.playerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Device ID:</p>
                          <p className="text-gray-900 font-mono">{log.deviceId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Result:</p>
                          <Badge 
                            variant={log.result === 'win' ? 'default' : 'destructive'}
                            className={log.result === 'win' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}
                          >
                            {log.result === 'win' ? '🏆 Win' : '😔 Loss'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Time:</p>
                          <p className="text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200 text-sm">
                        <div>
                          <p className="text-gray-600">Power: <span className="font-semibold text-gray-900">{log.batteryLevel}%</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration: <span className="font-semibold text-gray-900">{log.gameDuration}s</span></p>
                        </div>
                        {log.prizeNumber && (
                          <div>
                            <p className="text-gray-600">Prize #: 
                              <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded ml-1">
                                {log.prizeNumber}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredLogs.length > ADMIN_CONSTANTS.MAX_LOGS_DISPLAY && (
                    <div className="p-4 text-center bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        Showing {ADMIN_CONSTANTS.MAX_LOGS_DISPLAY} of {filteredLogs.length} logs. Use filters to narrow results.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}