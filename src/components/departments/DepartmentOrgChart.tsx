import { motion } from 'framer-motion';
import { DepartmentInfo, DepartmentPosition } from '@/types/organization';
import { User, Users, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DepartmentOrgChartProps {
  department: DepartmentInfo;
}

const PositionNode = ({ 
  position, 
  color, 
  isHead = false,
  children 
}: { 
  position: DepartmentPosition; 
  color: string; 
  isHead?: boolean;
  children?: DepartmentPosition[];
}) => {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-4 rounded-xl border-2 bg-card shadow-md
          ${isHead ? 'min-w-[220px]' : 'min-w-[180px]'}
        `}
        style={{ borderColor: color }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Users className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${isHead ? 'text-base' : 'text-sm'}`}>
              {position.position.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              Nivel: {position.position.level}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{position.employeeCount}</span>
            <span className="text-xs text-muted-foreground">ocupados</span>
          </div>
          {position.vacant > 0 && (
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              {position.vacant} vacante{position.vacant > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </motion.div>

      {children && children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-border" />
          <div className="relative flex gap-6">
            {children.length > 1 && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-border" 
                style={{ width: `calc(100% - 90px)` }} 
              />
            )}
            {children.map((child) => (
              <div key={child.positionId} className="flex flex-col items-center">
                {children.length > 1 && <div className="w-0.5 h-4 bg-border" />}
                <PositionNode position={child} color={color} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const DepartmentOrgChart = ({ department }: DepartmentOrgChartProps) => {
  const headPosition = department.positions.find(p => p.positionId === department.headPosition);
  const directReports = department.positions.filter(p => p.reportsTo === department.headPosition);
  
  // Get positions that report to direct reports
  const getChildPositions = (positionId: string) => {
    return department.positions.filter(p => p.reportsTo === positionId);
  };

  if (!headPosition) return null;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex justify-center min-w-max p-4">
        <div className="flex flex-col items-center">
          <PositionNode 
            position={headPosition} 
            color={department.color} 
            isHead 
            children={directReports.map(dr => ({
              ...dr,
              children: getChildPositions(dr.positionId),
            }))}
          />
        </div>
      </div>
    </div>
  );
};
