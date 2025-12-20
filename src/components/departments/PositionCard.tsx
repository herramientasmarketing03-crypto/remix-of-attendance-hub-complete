import { motion } from 'framer-motion';
import { DepartmentPosition } from '@/types/organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  CheckCircle2, 
  GraduationCap, 
  ListChecks,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PositionCardProps {
  position: DepartmentPosition;
  color: string;
  index: number;
}

export const PositionCard = ({ position, color, index }: PositionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { position: pos } = position;

  const levelColors: Record<string, string> = {
    gerente: 'bg-destructive/10 text-destructive',
    jefe: 'bg-primary/10 text-primary',
    coordinador: 'bg-info/10 text-info',
    supervisor: 'bg-warning/10 text-warning',
    senior: 'bg-success/10 text-success',
    junior: 'bg-muted text-muted-foreground',
    practicante: 'bg-secondary text-secondary-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Briefcase className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <CardTitle className="text-base">{pos.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={levelColors[pos.level] || levelColors.junior}>
                      {pos.level.charAt(0).toUpperCase() + pos.level.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{position.employeeCount}</span>
                    </div>
                    {position.vacant > 0 && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {position.vacant} vacante{position.vacant > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-muted-foreground">{pos.description}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4" style={{ color }} />
                    <span className="text-sm font-medium">Requisitos</span>
                  </div>
                  <ul className="space-y-1">
                    {pos.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4" style={{ color }} />
                    <span className="text-sm font-medium">Responsabilidades</span>
                  </div>
                  <ul className="space-y-1">
                    {pos.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
};
