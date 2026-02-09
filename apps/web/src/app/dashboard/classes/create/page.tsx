  'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Calendar as CalendarIcon,
  Check,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CreateClassPage() {
  const [step, setStep] = useState(1);
  const [appointmentFormat, setAppointmentFormat] = useState<'In Person' | 'Virtual'>('In Person');
  const [paymentType, setPaymentType] = useState('Free');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const steps = [
    { number: 1, label: 'Basic Information' },
    { number: 2, label: 'Scheduling' },
    { number: 3, label: 'Pricing Settings' }
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    // else save/submit
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="h-16 border-b border-gray-100 flex items-center px-6 gap-4">
        <Link href="/dashboard/classes/schedule" className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-xl font-bold text-gray-900 mb-8">Create class</h1>

        {/* Steps Header */}
        <div className="flex items-center gap-4 mb-12">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-colors cursor-pointer",
                  step === s.number ? "bg-[#566578] text-white" : "bg-gray-100 text-gray-500",
                  s.number < step ? "hover:bg-[#566578] hover:text-white" : "cursor-default"
                )}
                onClick={() => {
                  if (s.number < step) {
                    setStep(s.number);
                  }
                }}
              >
                {s.number}
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors",
                step === s.number ? "text-gray-900" : "text-gray-500"
              )}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-12 h-[1px] bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Select a service(recommended)</label>
                <div className="relative">
                  <select className="w-full h-11 px-3 border border-gray-200 rounded-md appearance-none bg-white text-sm focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors">
                    <option>No template...</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <p className="text-xs text-gray-400">Don't see a service template you need? Create a new service</p>
              </div>

              <Input label="Offering name" placeholder="Enter a name..." className="h-11" />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <div className="border border-gray-200 rounded-md overflow-hidden focus-within:border-gray-400 transition-colors">
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50/50">
                    {['B', 'I', 'U', 'S', '<>', 'link'].map((tool) => (
                      <button key={tool} className="p-1.5 hover:bg-gray-200 rounded text-xs font-medium min-w-[28px] text-gray-600 transition-colors">
                        {tool === 'link' ? '🔗' : tool}
                      </button>
                    ))}
                    <div className="w-[1px] h-4 bg-gray-300 mx-2" />
                    {['align', 'list', 'indent', 'emoji'].map((tool, i) => (
                      <button key={i} className="p-1.5 hover:bg-gray-200 rounded text-xs text-gray-600 transition-colors">
                        {tool === 'emoji' ? '☺' : '≡'}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="w-full p-4 min-h-[160px] focus:outline-none text-sm resize-none placeholder:text-gray-300" 
                    placeholder="Write text here..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Appointment Format</label>
                <div className="flex p-1 bg-gray-100 rounded-lg max-w-md">
                  <button 
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                      appointmentFormat === 'In Person' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
                    )}
                    onClick={() => setAppointmentFormat('In Person')}
                  >
                    In Person
                  </button>
                  <button 
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                      appointmentFormat === 'Virtual' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
                    )}
                    onClick={() => setAppointmentFormat('Virtual')}
                  >
                    Virtual
                  </button>
                </div>
              </div>

              {appointmentFormat === 'Virtual' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-sm font-medium text-gray-900">Livestream Settings</h4>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center bg-[#566578] group-hover:border-[#566578] transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-gray-900 block">Zoom Integration</span>
                        <span className="text-xs text-gray-500">
                          <span className="underline hover:text-gray-700">Connect your Zoom account</span> to share using direct Zoom integration
                        </span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 group-hover:border-gray-400 transition-colors" />
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-gray-900 block">Livestream Link</span>
                        <span className="text-xs text-gray-500">Manually share your Zoom or other link below</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <div className="relative">
                  <select className="w-full h-11 px-3 border border-gray-200 rounded-md appearance-none bg-white text-sm focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors">
                    <option>Choose location...</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Who can see this class?</label>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center bg-[#566578] group-hover:border-[#566578] transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-gray-900 block">Public</span>
                      <span className="text-xs text-gray-500">Shared on your public schedule</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 group-hover:border-gray-400 transition-colors" />
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-gray-900 block">Private</span>
                      <span className="text-xs text-gray-500">Hidden from your public schedule</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Starting date</label>
                <div className="relative max-w-xs">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <CalendarIcon size={16} />
                  </div>
                  <input type="text" className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors" defaultValue="02/10/2026" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">How often</label>
                <div className="relative">
                  <select className="w-full h-11 px-3 border border-gray-200 rounded-md appearance-none bg-white text-sm focus:outline-none focus:border-gray-400 transition-colors">
                    <option>Specific Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Start time</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      <input type="text" className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:border-gray-400 transition-colors" defaultValue="9" />
                    </div>
                    <div className="flex items-center text-gray-400">:</div>
                    <div className="relative flex-1">
                      <input type="text" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:border-gray-400 transition-colors" defaultValue="00" />
                    </div>
                    <div className="w-20 flex items-center justify-center border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-600">
                      AM
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <input type="text" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors" defaultValue="60" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Select Instructor</label>
                <div className="relative">
                  <div className="w-full min-h-[44px] px-2 py-2 border border-gray-200 rounded-md bg-white text-sm flex items-center gap-2 focus-within:border-gray-400 transition-colors">
                    <div className="bg-gray-100 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 text-gray-700">
                      asf asf <button className="hover:text-gray-900 transition-colors"><X size={12} /></button>
                    </div>
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Room</label>
                  <div className="relative">
                    <select className="w-full h-11 px-3 border border-gray-200 rounded-md appearance-none bg-white text-sm focus:outline-none focus:border-gray-400 transition-colors">
                      <option>Select room...</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Capacity</label>
                  <input type="text" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors" defaultValue="9999" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium text-gray-700">Select Payment Type</label>
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                >
                  <div className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white text-sm flex items-center justify-between group-hover:border-gray-400 transition-colors">
                    <span className="text-gray-900">{paymentType}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                  
                  {isPaymentDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#4A4A4A] text-white rounded-md shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                      {['Free', 'Sliding Scale', 'Paid', 'Package & Subscription Only'].map((type) => (
                        <div 
                          key={type}
                          className="px-3 py-2.5 text-sm hover:bg-[#5A5A5A] cursor-pointer flex items-center gap-3 transition-colors"
                          onClick={() => {
                            setPaymentType(type);
                            setIsPaymentDropdownOpen(false);
                          }}
                        >
                          <div className="w-4 flex justify-center">
                            {paymentType === type && <Check size={14} className="text-white" />}
                          </div>
                          <span>{type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-900 transition-colors py-2 group">
                  <span>Show advanced settings</span>
                  <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <div className="pt-12 mt-8">
            <Button 
              className="w-full bg-[#374151] hover:bg-[#1f2937] text-white h-12 text-sm font-medium transition-colors"
              onClick={handleNext}
            >
              {step === 3 ? 'Save class >' : 'Next >'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
