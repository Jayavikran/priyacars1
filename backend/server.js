
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoprofit';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB - AutoProfit Backend'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const PartnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  splitPercentage: Number,
  profitTaken: Number
});

const ExpenseSchema = new mongoose.Schema({
  id: String,
  category: String,
  description: String,
  amount: Number
});

const CarSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  make: String,
  model: String,
  year: Number,
  purchasePrice: Number,
  sellingPrice: Number,
  expenses: [ExpenseSchema],
  soldById: String,
  soldAt: String,
  isSold: Boolean,
  notes: String,
  paidPartnerIds: [String]
});

const PartnerModel = mongoose.model('Partner', PartnerSchema);
const CarModel = mongoose.model('Car', CarSchema);

// API Routes - Partners
app.get('/api/partners', async (req, res) => {
  try {
    const partners = await PartnerModel.find();
    res.json(partners);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/partners', async (req, res) => {
  const partner = new PartnerModel(req.body);
  await partner.save();
  res.json(partner);
});

app.patch('/api/partners/:id', async (req, res) => {
  const partner = await PartnerModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(partner);
});

app.delete('/api/partners/:id', async (req, res) => {
  await PartnerModel.findOneAndDelete({ id: req.params.id });
  res.sendStatus(204);
});

// API Routes - Cars
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await CarModel.find();
    res.json(cars);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/cars', async (req, res) => {
  const car = new CarModel(req.body);
  await car.save();
  res.json(car);
});

app.patch('/api/cars/:id', async (req, res) => {
  const car = await CarModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(car);
});

app.delete('/api/cars/:id', async (req, res) => {
  await CarModel.findOneAndDelete({ id: req.params.id });
  res.sendStatus(204);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
