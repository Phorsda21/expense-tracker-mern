const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Parse PDF and extract transactions using Gemini AI ─────────────────────
const parseStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    console.log(`[Statement] Processing ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 20) {
      return res.status(422).json({ message: 'Could not extract text from this PDF. Make sure it is a digital bank statement (not a scanned image).' });
    }

    console.log(`[Statement] Extracted ${pdfText.length} characters from PDF`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are analyzing a bank statement. Extract ALL transactions from the following text.
      
      For each transaction, determine:
      1. "type": either "income" or "expense" (deposits, salary, transfers IN = income; purchases, withdrawals, payments, fees = expense)
      2. "description": a short clean description of the transaction
      3. "category": categorize it (e.g. Food, Transport, Shopping, Healthcare, Housing, Entertainment, Salary, Freelance, Investment, Transfer, Utilities, etc.)
      4. "amount": the transaction amount as a positive number (no currency symbols, no commas)
      5. "date": the transaction date in YYYY-MM-DD format
      6. "icon": a single emoji that best represents this transaction (e.g. 🍔 for food, 💰 for salary, 🚗 for transport, 🏠 for rent, ⚡ for utilities, 🛒 for shopping, 💳 for general payment, 📱 for phone/internet, 🎬 for entertainment, 💊 for healthcare)

      Return ONLY a raw JSON array with no markdown formatting, no backticks, no extra text.
      Example format:
      [
        {"type":"expense","description":"Grab Food Order","category":"Food","amount":12.50,"date":"2024-03-01","icon":"🍔"},
        {"type":"income","description":"Monthly Salary","category":"Salary","amount":2000.00,"date":"2024-03-01","icon":"💰"}
      ]

      Here is the bank statement text:
      ${pdfText.substring(0, 15000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const transactions = JSON.parse(text);

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(422).json({ message: 'No transactions found in this bank statement.' });
    }

    console.log(`[Statement] Found ${transactions.length} transactions`);

    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('[Statement] Error:', error.message);

    let message = 'Failed to process bank statement';
    if (error.status === 429) {
      message = 'AI quota exceeded. Please wait a minute and try again.';
    } else if (error.message?.includes('API key')) {
      message = 'Invalid Gemini API key. Please check your .env file.';
    }

    res.status(500).json({ message, error: error.message });
  }
};

// ─── Import selected transactions into Income/Expense collections ───────────
const importTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'No transactions provided' });
    }

    const incomeItems = [];
    const expenseItems = [];

    for (const t of transactions) {
      if (t.type === 'income') {
        incomeItems.push({
          user: req.user.id,
          icon: t.icon || '💰',
          source: t.description || t.category || 'Bank Income',
          amount: Math.abs(parseFloat(t.amount)),
          date: t.date ? new Date(t.date) : new Date(),
          source_origin: 'bank_import'
        });
      } else {
        expenseItems.push({
          user: req.user.id,
          icon: t.icon || '🛒',
          category: t.description || t.category || 'Bank Expense',
          amount: Math.abs(parseFloat(t.amount)),
          date: t.date ? new Date(t.date) : new Date(),
          source_origin: 'bank_import'
        });
      }
    }

    let createdIncome = [];
    let createdExpense = [];

    if (incomeItems.length > 0) {
      createdIncome = await Income.insertMany(incomeItems);
    }
    if (expenseItems.length > 0) {
      createdExpense = await Expense.insertMany(expenseItems);
    }

    console.log(`[Statement] Imported ${createdIncome.length} income + ${createdExpense.length} expense records`);

    res.status(200).json({
      success: true,
      message: `Successfully imported ${createdIncome.length} income and ${createdExpense.length} expense records`,
      imported: {
        income: createdIncome.length,
        expense: createdExpense.length
      }
    });

  } catch (error) {
    console.error('[Statement] Import error:', error.message);
    res.status(500).json({ message: 'Failed to import transactions', error: error.message });
  }
};

module.exports = { parseStatement, importTransactions };
