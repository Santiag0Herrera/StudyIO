import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Flame, ArrowLeft, CheckCircle2, Target } from 'lucide-react';
import { motion } from 'motion/react';

const weekData = [
  { day: 'Lun', completed: 4, total: 5, hasStreak: true },
  { day: 'Mar', completed: 5, total: 5, hasStreak: true },
  { day: 'Mié', completed: 2, total: 4, hasStreak: true },
  { day: 'Jue', completed: 0, total: 4, hasStreak: false },
  { day: 'Vie', completed: 0, total: 4, hasStreak: false },
  { day: 'Sáb', completed: 0, total: 3, hasStreak: false },
  { day: 'Dom', completed: 0, total: 3, hasStreak: false }
];

const colorGradients = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-purple-500 to-fuchsia-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500'
];

const generateSubjectProgress = () => {
  const storedData = localStorage.getItem('studyflow-data');
  if (storedData) {
    const data = JSON.parse(storedData);
    if (data.subjects) {
      const subjects = data.subjects.split(',').filter((s: string) => s.trim().length > 0);
      return subjects.map((subject: string, index: number) => ({
        subject: subject.trim(),
        completed: Math.floor(Math.random() * 8) + 3, // Placeholder: 3-10 completadas
        total: Math.floor(Math.random() * 5) + 8, // Placeholder: 8-12 total
        gradient: colorGradients[index % colorGradients.length]
      }));
    }
  }
  return [];
};

export function Progress() {
  const navigate = useNavigate();
  const [subjectProgress, setSubjectProgress] = useState<Array<{
    subject: string;
    completed: number;
    total: number;
    gradient: string;
  }>>([]);

  const currentStreak = 3;
  const totalCompleted = 11;
  const examDaysLeft = 3;

  useEffect(() => {
    setSubjectProgress(generateSubjectProgress());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/today')}
              className="p-2 rounded-lg hover:bg-white/50:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="mb-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Tu Progreso
              </h1>
              <p className="text-muted-foreground">Resumen de esta semana</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-orange-200 rounded-xl p-5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg mb-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">días seguidos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-emerald-200 rounded-xl p-5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg mb-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">{totalCompleted}</div>
              <div className="text-sm text-muted-foreground">tareas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">{examDaysLeft}</div>
              <div className="text-sm text-muted-foreground">días al examen</div>
            </motion.div>
          </div>

          {/* Streak Explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-5 mb-8"
          >
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-700 mb-1">
                  Racha basada en completación real
                </h4>
                <p className="text-sm text-orange-600">
                  Solo contamos días en los que completaste al menos una tarea.
                  Nada de trucos, solo progreso real.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-2 border-purple-200 rounded-xl p-6 mb-8 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3>Actividad Semanal</h3>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {weekData.map((day, index) => {
                const height = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                const isToday = day.day === 'Mié';
                return (
                  <motion.div
                    key={day.day}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full bg-muted rounded-lg overflow-hidden relative h-full min-h-[40px]">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.7 + index * 0.05, duration: 0.5 }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${
                          isToday
                            ? 'bg-gradient-to-t from-violet-600 to-fuchsia-500'
                            : day.hasStreak
                            ? 'bg-gradient-to-t from-orange-400 to-red-400'
                            : 'bg-gradient-to-t from-gray-300 to-gray-400'
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <span className={`text-xs block ${isToday ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {day.day}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.completed}/{day.total}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Subject Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3>Progreso por Materia</h3>
            </div>
            <div className="space-y-5">
              {subjectProgress.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="text-sm text-muted-foreground">
                      {subject.completed}/{subject.total} sesiones
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(subject.completed / subject.total) * 100}%` }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                      className={`h-full bg-gradient-to-r ${subject.gradient} shadow-sm`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/today')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Volver a Hoy
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
