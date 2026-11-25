# NutriPlan

Aplicação completa para nutricionistas montarem planos alimentares e de treino para seus pacientes.

**Stack:** React (Vite) · Node.js/Express · MongoDB · Docker (Compose).

## Funcionalidades

- **Landing page** com apresentação e formulário de contato (leads).
- **Login único** para nutricionista (admin) e paciente, com redirecionamento por perfil.
- **Painel do nutricionista:** dashboard, cadastro/edição/exclusão de pacientes, criação de dietas (refeições, alimentos, macros) e treinos (dias, exercícios, séries, reps, carga), evolução (peso/medidas + gráficos), mensagens, gestão de contatos (leads) e conversão em paciente.
- **Área do paciente:** "Hoje" com checklist de refeições e exercícios, controle de água, dieta completa, treino, evolução com gráficos, chat com a nutricionista, perfil.
- **LGPD:** política de privacidade, consentimento no formulário de contato, exportação e exclusão de dados pelo próprio paciente.
- **Segurança:** JWT, bcrypt, rate limiting, helmet, CORS configurável, validação de entrada, controle de acesso por perfil.

## Como rodar (Docker)

```bash
cp .env.example .env
# edite .env e defina JWT_SECRET forte e MONGO_PASSWORD
docker compose up -d --build
```

Acesse: http://localhost:8080

- Nutricionista: `admin@nutriplan.com` / `Admin@123`
- Paciente demo: `maria@email.com` / `Paciente@123`

## Desenvolvimento local

Backend:
```bash
cd server
cp .env.example .env
# ajuste MONGODB_URI para seu Mongo local
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

Frontend em http://localhost:5173 (proxy /api → :5000).

## Variáveis de ambiente

Veja `.env.example` (raiz) e `server/.env.example`.

## Segurança em produção

- Defina `JWT_SECRET` longo e aleatório.
- Altere `ADMIN_PASSWORD` e `MONGO_PASSWORD`.
- Use HTTPS (reverse proxy).
- Revise `CORS_ORIGIN` para o domínio real.

## Estrutura

```
server/   # Node.js + Express + Mongoose
client/   # React + Vite
docker-compose.yml
```