import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/usuarios', usuariosRoutes);

// health
app.get('/', (req, res) => res.send('API Mapa Usuarios 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
