const { GoogleGenAI } = require("@google/genai");
const productCombinationService = require("./productCombination.service");
const ApiError = require("./ApiError");

const ai = new GoogleGenAI({});

module.exports = {
  async parseReceipt(file) {
    const prompt = `Parse the attached receipt/sales order image and extract the information strictly as a JSON object with the following structure:
{
  "receiptNo": "string",
  "articles": [
    {
      "quantity": number,
      "unit": "string",
      "article": "string",
      "price": number,
    }
  ]
}
Return ONLY valid JSON. Do not include markdown formatting or backticks.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: file.buffer.toString("base64"),
                  mimeType: file.mimetype,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text;
      let parsedData;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (e) {
        // Fallback cleanup if Gemini returned markdown anyway
        const cleanText = jsonText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsedData = JSON.parse(cleanText);
      }

      if (parsedData.articles && Array.isArray(parsedData.articles)) {
        for (const item of parsedData.articles) {
          item.suggestedProducts = await this.getSuggestions(item);
        }
      }

      return parsedData;
    } catch (error) {
      console.error("OCR Error:", error);
      if (error.status === 429 || error.message?.includes("429")) {
        throw ApiError.internal(
          "Gemini API rate limit exceeded. Please wait a few seconds before trying again.",
        );
      }
      throw ApiError.internal(`Failed to parse image, ${error.message}`);
    }
  },

  async getSuggestions(item) {
    const suggestions = await productCombinationService.searchSuggestion(
      item.article,
      item.unit,
      item.price,
    );

    return suggestions;
  },
};
