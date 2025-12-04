import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export interface AgreementTemplateData {
  templateName?: string;
  stateCode?: string;
  clauses: Array<{ key?: string; text: string }>;
  version: number;
  createdAt: string;
  tenancy: {
    rent: {
      amount: number;
      cycle: string;
      dueDateDay?: number;
      utilitiesIncluded?: boolean;
      amountInWords?: string;
    };
    deposit?: {
      amount?: number;
      status?: string;
      amountInWords?: string;
    };
    unit: {
      title?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
      };
      _id?: string;
    };
    owner: {
      firstName: string;
      lastName: string;
      email: string;
      _id?: string;
    };
    tenant: {
      firstName: string;
      lastName: string;
      email: string;
      _id?: string;
    };
  };
  signers?: Array<{
    userId: string;
    name?: string;
    method?: string;
    signedAt?: string;
  }>;
  meta?: Record<string, any>;
}

/**
 * Convert number to words (Indian numbering system)
 */
function numberToWords(num: number): string {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 100000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      numberToWords(thousand) + ' Thousand' + (remainder > 0 ? ' ' + numberToWords(remainder) : '')
    );
  }
  if (num < 10000000) {
    const lakh = Math.floor(num / 100000);
    const remainder = num % 100000;
    return numberToWords(lakh) + ' Lakh' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  const crore = Math.floor(num / 10000000);
  const remainder = num % 10000000;
  return numberToWords(crore) + ' Crore' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
}

/**
 * Register Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Helper to check equality
  handlebars.registerHelper('eq', function (a: any, b: any) {
    return String(a) === String(b);
  });

  // Helper to convert to string
  handlebars.registerHelper('toString', function (value: any) {
    return String(value);
  });

  // Helper to format date
  handlebars.registerHelper('formatDate', function (date: string | Date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}

/**
 * Load and compile Handlebars template
 */
function loadTemplate(): handlebars.TemplateDelegate {
  // Try multiple possible paths (dev vs production)
  const possiblePaths = [
    path.join(__dirname, '../templates/agreement-template.hbs'), // Development
    path.join(process.cwd(), 'src/templates/agreement-template.hbs'), // Alternative dev path
    path.join(process.cwd(), 'dist/templates/agreement-template.hbs'), // Production
    path.join(__dirname, '../../templates/agreement-template.hbs'), // Alternative production path
  ];

  let templatePath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      templatePath = possiblePath;
      break;
    }
  }

  if (!templatePath) {
    throw new Error(`Template file not found. Searched in: ${possiblePaths.join(', ')}`);
  }

  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  return handlebars.compile(templateContent);
}

/**
 * Generate PDF from agreement data
 */
export async function generateAgreementPDF(data: AgreementTemplateData): Promise<Buffer> {
  try {
    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Prepare template data with number to words conversion
    const templateData = {
      ...data,
      tenancy: {
        ...data.tenancy,
        rent: {
          ...data.tenancy.rent,
          amountInWords: numberToWords(data.tenancy.rent.amount),
        },
        deposit: data.tenancy.deposit
          ? {
              ...data.tenancy.deposit,
              amountInWords: data.tenancy.deposit.amount
                ? numberToWords(data.tenancy.deposit.amount)
                : undefined,
            }
          : undefined,
      },
    };

    // Load and compile template
    const template = loadTemplate();
    const html = template(templateData);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}
