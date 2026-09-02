import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";

import { connectToDatabase } from "../db/connect.js";
import { Counter } from "../models/Counter.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "../../");
const TEMPLATE_PATH = path.join(backendRoot, "assets", "invoice-template.html");

// The template file never changes at runtime, so it's read from disk once
// and cached in memory rather than on every invoice.
let templateHtmlPromise: Promise<string> | null = null;

const getTemplateHtml = () => {
  if (!templateHtmlPromise) {
    templateHtmlPromise = fs.readFile(TEMPLATE_PATH, "utf8");
  }

  return templateHtmlPromise;
};

// Atomically incremented — safe under two payments succeeding at the same
// instant, unlike a read-then-write counter.
export const nextInvoiceNumber = async () => {
  await connectToDatabase();

  const counter = await Counter.findOneAndUpdate(
    { _id: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `MSB-B2C/${String(counter.seq).padStart(3, "0")}`;
};

export type InvoiceLineItem = {
  description: string;
  hsn: string;
  amount: number;
  qty?: number;
};

export type InvoiceData = {
  invoiceNo: string;
  invoiceDate: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  gstin?: string;
  pan?: string;
  // Forwarded straight through to the template's own renderInvoice(), which
  // defaults to its SELLER.gstRate (18) when this is omitted.
  gstRate?: number;
  // Template fields not used by the automated course-fee flow (no e-invoice
  // IRN or AKC reference applies to these), but supported for completeness.
  irn?: string;
  akcNo?: string;
  akcDate?: string;
  items: InvoiceLineItem[];
};

// Renders the unmodified invoice-template.html in headless Chrome and
// returns the resulting PDF as a buffer. Headless Chrome is required
// because the template's renderInvoice() fills the invoice in by walking
// the live DOM (document.getElementById/querySelectorAll) rather than
// returning a string — it can't be evaluated outside a browser context.
export const renderInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
  const html = await getTemplateHtml();
  const browser = await puppeteer.launch({
    headless: true,
    // --disable-dev-shm-usage: containerized hosts (Render included) give
    // Docker a tiny /dev/shm by default, which Chrome otherwise tries to
    // use for shared memory and can crash on under low-RAM instances.
    // This makes it fall back to disk-backed temp files instead.
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    await page.evaluate((invoiceData) => {
      // renderInvoice is defined by the template's own inline <script> —
      // it exists on window once setContent has loaded the page.
      (window as unknown as { renderInvoice: (data: unknown) => void }).renderInvoice(
        invoiceData,
      );
    }, data);

    // preferCSSPageSize honours the template's own `@page { size: A4 ... }`
    // rule instead of imposing separate margins here.
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};
