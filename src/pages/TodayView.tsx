import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, TrendingUp, Sparkles, Brain, CheckCircle2, Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  subject: string;
  title: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  isMain?: boolean;
  reason: string;
  completed?: boolean;
}

// Generar tareas dinámicamente basadas en las materias del usuario
const generateTasksFromSubjects = (subjects: string[]): Task[] => {
  const taskTemplates = [
    { title: 'Repasar conceptos clave', time: '45 min', priority: 'high' as const, reason: 'Tu examen es en 3 días y este tema tiene más peso' },
    { title: 'Practicar ejercicios', time: '30 min', priority: 'high' as const, reason: 'Necesitás reforzar este tema según tu progreso' },
    { title: 'Revisar material nuevo', time: '25 min', priority: 'medium' as const, reason: 'Material nuevo para cubrir antes del fin de semana' },
    { title: 'Resolver problemas prácticos', time: '35 min', priority: 'medium' as const, reason: 'Continuación lógica del tema anterior' }
  ];

  const tasks: Task[] = [];
  subjects.forEach((subject, subjectIndex) => {
    const template = taskTemplates[subjectIndex % taskTemplates.length];
    tasks.push({
      id: `${subjectIndex + 1}`,
      subject: subject.trim(),
      title: template.title,
      estimatedTime: template.time,
      priority: template.priority,
      isMain: subjectIndex === 0,
      reason: template.reason,
      completed: false
    });
  });

  return tasks;
};

// Colores dinámicos por materia
const colorOptions = [
  { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'border-blue-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'border-emerald-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', accent: 'border-amber-200' },
  { bg: 'bg-purple-50', text: 'text-purple-700', accent: 'border-purple-200' },
  { bg: 'bg-pink-50', text: 'text-pink-700', accent: 'border-pink-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', accent: 'border-cyan-200' }
];

const getSubjectColor = (subject: string, index: number) => {
  return colorOptions[index % colorOptions.length];
};

const getInitialTasks = (): Task[] => {
  const storedData = localStorage.getItem('studyflow-data');
  if (storedData) {
    const data = JSON.parse(storedData);
    if (data.subjects) {
      const subjects = data.subjects.split(',').filter((s: string) => s.trim().length > 0);
      if (subjects.length > 0) {
        return generateTasksFromSubjects(subjects);
      }
    }
  }
  // Fallback si no hay datos
  return [];
};

interface ExamInfo {
  subject: string;
  name: string;
  date: string;
  daysUntil: number;
}

type ExamViewMode = 'list' | 'calendar';

export function TodayView() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [subjectColors, setSubjectColors] = useState<Record<string, { bg: string; text: string; accent: string }>>({});
  const [upcomingExams, setUpcomingExams] = useState<ExamInfo[]>([]);
  const [examViewMode, setExamViewMode] = useState<ExamViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Inicializar tareas y colores
  useEffect(() => {
    const initialTasks = getInitialTasks();
    const completed = JSON.parse(localStorage.getItem('studyflow-completed') || '[]');

    const tasksWithCompletion = initialTasks.map(task => ({
      ...task,
      completed: completed.includes(task.id)
    }));

    setTasks(tasksWithCompletion);

    // Asignar colores a materias
    const colors: Record<string, { bg: string; text: string; accent: string }> = {};
    const uniqueSubjects = Array.from(new Set(initialTasks.map(t => t.subject)));
    uniqueSubjects.forEach((subject, index) => {
      colors[subject] = getSubjectColor(subject, index);
    });
    setSubjectColors(colors);

    // Cargar exámenes
    const storedData = localStorage.getItem('studyflow-data');
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.exams) {
        const allExams: ExamInfo[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.entries(data.exams).forEach(([subject, exams]) => {
          (exams as Array<{ name: string; date: string }>).forEach(exam => {
            if (exam.date) {
              const examDate = new Date(exam.date);
              examDate.setHours(0, 0, 0, 0);
              const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              allExams.push({
                subject,
                name: exam.name,
                date: exam.date,
                daysUntil
              });
            }
          });
        });

        // Ordenar por fecha
        allExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingExams(allExams);
      }
    }

    // Mostrar feedback si venimos de completar una tarea
    const justCompleted = localStorage.getItem('studyflow-just-completed');
    if (justCompleted) {
      setFeedbackMessage('¡Excelente! Buen progreso. Seguimos con esto →');
      setShowFeedback(true);
      localStorage.removeItem('studyflow-just-completed');

      setTimeout(() => setShowFeedback(false), 3000);
    }
  }, []);

  const handleStartTask = (taskId: string) => {
    navigate(`/focus/${taskId}`);
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed).length;
  const totalToday = tasks.length;
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Auto-destacar la primera tarea activa
  const tasksWithMain = activeTasks.map((task, index) => ({
    ...task,
    isMain: index === 0
  }));

  // Helper para generar días del calendario
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, monthIndex, day));
    }

    return days;
  };

  // Helper para obtener exámenes de un día específico
  const getExamsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return upcomingExams.filter(exam => exam.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Feedback flotante */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/50 flex items-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">{feedbackMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Hoy
                </h1>
                <Sparkles className="w-6 h-6 text-fuchsia-500" />
              </div>
              <p className="text-muted-foreground">Miércoles, 13 de Mayo</p>
            </div>
            <button
              onClick={() => navigate('/progress')}
              className="p-3 rounded-xl hover:bg-white/50:bg-white/10 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </button>
          </div>

          {/* Calendario de Exámenes */}
          {upcomingExams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-purple-700">Próximos Exámenes</h3>
                </div>

                {/* Toggle View */}
                <div className="flex items-center gap-1 bg-purple-100 rounded-lg p-1">
                  <button
                    onClick={() => setExamViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      examViewMode === 'list'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">Lista</span>
                  </button>
                  <button
                    onClick={() => setExamViewMode('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      examViewMode === 'calendar'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Calendario</span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {examViewMode === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {upcomingExams.map((exam, index) => {
                      const colors = subjectColors[exam.subject] || colorOptions[0];
                      const isPast = exam.daysUntil < 0;
                      const isToday = exam.daysUntil === 0;
                      const isUrgent = exam.daysUntil > 0 && exam.daysUntil <= 3;

                      return (
                        <motion.div
                          key={`${exam.subject}-${exam.date}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                            isPast
                              ? 'bg-gray-50 border-gray-300 opacity-60'
                              : isToday
                              ? 'bg-red-50 border-red-400'
                              : isUrgent
                              ? 'bg-orange-50 border-orange-300'
                              : `${colors.bg} ${colors.accent}`
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                                {exam.subject}
                              </span>
                              {isToday && (
                                <span className="inline-block px-2 py-0.5 rounded bg-red-500 text-white text-xs font-bold">
                                  HOY
                                </span>
                              )}
                              {isUrgent && !isToday && (
                                <span className="inline-block px-2 py-0.5 rounded bg-orange-500 text-white text-xs font-semibold">
                                  URGENTE
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-sm mb-1">{exam.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(exam.date).toLocaleDateString('es-AR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-lg font-bold ${
                              isPast ? 'text-gray-400' : isToday ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-purple-600'
                            }`}>
                              {isPast
                                ? 'Pasado'
                                : isToday
                                ? 'Hoy'
                                : exam.daysUntil === 1
                                ? 'Mañana'
                                : `${exam.daysUntil} días`
                              }
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={previousMonth}
                        className="p-2 rounded-lg hover:bg-purple-100:bg-purple-950/30 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h4 className="font-semibold">
                        {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-purple-100:bg-purple-950/30 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}

                      {generateCalendarDays(currentMonth).map((date, index) => {
                        if (!date) {
                          return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const examsForDay = getExamsForDate(date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isToday = date.getTime() === today.getTime();

                        return (
                          <motion.div
                            key={date.toISOString()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className={`aspect-square border rounded-lg p-1 ${
                              isToday
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className={`text-xs font-medium mb-1 ${isToday ? 'text-purple-700' : ''}`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-0.5">
                              {examsForDay.slice(0, 2).map((exam, examIndex) => {
                                const colors = subjectColors[exam.subject] || colorOptions[0];
                                return (
                                  <div
                                    key={examIndex}
                                    className={`text-[10px] px-1 py-0.5 rounded ${colors.bg} ${colors.text} truncate leading-tight`}
                                    title={`${exam.subject}: ${exam.name}`}
                                  >
                                    {exam.subject}
                                  </div>
                                );
                              })}
                              {examsForDay.length > 2 && (
                                <div className="text-[9px] text-muted-foreground px-1">
                                  +{examsForDay.length - 2}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* AI Decision Message */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 mb-6 shadow-xl shadow-purple-500/20"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-1">Organizamos tu día</h3>
                <p className="text-white/90 text-sm">
                  {activeTasks.length > 0
                    ? `Priorizamos ${activeTasks.length} tareas según tus exámenes y progreso. Solo seguí el orden.`
                    : '¡Completaste todo por hoy! Excelente trabajo.'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-white text-sm">
                <span>Progreso de hoy</span>
                <span>{completedToday}/{totalToday} completadas</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full shadow-lg"
                />
              </div>
            </div>
          </motion.div>

          {/* Task List */}
          <AnimatePresence mode="popLayout">
            {tasksWithMain.length > 0 ? (
              <div className="space-y-4">
                {tasksWithMain.map((task, index) => {
                  const colors = subjectColors[task.subject] || colorOptions[0];
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        height: 0,
                        marginBottom: 0,
                        transition: { duration: 0.3 }
                      }}
                      transition={{ delay: 0.05 * index, layout: { duration: 0.3 } }}
                      onClick={() => handleStartTask(task.id)}
                      className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] ${
                        task.isMain
                          ? 'border-purple-400 ring-4 ring-purple-100 shadow-lg'
                          : `${colors.accent} hover:border-purple-300`
                      }`}
                    >
                      {task.isMain && (
                        <motion.div
                          layout
                          className="flex items-center gap-2 mb-4 bg-purple-50 -mx-6 -mt-6 px-6 py-3 rounded-t-2xl border-b-2 border-purple-200"
                        >
                          <AlertCircle className="w-5 h-5 text-purple-600" />
                          <span className="text-purple-600 font-semibold text-sm">
                            COMIENZA AQUÍ
                          </span>
                        </motion.div>
                      )}

                      <motion.div layout className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}>
                                {task.subject}
                              </span>
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                task.priority === 'high' ? 'bg-red-500' :
                                task.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`} />
                            </div>
                            <h3 className="text-lg">{task.title}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{task.estimatedTime}</span>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Por qué ahora:</span> {task.reason}
                          </p>
                        </div>

                        {task.isMain && (
                          <div className="flex items-center justify-end gap-2 text-purple-600 font-medium pt-2">
                            <span className="text-sm">Toca para comenzar</span>
                            <span>→</span>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-emerald-700 mb-2">
                  ¡Todo completado!
                </h2>
                <p className="text-emerald-600">
                  Excelente trabajo. Descansá o revisá tu progreso.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Section */}
          {activeTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => navigate('/replanning')}
                className="text-purple-600 hover:text-purple-700 transition-colors underline underline-offset-4 font-medium"
              >
                ¿No pudiste completar algo? Reorganizaremos tu plan
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
