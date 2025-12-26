import { motion } from 'framer-motion';
import { User, ChevronDown, Users, Briefcase } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DEPARTMENTS, Department } from '@/types/attendance';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Employee {
  id: string;
  name: string;
  position: string | null;
  department: string;
  email: string | null;
  avatar_url: string | null;
  user_id: string | null;
  status: string | null;
}

interface Position {
  id: string;
  position_name: string;
  department: string;
  max_positions: number;
  current_count: number;
  is_leadership: boolean;
  reports_to: string | null;
  description: string | null;
}

interface RealOrgChartProps {
  employees: Employee[];
  positions: Position[];
}

interface OrgNode {
  position: Position;
  employees: Employee[];
  children: OrgNode[];
}

const OrgNodeCard = ({ 
  node, 
  isRoot = false,
  color 
}: { 
  node: OrgNode; 
  isRoot?: boolean;
  color: string;
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const hasEmployees = node.employees.length > 0;
  const vacancies = Math.max(0, node.position.max_positions - node.employees.length);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          relative p-4 rounded-xl border-2 bg-card shadow-lg cursor-pointer
          transition-all duration-300 hover:shadow-xl
          ${isRoot ? 'min-w-[240px]' : 'min-w-[200px]'}
        `}
        style={{ borderColor: color }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Position Header */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Briefcase className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${isRoot ? 'text-base' : 'text-sm'}`}>
              {node.position.position_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {node.employees.length}/{node.position.max_positions} ocupados
            </p>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          )}
        </div>

        {/* Employees in this position */}
        {hasEmployees ? (
          <div className="space-y-2 pt-2 border-t">
            {node.employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={emp.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {emp.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                </div>
                {emp.user_id && (
                  <Badge variant="outline" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">
                    ✓ Vinculado
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground italic text-center">Sin empleados asignados</p>
          </div>
        )}

        {/* Vacancies indicator */}
        {vacancies > 0 && (
          <Badge 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px]"
            variant="outline"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}10`, color }}
          >
            {vacancies} vacante{vacancies > 1 ? 's' : ''}
          </Badge>
        )}
      </motion.div>

      {hasChildren && expanded && (
        <>
          <div className="w-0.5 h-6 bg-border" />
          <div className="relative flex gap-4 flex-wrap justify-center">
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-border" 
                style={{ width: `calc(100% - 100px)` }} 
              />
            )}
            {node.children.map((child) => (
              <div key={child.position.id} className="flex flex-col items-center">
                {node.children.length > 1 && <div className="w-0.5 h-4 bg-border" />}
                <OrgNodeCard node={child} color={color} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const RealOrgChart = ({ employees, positions }: RealOrgChartProps) => {
  // Build org tree from positions and employees
  const orgTree = useMemo(() => {
    // Group by department
    const departmentTrees: Record<string, OrgNode[]> = {};

    Object.keys(DEPARTMENTS).forEach((dept) => {
      const deptPositions = positions.filter(p => p.department === dept);
      const deptEmployees = employees.filter(e => e.department === dept && e.status === 'active');

      // Build position nodes
      const positionNodes: Map<string, OrgNode> = new Map();
      
      deptPositions.forEach(pos => {
        const posEmployees = deptEmployees.filter(e => 
          e.position?.toLowerCase() === pos.position_name.toLowerCase()
        );
        positionNodes.set(pos.position_name, {
          position: pos,
          employees: posEmployees,
          children: [],
        });
      });

      // Build tree structure
      const rootNodes: OrgNode[] = [];
      
      deptPositions.forEach(pos => {
        const node = positionNodes.get(pos.position_name);
        if (!node) return;

        if (pos.reports_to) {
          const parentNode = positionNodes.get(pos.reports_to);
          if (parentNode) {
            parentNode.children.push(node);
          } else {
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      });

      if (rootNodes.length > 0) {
        departmentTrees[dept] = rootNodes;
      }
    });

    return departmentTrees;
  }, [employees, positions]);

  const departmentsWithData = Object.entries(orgTree).filter(([_, nodes]) => nodes.length > 0);

  if (departmentsWithData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No hay datos de organigrama disponibles. Configure los puestos y vincule empleados.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {departmentsWithData.map(([dept, rootNodes]) => {
        const deptInfo = DEPARTMENTS[dept as Department];
        const color = deptInfo?.color || 'hsl(var(--primary))';

        return (
          <div key={dept} className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Users className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{deptInfo?.name || dept}</h3>
                <p className="text-sm text-muted-foreground">
                  {employees.filter(e => e.department === dept && e.status === 'active').length} empleados
                </p>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-6">
              <div className="flex justify-center min-w-max p-4 gap-8">
                {rootNodes.map((node) => (
                  <OrgNodeCard 
                    key={node.position.id} 
                    node={node} 
                    isRoot 
                    color={color}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
