import { motion } from 'framer-motion';
import { UploadedReport } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Check, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentUploadsProps {
  reports: UploadedReport[];
}

const statusConfig = {
  processing: { icon: Loader2, label: 'Procesando', className: 'bg-warning/10 text-warning animate-spin' },
  completed: { icon: Check, label: 'Completado', className: 'bg-success/10 text-success' },
  error: { icon: AlertCircle, label: 'Error', className: 'bg-destructive/10 text-destructive' },
};

export function RecentUploads({ reports }: RecentUploadsProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Reportes Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report, index) => {
            const status = statusConfig[report.status];
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.uploadedAt), "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {report.recordCount} registros
                  </Badge>
                  <div className={`p-1.5 rounded-full ${status.className}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
