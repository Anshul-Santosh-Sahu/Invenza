const Tesseract = require('tesseract.js');
const fs = require('fs');

// Helper to clean mostly noise, but keep spaces for words
const cleanText = (text) => {
  // Keep letters, numbers, spaces, dots, commas, and currency symbols
  return text.replace(/[^a-zA-Z0-9\s.,$]/g, '').trim();
};

const scanBill = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imagePath = req.file.path;
    console.log("Processing image...");

    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

    const lines = text.split('\n');
    const detectedItems = [];

    // Keywords to skip (Totals, Headers, Tax, etc.)
    const skipKeywords = ['total', 'subtotal', 'tax', 'vat', 'gst', 'balance', 'due', 'shipping', 'discount', 'amount', 'invoice', 'date', 'bill to', 'ship to'];

    lines.forEach((line) => {
      let cleanedLine = cleanText(line);
      const lowerLine = cleanedLine.toLowerCase();

      // 1. Skip lines that contain "total", "tax", etc.
      if (skipKeywords.some(keyword => lowerLine.includes(keyword))) {
        return; 
      }

      // 2. Find the PRICE at the END of the line (e.g., 5.00 or 1,200.50)
      const priceMatch = cleanedLine.match(/(\d+[.,]\d{2})$/);

      if (priceMatch && cleanedLine.length > 5) {
        // Extract Price
        const priceStr = priceMatch[0].replace(',', '.');
        const price = parseFloat(priceStr);

        // Extract Name (Everything before the final price)
        let name = cleanedLine.substring(0, cleanedLine.lastIndexOf(priceMatch[0])).trim();

        // --- THE FIX: Clean up the Name ---
        // This Regex removes trailing numbers, symbols ($), and dots from the name.
        // It handles cases like "Widget 1 1 $ 500" -> becoming "Widget 1"
        // It keeps removing characters from the end as long as they are digits, spaces, '$', or dots.
        name = name.replace(/[\d\s$.,]+$/, '').trim();

        // 3. Generate Temp SKU
        const tempSku = `SCAN-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`;

        // 4. Valid item check (Name must be at least 2 chars, Price > 0)
        if (name.length > 1 && price > 0) {
          detectedItems.push({
            name: name,
            sku: tempSku,
            price: price,
            quantity: 1, // Default to 1, as OCR extraction of specific QTY columns is unreliable
            category: 'Uncategorized',
            supplier: 'Unknown',
            description: 'Scanned Item'
          });
        }
      }
    });

    // Cleanup
    fs.unlink(imagePath, (err) => { if (err) console.error(err); });

    res.status(200).json({
      message: 'Scan successful',
      detectedItems
    });

  } catch (error) {
    console.error("OCR Error:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: 'Failed to process image' });
  }
};

module.exports = { scanBill };