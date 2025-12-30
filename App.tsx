
import React, { useState, useMemo } from 'react';
import { CalculationResult, WeightUnit } from './types.ts';
import { 
  Plus, 
  Scale, 
  ShoppingCart,
  X,
  Info,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ArrowDownCircle
} from 'lucide-react';

const App: React.FC = () => {
  // Calculator State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<WeightUnit>('g');
  
  // History State
  const [results, setResults] = useState<CalculationResult[]>([]);

  // Price Gradation Logic
  const getPriceStatus = (val: number) => {
    if (val <= 0) return null;
    if (val <= 20) return { label: 'Отлично', color: 'bg-[#34C759]', text: 'text-white', icon: <CheckCircle2 size={14} /> };
    if (val <= 30) return { label: 'Нормально', color: 'bg-[#007AFF]', text: 'text-white', icon: <Info size={14} /> };
    if (val <= 45) return { label: 'Дороговато', color: 'bg-[#FFCC00]', text: 'text-black', icon: <TrendingUp size={14} /> };
    if (val <= 60) return { label: 'Дорого', color: 'bg-[#FF9500]', text: 'text-white', icon: <AlertCircle size={14} /> };
    return { label: 'Очень Дорого', color: 'bg-[#FF3B30]', text: 'text-white', icon: <AlertCircle size={14} /> };
  };

  // Derived Values
  const currentPricePerKg = useMemo(() => {
    const p = parseFloat(price);
    const w = parseFloat(weight);
    if (!p || !w || w <= 0) return 0;

    if (unit === 'g' || unit === 'ml') {
      return (p / w) * 1000;
    }
    return p / w;
  }, [price, weight, unit]);

  const status = useMemo(() => getPriceStatus(currentPricePerKg), [currentPricePerKg]);

  // Comparison logic: finds best item and its advantage over others
  const comparisonData = useMemo(() => {
    if (results.length < 2) return null;
    
    const sorted = [...results].sort((a, b) => a.pricePerKg - b.pricePerKg);
    const best = sorted[0];
    const others = sorted.slice(1);
    
    const insights = others.map(item => ({
      name: item.name,
      savings: Math.round(((item.pricePerKg - best.pricePerKg) / item.pricePerKg) * 100),
      diff: (item.pricePerKg - best.pricePerKg).toFixed(2)
    })).sort((a, b) => b.savings - a.savings);

    return { best, insights };
  }, [results]);

  const handleAddResult = () => {
    if (currentPricePerKg <= 0) return;

    const newResult: CalculationResult = {
      id: crypto.randomUUID(),
      name: name.trim() || `Товар ${results.length + 1}`,
      price: parseFloat(price),
      weight: parseFloat(weight),
      unit,
      pricePerKg: currentPricePerKg,
      timestamp: Date.now(),
    };

    setResults(prev => [newResult, ...prev]);
    setName('');
    setPrice('');
    setWeight('');
  };

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col items-center min-h-screen pb-safe bg-[#f2f2f7]">
      <div className="w-full max-w-md min-h-screen flex flex-col relative">
        
        <div className="h-12 w-full"></div>

        <header className="px-6 py-4 flex justify-between items-end">
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">BYN Аналитика</p>
            <h1 className="text-3xl font-black text-black tracking-tight">Калькулятор</h1>
          </div>
          {results.length > 0 && (
            <button 
              onClick={() => setResults([])}
              className="text-blue-600 font-black text-sm active:opacity-50 transition-opacity p-2"
            >
              Очистить
            </button>
          )}
        </header>

        {/* Input Form */}
        <div className="px-4 mt-2">
          <div className="liquid-glass rounded-[2.5rem] p-6 shadow-xl shadow-black/[0.03] border-white/50">
            <div className="space-y-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название товара"
                className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-5 py-4 text-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 font-bold transition-all"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">BYN</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Цена"
                    className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-5 py-4 text-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-black placeholder:text-slate-400 transition-all"
                  />
                </div>
                <div className="flex bg-white/60 border border-slate-200/50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Вес"
                    className="w-full bg-transparent border-none px-4 py-4 text-lg text-slate-900 focus:outline-none font-black placeholder:text-slate-400"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as WeightUnit)}
                    className="bg-slate-100 px-3 text-xs font-black text-slate-900 outline-none border-none appearance-none cursor-pointer"
                  >
                    <option value="g">г</option>
                    <option value="kg">кг</option>
                    <option value="ml">мл</option>
                    <option value="l">л</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live Status */}
              <div className={`overflow-hidden transition-all duration-400 ease-in-out ${currentPricePerKg > 0 ? 'h-24 opacity-100 mt-2' : 'h-0 opacity-0'}`}>
                <div className={`${status?.color || 'bg-blue-600'} ${status?.text || 'text-white'} rounded-[1.8rem] p-5 shadow-lg h-full flex flex-col justify-center`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                      {status?.icon} Итог за кг
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/10 rounded-full">
                      {status?.label}
                    </span>
                  </div>
                  <div className="text-3xl font-black">
                    {currentPricePerKg.toFixed(2)} <span className="text-base opacity-70">BYN</span>
                  </div>
                </div>
              </div>

              <button
                disabled={currentPricePerKg <= 0}
                onClick={handleAddResult}
                className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-lg active:scale-[0.96] transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-3 ios-shadow"
              >
                <Plus size={24} strokeWidth={3} />
                Добавить в список
              </button>
            </div>
          </div>
        </div>

        {/* Savings Insight Block */}
        {comparisonData && (
          <div className="px-4 mt-8">
            <div className="bg-blue-600 rounded-[2.5rem] p-7 shadow-2xl shadow-blue-500/30 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                <Trophy size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                    <ArrowDownCircle size={22} className="text-white" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.15em]">Анализ выгоды</h2>
                </div>

                <div className="mb-6">
                  <p className="text-[14px] font-bold opacity-90 leading-relaxed">
                    Товар <span className="bg-white/95 text-blue-800 px-3 py-1 rounded-xl font-black mx-1 inline-block shadow-lg ring-4 ring-blue-500/30">{comparisonData.best.name}</span>
                    <br/><span className="mt-2 inline-block">выгоднее остальных:</span>
                  </p>
                </div>

                <div className="space-y-4">
                  {comparisonData.insights.map((insight, idx) => (
                    <div key={idx} className="bg-black/15 rounded-3xl p-4 flex items-center justify-between backdrop-blur-xl border border-white/10">
                      <div className="max-w-[65%]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Против</p>
                          <p className="text-[11px] font-black bg-white/10 px-2 py-0.5 rounded-lg text-white">{insight.name}</p>
                        </div>
                        <p className="text-base font-bold text-white">
                          Дешевле на <span className="text-green-300 font-black text-xl">{insight.savings}%</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-tighter text-white/50 mb-0.5">Экономия</p>
                        <p className="text-sm font-black whitespace-nowrap">-{insight.diff} <span className="text-[10px] opacity-60">BYN/кг</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison History */}
        <div className="flex-1 px-4 mt-10 pb-16">
          <div className="flex items-center justify-between px-3 mb-5">
            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
              <ShoppingCart size={16} strokeWidth={3} className="text-slate-300" /> История ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="bg-white/40 border border-dashed border-slate-300 rounded-[2.5rem] py-24 flex flex-col items-center text-slate-400/60">
              <div className="p-6 bg-white rounded-full mb-5 shadow-sm">
                <Scale size={32} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-black tracking-tight uppercase">Список пуст</p>
            </div>
          ) : (
            <div className="space-y-5">
              {results.map((item) => {
                const isBest = comparisonData?.best.id === item.id;
                const itemStatus = getPriceStatus(item.pricePerKg);
                
                return (
                  <div 
                    key={item.id} 
                    className={`liquid-glass rounded-[2.2rem] p-6 ios-shadow transition-all relative active:scale-[0.98] ${
                      isBest 
                      ? 'border-2 border-blue-500 bg-white/95 shadow-lg shadow-blue-500/5' 
                      : 'border border-white/50'
                    }`}
                  >
                    {isBest && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white p-2.5 px-6 rounded-bl-[1.5rem] shadow-sm z-20">
                         <Trophy size={18} strokeWidth={2.5} />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start">
                      <div className="max-w-[75%]">
                        <h3 className="font-black text-xl text-slate-900 leading-tight truncate mb-1">{item.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                           <p className="text-[12px] font-bold text-slate-500">
                            {item.price.toFixed(2)} BYN за {item.weight}{item.unit}
                          </p>
                          <span className={`${itemStatus?.color} ${itemStatus?.text} text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest`}>
                            {itemStatus?.label}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeResult(item.id)}
                        className="p-3 -mr-3 -mt-1 text-slate-300 hover:text-red-500 active:scale-125 transition-all z-20"
                      >
                        <X size={22} strokeWidth={3} />
                      </button>
                    </div>

                    <div className="mt-8 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Цена за кг</span>
                        <div className="flex items-center gap-2">
                          <Scale size={20} className={isBest ? 'text-blue-500' : 'text-slate-300'} />
                          <span className={`text-3xl font-black tracking-tighter ${isBest ? 'text-blue-600' : 'text-slate-900'}`}>
                            {item.pricePerKg.toFixed(2)}
                            <span className="text-sm font-bold text-slate-400 ml-1.5 tracking-normal">BYN</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Visual status gauge */}
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5 border border-slate-50">
                        <div 
                          className={`h-full ${itemStatus?.color} transition-all duration-1000`} 
                          style={{ width: `${Math.min(100, (item.pricePerKg / 80) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-28 w-full"></div>
      </div>
    </div>
  );
};

export default App;
