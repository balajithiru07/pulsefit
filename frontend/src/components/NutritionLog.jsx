import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash, Utensils, GlassWater, ScanLine, Search, BookOpen, Edit2 } from 'lucide-react';

export const NutritionLog = () => {
  const { user } = useAuth();
  const { 
    nutritionLogs, 
    addNutrition, 
    deleteNutrition, 
    foods, 
    addFood, 
    updateFood, 
    deleteFood 
  } = useFitness();

  const targetCal = user?.targetCalories || 2000;
  const targetProt = user?.targetProtein || 150;
  const targetCarb = user?.targetCarbs || 220;
  const targetFats = user?.targetFat || 65;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealName, setMealName] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saveToDb, setSaveToDb] = useState(false);
  
  // Custom foods management state
  const [editingFood, setEditingFood] = useState(null);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    const foodsList = [{
      name: foodName,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0)
    }];

    const success = await addNutrition({
      mealName,
      foods: foodsList,
      waterIntake: 0,
      date
    });

    if (success) {
      if (saveToDb) {
        await addFood({
          name: foodName,
          calories: Number(calories),
          protein: Number(protein || 0),
          carbs: Number(carbs || 0),
          fat: Number(fat || 0)
        });
      }
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setSaveToDb(false);
    }
  };

  const handleQuickAddWater = async (amount) => {
    await addNutrition({
      mealName: 'Water Log',
      foods: [],
      waterIntake: amount,
      date
    });
  };

  const handleSearchSelect = (food) => {
    setFoodName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setSearchQuery('');
  };

  const handleScanBarcode = () => {
    if (foods.length === 0) return;
    setScanning(true);
    setTimeout(() => {
      // Pick a random food from database
      const randFood = foods[Math.floor(Math.random() * foods.length)];
      setFoodName(`[SCANNED] ${randFood.name}`);
      setCalories(randFood.calories);
      setProtein(randFood.protein);
      setCarbs(randFood.carbs);
      setFat(randFood.fat);
      setScanning(false);
    }, 1500);
  };

  // Calculate totals for currently selected date
  const filteredLogs = nutritionLogs.filter(log => log.date === date);
  const totalWater = filteredLogs.reduce((sum, l) => sum + (l.waterIntake || 0), 0);
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  filteredLogs.forEach(log => {
    if (log.foods) {
      log.foods.forEach(f => {
        totalCalories += f.calories;
        totalProtein += f.protein;
        totalCarbs += f.carbs;
        totalFat += f.fat;
      });
    }
  });

  const searchedFoods = searchQuery
    ? foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="animate-fade-in responsive-grid-meals">
      
      {/* Left Column: Logger & Water */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Meal Logger */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Utensils className="text-gradient-cyan-violet" /> Food Logging Console
          </h3>

          <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>MEAL TYPE</label>
              <select className="form-input" value={mealName} onChange={(e) => setMealName(e.target.value)}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks / Shakes</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>DATE</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Search bar helper */}
          {/* Search bar helper */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>SEARCH FOOD DATABASE</label>
              <button 
                type="button" 
                onClick={() => setShowAddFoodModal(true)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--color-cyan)', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} /> Add Food to Database
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search chicken breast, oatmeal, egg..."
                style={{ paddingLeft: '44px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchedFoods.length > 0 && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                background: 'var(--bg-primary)',
                marginTop: '4px'
              }}>
                {searchedFoods.map((f, i) => {
                  const isCustom = f.creator !== null && f.creator !== undefined;
                  return (
                    <div 
                      key={f._id || i} 
                      onClick={() => handleSearchSelect(f)}
                      style={{ 
                        padding: '10px 16px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{f.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Calories: {f.calories} | P: {f.protein}g | C: {f.carbs}g | F: {f.fat}g
                        </div>
                      </div>
                      {isCustom && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFood({
                                _id: f._id,
                                name: f.name,
                                calories: f.calories,
                                protein: f.protein,
                                carbs: f.carbs,
                                fat: f.fat
                              });
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', padding: '4px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFood(f._id);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleAddMeal}>
            <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>FOOD ITEM NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Scrambled Eggs (3)"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>BARCODE</label>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', display: 'flex', gap: '8px', padding: '12px' }}
                  onClick={handleScanBarcode}
                  disabled={scanning}
                >
                  <ScanLine size={18} /> {scanning ? 'Scanning...' : 'Scan Product'}
                </button>
              </div>
            </div>

            <div className="responsive-grid-4col" style={{ gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '6px' }}>CALORIES</label>
                <input type="number" className="form-input" placeholder="kcal" value={calories} onChange={(e) => setCalories(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '6px' }}>PROTEIN (G)</label>
                <input type="number" className="form-input" placeholder="g" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '6px' }}>CARBS (G)</label>
                <input type="number" className="form-input" placeholder="g" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '6px' }}>FAT (G)</label>
                <input type="number" className="form-input" placeholder="g" value={fat} onChange={(e) => setFat(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="checkbox" 
                id="saveToDbCheckbox" 
                checked={saveToDb} 
                onChange={(e) => setSaveToDb(e.target.checked)} 
                style={{ cursor: 'pointer', width: '15px', height: '15px' }}
              />
              <label htmlFor="saveToDbCheckbox" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Save this custom food to search database for future use
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              Add Food Item
            </button>
          </form>
        </div>

        {/* Water Logging */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <GlassWater size={20} style={{ color: 'var(--color-cyan)' }} /> Hydration Tracker
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-cyan)' }}>{totalWater} ml</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Today's Total Consumption</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '10px 16px' }} onClick={() => handleQuickAddWater(250)}>
                +250ml Glass
              </button>
              <button className="btn-secondary" style={{ padding: '10px 16px' }} onClick={() => handleQuickAddWater(500)}>
                +500ml Bottle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Nutrition Reports & Visuals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Macro Summary Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', alignSelf: 'flex-start' }}>📊 Daily Macro Balance</h3>

          <div className="responsive-macro-balance">
            {/* Custom SVG Donut Chart */}
            <div className="progress-ring-container" style={{ width: '120px', height: '120px' }}>
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                {/* Simulated rings for macros */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" 
                  stroke="var(--color-rose)" 
                  strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - Math.min(1, (totalProtein / targetProt)))}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="progress-ring-text">
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{totalCalories}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>kcal</div>
              </div>
            </div>

            {/* Macro details */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>Protein</span>
                  <span>{totalProtein}g / {targetProt}g</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (totalProtein / targetProt) * 100)}%`, height: '100%', background: 'var(--color-rose)' }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Carbohydrates</span>
                  <span>{totalCarbs}g / {targetCarb}g</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (totalCarbs / targetCarb) * 100)}%`, height: '100%', background: 'var(--color-cyan)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-violet)', fontWeight: 600 }}>Fat</span>
                  <span>{totalFat}g / {targetFats}g</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (totalFat / targetFats) * 100)}%`, height: '100%', background: 'var(--color-violet)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log History */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>📝 Meal Log</h3>
          
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                No meals logged for this date.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)' 
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {log.mealName} {log.waterIntake > 0 && `(Water: ${log.waterIntake}ml)`}
                    </div>
                    {log.foods && log.foods.map((food, fIdx) => (
                      <div key={fIdx} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {food.name} &bull; {food.calories} kcal (P: {food.protein}g C: {food.carbs}g F: {food.fat}g)
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => deleteNutrition(log._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recipes Advisor */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BookOpen size={18} className="text-gradient-cyan-violet" /> Healthy Recipe Suggestions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-cyan)' }}>Avocado & Eggs Quinoa Cup</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>High Protein & Healthy Fats • Calories: 380 kcal</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-rose)' }}>Lemon Garlic Air-Fried Salmon</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>High Omega-3s & Low Carb • Calories: 420 kcal</div>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Food Modals */}
      {showAddFoodModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🍎 Save New Food to Database
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const success = await addFood({
                name: fd.get('name'),
                calories: Number(fd.get('calories')),
                protein: Number(fd.get('protein') || 0),
                carbs: Number(fd.get('carbs') || 0),
                fat: Number(fd.get('fat') || 0)
              });
              if (success) setShowAddFoodModal(false);
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>NAME</label>
                <input name="name" type="text" className="form-input" placeholder="e.g. Rice with Dal" required />
              </div>
              <div className="responsive-grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>CALORIES</label>
                  <input name="calories" type="number" className="form-input" placeholder="kcal" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>PROTEIN (G)</label>
                  <input name="protein" type="number" className="form-input" placeholder="g" />
                </div>
              </div>
              <div className="responsive-grid-2col" style={{ gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>CARBS (G)</label>
                  <input name="carbs" type="number" className="form-input" placeholder="g" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>FAT (G)</label>
                  <input name="fat" type="number" className="form-input" placeholder="g" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setShowAddFoodModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingFood && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✏️ Edit Custom Food
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const success = await updateFood(editingFood._id, {
                name: editingFood.name,
                calories: Number(editingFood.calories),
                protein: Number(editingFood.protein || 0),
                carbs: Number(editingFood.carbs || 0),
                fat: Number(editingFood.fat || 0)
              });
              if (success) setEditingFood(null);
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>NAME</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingFood.name} 
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="responsive-grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>CALORIES</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingFood.calories} 
                    onChange={(e) => setEditingFood({ ...editingFood, calories: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>PROTEIN (G)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingFood.protein} 
                    onChange={(e) => setEditingFood({ ...editingFood, protein: e.target.value })} 
                  />
                </div>
              </div>
              <div className="responsive-grid-2col" style={{ gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>CARBS (G)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingFood.carbs} 
                    onChange={(e) => setEditingFood({ ...editingFood, carbs: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '6px', color: 'var(--text-secondary)' }}>FAT (G)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingFood.fat} 
                    onChange={(e) => setEditingFood({ ...editingFood, fat: e.target.value })} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setEditingFood(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
