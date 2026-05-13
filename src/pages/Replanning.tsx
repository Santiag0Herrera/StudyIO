import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle2, Clock, ArrowRight, Calendar, Zap, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const changes = [
  {
    type: 'reduced',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Tiempo ajustado',
    description: 'Cálculo: Derivadas - Reducido de 45 a 30 minutos'
  },
  {
    type: 'rescheduled',
    icon: Calendar,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Reprogramado',
    description: 'Historia: Cap. 7 - Movido para mañana'
  },
  {
    type: 'prioritized',
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'Nueva prioridad',
    description: 'Química: Estequiometría - Ahora es tu prioridad #1'
  }
];

export function Replanning() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6 shadow-lg shadow-purple-500/50"
          >
            <RefreshCw className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Reorganizamos tu plan automáticamente
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            No tenés que hacer nada
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Detectamos que no completaste todas las tareas. Ajustamos automáticamente
            tu plan para que sigas progresando sin estrés.
          </p>
        </div>

        {/* What Changed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <h3 className="mb-1 text-purple-700 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Qué cambiamos
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Estos son los ajustes automáticos para optimizar tu tiempo
          </p>

          <div className="space-y-3">
            {changes.map((change, index) => {
              const Icon = change.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 ${change.bg} ${change.border}`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 ${change.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold mb-1 ${change.color}`}>
                      {change.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {change.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Reassurance Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-violet-700 font-medium mb-1">
                No tenés que hacer nada
              </p>
              <p className="text-sm text-violet-600">
                El sistema se adapta automáticamente. Solo seguí el nuevo plan que preparamos.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-700 font-medium mb-1">
                Tu meta sigue intacta
              </p>
              <p className="text-sm text-emerald-600">
                La fecha de tu examen no cambió. Te mantendremos en el camino correcto
                sin que tengas que preocuparte.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/today')}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            Ver mi nuevo plan de hoy
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
