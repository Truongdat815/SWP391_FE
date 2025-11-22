import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const Stepper = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isUpcoming = currentStep < stepNumber;

          return (
            <div key={step.id || index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full border-2',
                    isCompleted && 'bg-primary border-primary text-white',
                    isCurrent && 'bg-primary border-primary text-white shadow-lg',
                    isUpcoming && 'bg-white border-slate-300 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <Check size={20} />
                  ) : (
                    <span className="font-semibold text-sm">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      (isCompleted || isCurrent) && 'text-slate-900',
                      isUpcoming && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[100px] truncate">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-8 bg-slate-200 relative overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-0',
                      isCompleted ? 'bg-primary' : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

