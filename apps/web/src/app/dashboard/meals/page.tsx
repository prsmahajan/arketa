'use client';

import { Plus, ChefHat, Clock, Flame } from 'lucide-react';

const mockMeals = [
  { title: 'Avocado Toast & Egg', type: 'Breakfast', cal: '350', time: '10 min', img: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=800&auto=format&fit=crop&q=60' },
  { title: 'Grilled Salmon Bowl', type: 'Lunch', cal: '520', time: '25 min', img: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?w=800&auto=format&fit=crop&q=60' },
  { title: 'Berry Smoothie Bowl', type: 'Snack', cal: '210', time: '5 min', img: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&auto=format&fit=crop&q=60' },
  { title: 'Quinoa Salad', type: 'Dinner', cal: '400', time: '15 min', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60' },
];

export default function MealsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meals & Recipes</h1>
          <p className="text-sm text-gray-500 mt-1">Nutrition plans for your clients</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          <Plus size={18} /> Create Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockMeals.map((meal, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
              <img src={meal.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={meal.title} />
            </div>
            <div className="flex-1 py-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D2F05D] bg-black/90 px-2 py-1 rounded-lg">{meal.type}</span>
                <button className="text-gray-300 hover:text-black"><ChefHat size={18} /></button>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mt-2 mb-2">{meal.title}</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Clock size={14} /> {meal.time}</span>
                <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500" /> {meal.cal} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
