const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌍 Access the API at http://localhost:${PORT}`);
});