import mongoose from 'mongoose'

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'g' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: true },
)

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Refeição' },
    time: { type: String, default: '' },
    notes: { type: String, default: '' },
    foods: { type: [foodSchema], default: [] },
  },
  { _id: true },
)

const dietSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    objective: { type: String, default: '' },
    notes: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    targetCalories: { type: Number, default: 0 },
    targetProtein: { type: Number, default: 0 },
    targetCarbs: { type: Number, default: 0 },
    targetFat: { type: Number, default: 0 },
    targetWater: { type: Number, default: 2000 },
    active: { type: Boolean, default: true },
    meals: { type: [mealSchema], default: [] },
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const computeTotals = (meals = []) => {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  for (const meal of meals) {
    for (const f of meal.foods || []) {
      const cal = f.calories > 0 ? f.calories : (f.protein || 0) * 4 + (f.carbs || 0) * 4 + (f.fat || 0) * 9
      totals.calories += cal
      totals.protein += f.protein || 0
      totals.carbs += f.carbs || 0
      totals.fat += f.fat || 0
    }
  }
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  }
}

dietSchema.pre('save', function (next) {
  this.totals = computeTotals(this.meals)
  next()
})

export default mongoose.model('DietPlan', dietSchema)