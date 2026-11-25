import User from './models/User.js'
import DietPlan from './models/DietPlan.js'
import WorkoutPlan from './models/WorkoutPlan.js'
import ProgressLog from './models/ProgressLog.js'
import Message from './models/Message.js'
import Lead from './models/Lead.js'

export const seed = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nutriplan.com').toLowerCase().trim()
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const adminName = process.env.ADMIN_NAME || 'Nutricionista'

  let admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash: await User.hashPassword(adminPassword),
      role: 'admin',
      goal: 'Ajudar pacientes a alcançarem seus objetivos',
    })
    console.log(`[seed] admin created: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log(`[seed] admin exists: ${adminEmail}`)
  }

  if (process.env.SEED_DEMO === 'false') return

  const demoEmail = 'maria@email.com'
  let patient = await User.findOne({ email: demoEmail })
  if (patient) {
    console.log('[seed] demo patient exists')
    return
  }

  patient = await User.create({
    name: 'Maria Silva',
    email: demoEmail,
    passwordHash: await User.hashPassword('Paciente@123'),
    role: 'patient',
    phone: '(11) 98765-4321',
    birthDate: new Date('1992-05-14'),
    gender: 'feminino',
    height: 165,
    startWeight: 72,
    goal: 'Emagrecimento saudável',
    activityLevel: 'Moderado',
    notes: 'Prefere alimentos caseiros. Intolerância leve à lactose.',
  })

  await DietPlan.create({
    patient: patient._id,
    title: 'Plano de Emagrecimento - Semana 1',
    objective: 'Emagrecimento',
    notes: 'Beber 2L de água por dia. Evitar ultraprocessados.',
    startDate: new Date(),
    targetCalories: 1600,
    targetProtein: 120,
    targetCarbs: 150,
    targetFat: 55,
    targetWater: 2000,
    active: true,
    createdBy: admin._id,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:00',
        foods: [
          { name: 'Ovos mexidos', quantity: 2, unit: 'un', calories: 140, protein: 12, carbs: 2, fat: 9 },
          { name: 'Pão integral', quantity: 1, unit: 'fatia', calories: 70, protein: 3, carbs: 12, fat: 1 },
          { name: 'Café sem açúcar', quantity: 200, unit: 'ml', calories: 5, protein: 0, carbs: 1, fat: 0 },
        ],
      },
      {
        name: 'Lanche da manhã',
        time: '10:00',
        foods: [
          { name: 'Maçã', quantity: 1, unit: 'un', calories: 95, protein: 0, carbs: 25, fat: 0 },
          { name: 'Castanhas', quantity: 10, unit: 'g', calories: 65, protein: 2, carbs: 2, fat: 6 },
        ],
      },
      {
        name: 'Almoço',
        time: '12:30',
        foods: [
          { name: 'Frango grelhado', quantity: 150, unit: 'g', calories: 248, protein: 46, carbs: 0, fat: 5 },
          { name: 'Arroz integral', quantity: 100, unit: 'g', calories: 111, protein: 3, carbs: 23, fat: 1 },
          { name: 'Feijão', quantity: 80, unit: 'g', calories: 62, protein: 4, carbs: 11, fat: 0 },
          { name: 'Salada verde', quantity: 100, unit: 'g', calories: 20, protein: 1, carbs: 3, fat: 0 },
        ],
      },
      {
        name: 'Lanche da tarde',
        time: '16:00',
        foods: [
          { name: 'Iogurte natural', quantity: 170, unit: 'g', calories: 100, protein: 10, carbs: 7, fat: 3 },
        ],
      },
      {
        name: 'Jantar',
        time: '19:30',
        foods: [
          { name: 'Salmão', quantity: 120, unit: 'g', calories: 240, protein: 25, carbs: 0, fat: 15 },
          { name: 'Batata doce', quantity: 100, unit: 'g', calories: 86, protein: 2, carbs: 20, fat: 0 },
          { name: 'Brócolis', quantity: 100, unit: 'g', calories: 34, protein: 3, carbs: 7, fat: 0 },
        ],
      },
    ],
  })

  await WorkoutPlan.create({
    patient: patient._id,
    title: 'Treino de Hipertrofia - Iniciante',
    objective: 'Ganho de massa muscular',
    level: 'Iniciante',
    notes: 'Aquecimento de 5 min antes. Descanso entre séries conforme indicado.',
    active: true,
    createdBy: admin._id,
    days: [
      {
        label: 'Treino A',
        focus: 'Peito e Tríceps',
        exercises: [
          { name: 'Supino reto com barra', sets: 3, reps: '10-12', load: '20kg', rest: '60s' },
          { name: 'Supino inclinado com halteres', sets: 3, reps: '10-12', load: '8kg', rest: '60s' },
          { name: 'Crucifixo', sets: 3, reps: '12-15', load: '6kg', rest: '45s' },
          { name: 'Tríceps pulley', sets: 3, reps: '12-15', load: '15kg', rest: '45s' },
          { name: 'Tríceps testa', sets: 3, reps: '10-12', load: '6kg', rest: '45s' },
        ],
      },
      {
        label: 'Treino B',
        focus: 'Costas e Bíceps',
        exercises: [
          { name: 'Puxada frente', sets: 3, reps: '10-12', load: '25kg', rest: '60s' },
          { name: 'Remada curvada', sets: 3, reps: '10-12', load: '15kg', rest: '60s' },
          { name: 'Remada unilateral', sets: 3, reps: '12', load: '8kg', rest: '45s' },
          { name: 'Rosca direta', sets: 3, reps: '10-12', load: '10kg', rest: '45s' },
          { name: 'Rosca martelo', sets: 3, reps: '12', load: '8kg', rest: '45s' },
        ],
      },
      {
        label: 'Treino C',
        focus: 'Pernas e Ombros',
        exercises: [
          { name: 'Agachamento livre', sets: 4, reps: '10-12', load: '30kg', rest: '90s' },
          { name: 'Leg press', sets: 3, reps: '12-15', load: '60kg', rest: '60s' },
          { name: 'Cadeira extensora', sets: 3, reps: '12-15', load: '20kg', rest: '45s' },
          { name: 'Desenvolvimento', sets: 3, reps: '10-12', load: '8kg', rest: '60s' },
          { name: 'Elevação lateral', sets: 3, reps: '12-15', load: '4kg', rest: '45s' },
        ],
      },
    ],
  })

  const now = new Date()
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    await ProgressLog.create({
      patient: patient._id,
      date: d,
      weight: 72 - (4 - i) * 0.6,
      bodyFat: 30 - (4 - i) * 0.4,
      waist: 86 - (4 - i) * 0.5,
      recordedBy: admin._id,
    })
  }

  await Message.create([
    { patient: patient._id, sender: patient._id, senderRole: 'patient', text: 'Olá! Comecei a dieta hoje.', readByAdmin: false, readByPatient: true },
    { patient: patient._id, sender: admin._id, senderRole: 'admin', text: 'Ótimo, Maria! Qualquer dúvida me chame.', readByAdmin: true, readByPatient: false },
  ])

  await Lead.create({
    name: 'João Costa',
    email: 'joao@email.com',
    phone: '(11) 99999-1111',
    goal: 'Hipertrofia',
    message: 'Gostaria de uma consultoria para ganhar massa.',
    status: 'novo',
  })

  console.log('[seed] demo data created (maria@email.com / Paciente@123)')
}