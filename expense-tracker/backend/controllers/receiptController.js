const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is not configured in .env' });
    }

    const { buffer, mimetype } = req.file;

    // Convert file buffer to base64 for Gemini Vision
    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimetype
      }
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Analyze this receipt image and extract the following information.
      Return ONLY a raw JSON object with no markdown formatting, no backticks, and no extra text.
      Strictly follow this structure:
      {
        "category": "String (e.g. Food, Transport, Shopping, Healthcare, Housing, Entertainment. Make your best guess based on the store name and items. Default to 'Shopping' if unsure)",
        "amount": number (the final TOTAL amount only, not subtotal, as a plain number with no currency symbols. E.g. 63.44),
        "date": "String in YYYY-MM-DD format extracted from the receipt. Omit this field if no date is found."
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    // Strip any markdown formatting the model may add despite instructions
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(text);

    console.log('[Receipt] Gemini scan result:', parsedData);

    res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('[Receipt] Gemini API Error:', error.message);

    // Give user a helpful error message depending on error type
    let message = 'Failed to process receipt';
    if (error.status === 429) {
      message = 'AI quota exceeded. Please wait a minute and try again, or enable billing on your Google Cloud account.';
    } else if (error.status === 400) {
      message = 'Could not read this image. Please try a clearer photo.';
    } else if (error.message?.includes('API key')) {
      message = 'Invalid Gemini API key. Please check your .env file.';
    }

    res.status(500).json({ message, error: error.message });
  }
};

module.exports = { scanReceipt };
