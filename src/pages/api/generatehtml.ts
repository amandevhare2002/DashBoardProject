import puppeteer from "puppeteer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { fields } = req.body;

        if (!fields || !Array.isArray(fields)) {
            return res.status(400).json({ error: "Invalid fields data" });
        }

        // Generate HTML from your existing function
        const htmlContent = generateHTML(fields);
        console.log("htmlContent", htmlContent)
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required in some environments
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0", // Ensures the page is fully loaded
        });

        // Delay slightly to ensure rendering completes
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Generate PDF
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        await browser.close();

        // Send the PDF file
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="flight_booking_details.pdf"');
        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
}

// Use your existing generateHTML function
const generateHTML = (fields: any) => {
    return `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .field-container {
            background-color: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            position: relative;
            margin-bottom: 10px; /* Ensures visibility in PDF */
          }
          .label {
            font-weight: bold;
          }
          .container {
            position: relative;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${fields?.map((field: any) => 
            field.DefaultVisible ? `
            <div 
              class="field-container" 
              style="background-color: ${field.Bgcolor}; color: ${field.fontcolor};"
            >
              <label class="label">${field.FieldName}</label>
              <label class="label">${field.FieldValue}</label>
            </div>
          ` : '').join('')}
        </div>
      </body>
    </html>
    `;
};
