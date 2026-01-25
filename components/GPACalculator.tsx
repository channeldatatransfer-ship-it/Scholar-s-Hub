
import React, { useState } from 'react';
import { Calculator, Plus, Trash2, RefreshCw, GraduationCap } from 'lucide-react';
import { AppSettings } from '../types';

interface Course {
  id: string;
  name: string;
  credit: number;
  gradePoint: number;
}

const GPACalculator: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', credit: 3, gradePoint: 4.0 }
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: '', credit: 3, gradePoint: 0 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      totalPoints += (c.gradePoint * c.credit);
      totalCredits += c.credit;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black dark:text-white tracking-tight flex items-center justify-center gap-4">
          <Calculator className="w-12 h-12 text-indigo-600" />
          {isBN ? 'সিজিপিএ ক্যালকুলেটর' : 'GPA Calculator'}
        </h1>
        <p className="text-slate-500 font-medium">Calculate your academic performance with precision.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={course.id} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Course Name</label>
                  <input 
                    type="text" 
                    placeholder={isBN ? "বিষয়ের নাম" : "Subject Name"}
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 font-bold dark:text-white"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Credit</label>
                  <input 
                    type="number" 
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 font-bold dark:text-white"
                    value={course.credit}
                    onChange={(e) => updateCourse(course.id, 'credit', parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Grade</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 font-bold dark:text-white"
                    value={course.gradePoint}
                    onChange={(e) => updateCourse(course.id, 'gradePoint', parseFloat(e.target.value))}
                  />
                </div>
                <button 
                  onClick={() => removeCourse(course.id)}
                  className="mt-6 p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={addCourse}
            className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Course
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white text-center shadow-xl">
             <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
             <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Estimated GPA</p>
             <h2 className="text-7xl font-black tracking-tighter mb-4">{calculateGPA()}</h2>
             <div className="bg-white/10 rounded-2xl py-2 px-4 inline-block text-[10px] font-black uppercase tracking-widest">
                Keep pushing!
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <RefreshCw size={14} /> Quick Guide
             </h3>
             <ul className="text-xs text-slate-500 space-y-3 font-medium">
                <li>• A+ = 5.00 (SSC/HSC)</li>
                <li>• A = 4.00</li>
                <li>• B = 3.00</li>
                <li>• F = 0.00</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPACalculator;
