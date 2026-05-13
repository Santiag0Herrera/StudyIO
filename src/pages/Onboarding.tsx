import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Sparkles, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface Exam {
  name: string;
  date: string;
}

interface TimeConfig {
  value: number;
  unit: 'hours' | 'minutes';
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subjects: '',
    exams: {} as Record<string, Exam[]>,
    availableTime: {} as Record<string, TimeConfig>
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('studyflow-onboarded', 'true');
    localStorage.setItem('studyflow-data', JSON.stringify(formData));
    navigate('/today');
  };

  const handleNext = () => {
    if (step === 1 && step < 3) {
      // Inicializar exámenes para cada materia al pasar al paso 2
      const subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const initialExams: Record<string, Exam[]> = {};
      subjects.forEach(subject => {
        initialExams[subject] = [{ name: `Examen - ${subject}`, date: '' }];
      });
      setFormData({ ...formData, exams: initialExams });
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSkipSchedule = () => {
    setStep(3);
  };

  const canProceed = () => {
    if (step === 1) return formData.subjects.trim().length > 0;
    if (step === 2) {
      // Verificar que al menos un examen tenga fecha
      return Object.values(formData.exams).some(exams =>
        exams.some(exam => exam.date.trim().length > 0)
      );
    }
    if (step === 3) return true;
    return false;
  };

  const addExam = (subject: string) => {
    const newExams = { ...formData.exams };
    if (!newExams[subject]) newExams[subject] = [];
    newExams[subject].push({ name: `Examen - ${subject}`, date: '' });
    setFormData({ ...formData, exams: newExams });
  };

  const removeExam = (subject: string, index: number) => {
    const newExams = { ...formData.exams };
    if (newExams[subject] && newExams[subject].length > 1) {
      newExams[subject].splice(index, 1);
      setFormData({ ...formData, exams: newExams });
    }
  };

  const updateExam = (subject: string, index: number, field: 'name' | 'date', value: string) => {
    const newExams = { ...formData.exams };
    if (newExams[subject] && newExams[subject][index]) {
      newExams[subject][index][field] = value;
      setFormData({ ...formData, exams: newExams });
    }
  };

  const updateTime = (day: string, field: 'value' | 'unit', value: number | 'hours' | 'minutes') => {
    const currentConfig = formData.availableTime[day] || { value: 2, unit: 'hours' };
    let newConfig = { ...currentConfig };

    if (field === 'unit') {
      newConfig.unit = value as 'hours' | 'minutes';
      // Ajustar el valor según la unidad
      if (value === 'minutes') {
        newConfig.value = Math.min(Math.max(newConfig.value, 10), 59);
      } else {
        newConfig.value = Math.min(Math.max(newConfig.value, 1), 8);
      }
    } else {
      newConfig.value = value as number;
    }

    setFormData({
      ...formData,
      availableTime: { ...formData.availableTime, [day]: newConfig }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 mb-6 shadow-lg shadow-purple-500/50"
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            StudyIO
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-500" />
            <p className="text-muted-foreground text-lg">
              Nosotros organizamos todo por vos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-600 mb-6">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Paso 1 de 3</span>
                </div>
                <div>
                  <label className="block mb-2 font-medium">
                    ¿Qué materias estás estudiando?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cálculo, Química, Historia"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Separa con comas
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                <div className="flex items-center gap-3 text-purple-600 mb-4 sticky top-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Paso 2 de 3</span>
                </div>
                <div className="space-y-6">
                  {formData.subjects.split(',').map(s => s.trim()).filter(s => s.length > 0).map((subject, subjectIndex) => (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: subjectIndex * 0.1 }}
                      className="bg-white border-2 border-purple-200 rounded-xl p-5"
                    >
                      <h3 className="font-semibold text-purple-700 mb-4">
                        {subject}
                      </h3>
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {(formData.exams[subject] || []).map((exam, examIndex) => (
                            <motion.div
                              key={`${subject}-${examIndex}`}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, height: 0 }}
                              className="space-y-2 pb-3 border-b border-purple-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Nombre del examen"
                                    value={exam.name}
                                    onChange={(e) => updateExam(subject, examIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                                  />
                                  <input
                                    type="date"
                                    value={exam.date}
                                    onChange={(e) => updateExam(subject, examIndex, 'date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                                  />
                                </div>
                                {(formData.exams[subject]?.length || 0) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeExam(subject, examIndex)}
                                    className="p-2 rounded-lg hover:bg-red-50:bg-red-950/20 text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <button
                          type="button"
                          onClick={() => addExam(subject)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50:bg-purple-950/20 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar otro examen
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-600 mb-6">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Paso 3 de 3 (opcional)</span>
                </div>
                <div>
                  <label className="block mb-3 font-medium">
                    ¿Cuánto tiempo puedes estudiar cada día?
                  </label>
                  <div className="space-y-3">
                    {DAYS.map((day) => {
                      const timeConfig = formData.availableTime[day] || { value: 2, unit: 'hours' };
                      const isMinutes = timeConfig.unit === 'minutes';
                      const minValue = isMinutes ? 10 : 1;
                      const maxValue = isMinutes ? 59 : 8;

                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium">{day}</span>
                          <input
                            type="number"
                            min={minValue}
                            max={maxValue}
                            value={timeConfig.value}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || minValue;
                              const clampedVal = Math.min(Math.max(val, minValue), maxValue);
                              updateTime(day, 'value', clampedVal);
                            }}
                            className="w-20 px-3 py-2 rounded-lg bg-white border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-center"
                          />
                          <select
                            value={timeConfig.unit}
                            onChange={(e) => updateTime(day, 'unit', e.target.value as 'hours' | 'minutes')}
                            className="flex-1 px-3 py-2 rounded-lg bg-white border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          >
                            <option value="hours">Horas</option>
                            <option value="minutes">Minutos</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Ajustaremos las tareas a tu disponibilidad
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex gap-3">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Continuar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSkipSchedule}
                  className="px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  Omitir
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Comenzar
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'w-1.5 bg-violet-300 dark:bg-violet-700'
                }`}
              />
            ))}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
