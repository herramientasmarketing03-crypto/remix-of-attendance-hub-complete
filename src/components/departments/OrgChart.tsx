import { motion } from 'framer-motion';
import { OrgChartNode } from '@/types/organization';
import { DEPARTMENTS, Department } from '@/types/attendance';
import { User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface OrgChartProps {
  node: OrgChartNode;
  isRoot?: boolean;
}

const OrgNodeCard = ({ node, isRoot = false }: OrgChartProps) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const deptColor = node.department ? DEPARTMENTS[node.department as Department]?.color : 'hsl(var(--primary))';

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          relative p-4 rounded-xl border-2 bg-card shadow-lg cursor-pointer
          transition-all duration-300 hover:shadow-xl
          ${isRoot ? 'min-w-[200px]' : 'min-w-[160px]'}
        `}
        style={{ borderColor: deptColor }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${deptColor}20` }}
          >
            <User className="w-5 h-5" style={{ color: deptColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${isRoot ? 'text-base' : 'text-sm'}`}>
              {node.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{node.position}</p>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          )}
        </div>
        {node.department && (
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ backgroundColor: deptColor, color: 'white' }}
          >
            {DEPARTMENTS[node.department as Department]?.name}
          </div>
        )}
      </motion.div>

      {hasChildren && expanded && (
        <>
          <div className="w-0.5 h-6 bg-border" />
          <div className="relative flex gap-4">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-border" 
                style={{ width: `calc(100% - 80px)` }} 
              />
            )}
            {node.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {node.children!.length > 1 && <div className="w-0.5 h-4 bg-border" />}
                <OrgNodeCard node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface CompanyOrgChartProps {
  rootNode: OrgChartNode;
  title?: string;
}

export const CompanyOrgChart = ({ rootNode, title }: CompanyOrgChartProps) => {
  return (
    <div className="w-full overflow-x-auto pb-6">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-6">{title}</h3>
      )}
      <div className="flex justify-center min-w-max p-4">
        <OrgNodeCard node={rootNode} isRoot />
      </div>
    </div>
  );
};
