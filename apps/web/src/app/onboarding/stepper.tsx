import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Email' },
  { id: 2, label: 'About You' },
  { id: 3, label: 'Account Info' },
];

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full mb-16 px-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Lines */}
        <div className="absolute top-[15px] left-0 w-full h-[1px] bg-gray-200 -z-10" />
        
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors border-2",
                  isCompleted 
                    ? "bg-[#5D6B77] border-[#5D6B77] text-white" 
                    : isCurrent 
                      ? "bg-[#5D6B77] border-[#5D6B77] text-white" 
                      : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isCurrent ? "text-gray-900" : "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
