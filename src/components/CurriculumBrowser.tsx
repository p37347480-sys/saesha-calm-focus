import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, BookOpen, Zap, Brain, Puzzle, FileText, Layers } from 'lucide-react';
import { curriculum, type Subject, type Unit, type Topic, type MicroTask } from '@/data/curriculum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CurriculumBrowserProps {
  selectedGrade: 11 | 12;
  onTaskSelect?: (task: MicroTask) => void;
}

const taskTypeIcons = {
  speed: Zap,
  problem_breakdown: Brain,
  puzzle: Puzzle,
  reading: BookOpen,
  flashcard: FileText,
};

const difficultyColors = {
  1: 'bg-success/20 text-success',
  2: 'bg-blue-500/20 text-blue-600',
  3: 'bg-primary/20 text-primary',
  4: 'bg-orange-500/20 text-orange-600',
  5: 'bg-destructive/20 text-destructive',
};

export const CurriculumBrowser = ({ selectedGrade, onTaskSelect }: CurriculumBrowserProps) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const gradeData = curriculum.find(g => g.grade === selectedGrade);
  
  if (!gradeData) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <AnimatePresence mode="wait">
        {(selectedSubject || selectedUnit || selectedTopic) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm flex-wrap"
          >
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedUnit(null);
                setSelectedTopic(null);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Class {selectedGrade}
            </button>
            
            {selectedSubject && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => {
                    setSelectedUnit(null);
                    setSelectedTopic(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedSubject.name}
                </button>
              </>
            )}
            
            {selectedUnit && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedUnit.name}
                </button>
              </>
            )}
            
            {selectedTopic && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{selectedTopic.name}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Selection */}
      {!selectedSubject && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {gradeData.subjects.map((subject) => (
            <motion.div key={subject.id} variants={item}>
              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50 group"
                onClick={() => setSelectedSubject(subject)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shrink-0 group-hover:scale-110 transition-transform duration-300",
                    subject.color
                  )}>
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {subject.units.length} units available
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subject.units.slice(0, 2).map((unit) => (
                        <Badge key={unit.id} variant="secondary" className="text-xs">
                          {unit.name}
                        </Badge>
                      ))}
                      {subject.units.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{subject.units.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Unit Selection */}
      {selectedSubject && !selectedUnit && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {selectedSubject.units.map((unit) => (
            <motion.div key={unit.id} variants={item}>
              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border hover:border-primary/50 group"
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {unit.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {unit.topics.length} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {unit.topics.reduce((acc, t) => acc + t.tasks.length, 0)} tasks
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Topic Selection */}
      {selectedUnit && !selectedTopic && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3"
        >
          {selectedUnit.topics.map((topic) => (
            <motion.div key={topic.id} variants={item}>
              <Card
                className="p-5 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.005] border hover:border-primary/50 group"
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {topic.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {topic.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(topic.tasks.map(t => t.task_type))).map(type => {
                        const Icon = taskTypeIcons[type];
                        return (
                          <Badge key={type} variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {type.replace('_', ' ')}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {topic.tasks.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      tasks
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Task List */}
      {selectedTopic && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3"
        >
          {selectedTopic.tasks.map((task) => {
            const Icon = taskTypeIcons[task.task_type];
            return (
              <motion.div key={task.id} variants={item}>
                <Card
                  className="p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.005] border hover:border-primary/50 group"
                  onClick={() => onTaskSelect?.(task)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h5 className="font-medium group-hover:text-primary transition-colors">
                          {task.prompt}
                        </h5>
                        <Badge className={cn("shrink-0", difficultyColors[task.difficulty])}>
                          L{task.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.metadata.learning_objective}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.ceil(task.estimated_time_seconds / 60)} min
                        </span>
                        <span className="capitalize">
                          {task.task_type.replace('_', ' ')}
                        </span>
                        {task.hints.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {task.hints.length} hints
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
