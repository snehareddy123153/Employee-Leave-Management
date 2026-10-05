import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db/database.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import reportsRoutes from './routes/reports.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'EmployeeHub Express Server' });
});

async function startServer() {
  try {
    const db = await getDb();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 EmployeeHub Backend running at http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
