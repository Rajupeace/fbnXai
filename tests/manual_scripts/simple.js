require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const dbFile = (name, initial) => {
  const p = path.join(dataDir, `${name}.json`);
  
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(initial, null, 2));
  }
  
  return {
    read: () => {
      try {
        const data = fs.readFileSync(p, 'utf8');
        return data ? JSON.parse(data) : initial;
      } catch (e) {
        console.error(`Error reading ${name}.json:`, e);
        return initial;
      }
    },
    write: (data) => {
      try {
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error(`Error writing to ${name}.json:`, e);
        throw e;
      }
    }
  };
};

const coursesDB = dbFile('courses', []);
const Course = require('./models/Course');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => res.json({ok: true}));

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});