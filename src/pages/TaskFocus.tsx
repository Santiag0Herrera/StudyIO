import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  X,
  Play,
  Pause,
  Sparkles,
  Calendar,
  Upload,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface ExamInfo {
  name: string;
  date: string;
  daysUntil: number;
}

// Generar detalles de tareas dinámicamente
const generateTaskDetails = (): Record<
  string,
  {
    subject: string;
    title: string;
    estimatedTime: string;
    subtasks: Subtask[];
  }
> => {
  const storedData = localStorage.getItem("studyflow-data");
  const details: Record<
    string,
    {
      subject: string;
      title: string;
      estimatedTime: string;
      subtasks: Subtask[];
    }
  > = {};

  if (storedData) {
    const data = JSON.parse(storedData);
    if (data.subjects) {
      const subjects = data.subjects
        .split(",")
        .filter((s: string) => s.trim().length > 0);

      const taskTemplates = [
        {
          title: "Repasar conceptos clave",
          time: "45",
          subtasks: [
            "Revisar definiciones y teoría fundamental",
            "Repasar conceptos principales",
            "Resolver ejercicios de práctica",
            "Verificar respuestas y corregir errores",
          ],
        },
        {
          title: "Practicar ejercicios",
          time: "30",
          subtasks: [
            "Revisar ejemplos resueltos",
            "Resolver ejercicios guiados",
            "Practicar problemas adicionales",
          ],
        },
        {
          title: "Revisar material nuevo",
          time: "25",
          subtasks: [
            "Leer introducción y contexto",
            "Leer secciones principales",
            "Hacer resumen de puntos clave",
          ],
        },
        {
          title: "Resolver problemas prácticos",
          time: "35",
          subtasks: [
            "Revisar metodología de resolución",
            "Practicar problemas tipo examen",
            "Resolver ejercicios combinados",
          ],
        },
      ];

      subjects.forEach((subject: string, index: number) => {
        const template =
          taskTemplates[index % taskTemplates.length];
        details[`${index + 1}`] = {
          subject: subject.trim(),
          title: template.title,
          estimatedTime: template.time,
          subtasks: template.subtasks.map(
            (title, subIndex) => ({
              id: `${index + 1}-${subIndex + 1}`,
              title,
              completed: false,
            }),
          ),
        };
      });
    }
  }

  return details;
};

const colorGradients = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-fuchsia-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-blue-500",
];

const getSubjectGradient = (
  subject: string,
  allSubjects: string[],
): string => {
  const index = allSubjects.indexOf(subject);
  return colorGradients[index % colorGradients.length];
};

export function TaskFocus() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [taskDetails, setTaskDetails] = useState<
    Record<
      string,
      {
        subject: string;
        title: string;
        estimatedTime: string;
        subtasks: Subtask[];
      }
    >
  >({});
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [subjectExams, setSubjectExams] = useState<ExamInfo[]>(
    [],
  );

  const task =
    taskDetails[taskId || "1"] || Object.values(taskDetails)[0];
  const totalMinutes = task ? parseInt(task.estimatedTime) : 30;

  useEffect(() => {
    const details = generateTaskDetails();
    setTaskDetails(details);

    const storedData = localStorage.getItem("studyflow-data");
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.subjects) {
        const subjects = data.subjects
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        setAllSubjects(subjects);
      }
    }
  }, []);

  // Cargar exámenes de la materia actual
  useEffect(() => {
    if (!task) return;

    const storedData = localStorage.getItem("studyflow-data");
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.exams && data.exams[task.subject]) {
        const exams: ExamInfo[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        (
          data.exams[task.subject] as Array<{
            name: string;
            date: string;
          }>
        ).forEach((exam) => {
          if (exam.date) {
            const examDate = new Date(exam.date);
            examDate.setHours(0, 0, 0, 0);
            const daysUntil = Math.ceil(
              (examDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            exams.push({
              name: exam.name,
              date: exam.date,
              daysUntil,
            });
          }
        });

        // Ordenar por fecha
        exams.sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime(),
        );
        setSubjectExams(exams);
      }
    }
  }, [task]);

  useEffect(() => {
    if (task) {
      setTimeLeft(totalMinutes * 60);
      setSubtasks(task.subtasks);
    }
  }, [totalMinutes, task]);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === subtaskId
          ? { ...st, completed: !st.completed }
          : st,
      ),
    );
  };

  const handleComplete = () => {
    setIsCompleting(true);

    // Guardar tarea como completada
    const completed = JSON.parse(
      localStorage.getItem("studyflow-completed") || "[]",
    );
    completed.push(taskId);
    localStorage.setItem(
      "studyflow-completed",
      JSON.stringify(completed),
    );
    localStorage.setItem("studyflow-just-completed", "true");

    // Animación de éxito y regreso automático
    setTimeout(() => {
      navigate("/today");
    }, 1500);
  };

  const progress =
    ((totalMinutes * 60 - timeLeft) / (totalMinutes * 60)) *
    100;
  const completedSubtasks = subtasks.filter(
    (st) => st.completed,
  ).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0
      ? (completedSubtasks / totalSubtasks) * 100
      : 0;

  const gradient = task
    ? getSubjectGradient(task.subject, allSubjects)
    : colorGradients[0];

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Cargando tarea...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Overlay de completación */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="text-center text-white"
              >
                <CheckCircle2 className="w-24 h-24 mx-auto mb-6" />
                <h1 className="text-4xl font-bold mb-4">
                  ¡Tarea Completada!
                </h1>
                <p className="text-xl flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Buen progreso. Seguimos con esto
                  <Sparkles className="w-6 h-6" />
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <span
              className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg font-medium`}
            >
              {task.subject}
            </span>
            <button
              onClick={() => navigate("/today")}
              className="p-2 rounded-lg hover:bg-white/50:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Timer Section */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-xl">
              <h2 className="mb-6 text-center">{task.title}</h2>

              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto relative">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-purple-500"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      initial={{
                        strokeDashoffset: 2 * Math.PI * 88,
                      }}
                      animate={{
                        strokeDashoffset:
                          2 *
                          Math.PI *
                          88 *
                          (1 - progress / 100),
                      }}
                      transition={{ duration: 0.5 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isRunning
                      ? "bg-muted text-muted-foreground hover:bg-accent"
                      : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Iniciar
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Tiempo estimado: {task.estimatedTime} minutos
                </span>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3>Pasos a seguir</h3>
                <motion.span
                  key={completedSubtasks}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-purple-600 font-medium"
                >
                  {completedSubtasks}/{totalSubtasks}
                </motion.span>
              </div>

              {/* Subtask Progress - animado */}
              <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress}%` }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-sm"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {subtasks.map((subtask, index) => (
                    <motion.div
                      key={subtask.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: 0.2 },
                      }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() =>
                        handleToggleSubtask(subtask.id)
                      }
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        subtask.completed
                          ? "bg-purple-50 border-purple-300"
                          : "bg-gray-50 border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <AnimatePresence mode="wait">
                          {subtask.completed ? (
                            <motion.div
                              key="completed"
                              initial={{
                                scale: 0,
                                rotate: -180,
                              }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="uncompleted"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-6 h-6 rounded-lg border-2 border-gray-400 flex items-center justify-center"
                            >
                              <Circle className="w-3 h-3 text-gray-400" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <span
                        className={`flex-1 transition-all ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {subtask.title}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={handleComplete}
                disabled={completedSubtasks < totalSubtasks}
                whileHover={{
                  scale:
                    completedSubtasks >= totalSubtasks
                      ? 1.02
                      : 1,
                }}
                whileTap={{
                  scale:
                    completedSubtasks >= totalSubtasks
                      ? 0.98
                      : 1,
                }}
                className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                Marcar como Completada
              </motion.button>
            </div>
          </div>

          {/* Sección de Adjuntar Contenido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-300 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-violet-700 mb-2">
                  Adjuntar contenido de la materia
                </h3>
                <p className="text-sm text-violet-600 mb-4">
                  Sube cronogramas, programas de la materia,
                  apuntes o PDFs. El sistema los analizará para
                  generar automáticamente los pasos de estudio
                  personalizados.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-violet-300 text-violet-700 hover:bg-violet-50:bg-violet-950/30 transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Cronograma
                    </span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-violet-300 text-violet-700 hover:bg-violet-50:bg-violet-950/30 transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Apuntes / PDFs
                    </span>
                  </button>
                </div>
                <p className="text-xs text-violet-500 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  La IA detectará temas importantes y organizará
                  tu plan de estudio
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sección de Exámenes de la Materia */}
          {subjectExams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-purple-700">
                  Exámenes de {task.subject}
                </h3>
              </div>
              <div className="space-y-3">
                {subjectExams.map((exam, index) => {
                  const isPast = exam.daysUntil < 0;
                  const isToday = exam.daysUntil === 0;
                  const isUrgent =
                    exam.daysUntil > 0 && exam.daysUntil <= 3;

                  return (
                    <motion.div
                      key={`${exam.date}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                        isPast
                          ? "bg-gray-50 border-gray-300 opacity-60"
                          : isToday
                            ? "bg-red-50 border-red-400"
                            : isUrgent
                              ? "bg-orange-50 border-orange-300"
                              : "bg-purple-50 border-purple-200"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                        <p className="font-medium text-sm mb-1">
                          {exam.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              exam.date,
                            ).toLocaleDateString("es-AR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-lg font-bold ${
                            isPast
                              ? "text-gray-400"
                              : isToday
                                ? "text-red-600"
                                : isUrgent
                                  ? "text-orange-600"
                                  : "text-purple-600"
                          }`}
                        >
                          {isPast
                            ? "Pasado"
                            : isToday
                              ? "Hoy"
                              : exam.daysUntil === 1
                                ? "Mañana"
                                : `${exam.daysUntil} días`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}