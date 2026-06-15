import React from 'react';
import { Phone, Award, Wrench } from 'lucide-react';

export default function SupportBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 text-slate-100 py-2 z-50 border-t border-slate-800 shadow-2xl backdrop-blur-sm select-none h-9 flex items-center">
      <div className="w-full mx-auto overflow-hidden relative flex items-center">
        {/* Label to keep the "Hỗ trợ" header fixed on the left */}
        <div className="absolute left-0 top-0 bottom-0 bg-slate-950 px-3 z-50 flex items-center font-bold text-xs text-emerald-400 border-r border-slate-800 shadow-md">
          <Phone className="w-3.5 h-3.5 mr-1 animate-pulse" />
          HỖ TRỢ
        </div>
        
        {/* Scrolling wrapper */}
        <div className="w-full pl-[95px] overflow-hidden whitespace-nowrap text-xs flex items-center">
          <div className="animate-marquee inline-flex gap-8 items-center">
            {/* First sequence */}
            <span className="inline-flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Chuyên môn & Duyệt TK:</span>
                <span className="font-semibold text-slate-200">BS. Nguyễn Trí Thức</span>
                <a href="tel:0399016244" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline">0399.016.244</a>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-400">Kỹ thuật:</span>
                <span className="font-semibold text-slate-200">KS. Hồ Công Lượng</span>
                <a href="tel:0935593353" className="text-orange-400 hover:text-orange-300 font-bold ml-1 hover:underline">0935.593.353</a>
              </span>
            </span>

            {/* Separator between repeats */}
            <span className="text-slate-600">★★★★★</span>

            {/* Repeated sequence for seamless scrolling loop */}
            <span className="inline-flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Chuyên môn & Duyệt TK:</span>
                <span className="font-semibold text-slate-200">BS. Nguyễn Trí Thức</span>
                <a href="tel:0399016244" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline">0399.016.244</a>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-400">Kỹ thuật:</span>
                <span className="font-semibold text-slate-200">KS. Hồ Công Lượng</span>
                <a href="tel:0935593353" className="text-orange-400 hover:text-orange-300 font-bold ml-1 hover:underline">0935.593.353</a>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
