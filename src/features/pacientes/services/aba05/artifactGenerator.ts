import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface ArtifactWatermarkPayload {
  bannerText: string;
  watermarkText: string;
}

function buildWatermarkText(payload: ArtifactWatermarkPayload) {
  return payload.watermarkText;
}

function drawBanner(page: PDFPage, font: PDFFont, bannerText: string) {
  const { width, height } = page.getSize();
  const bannerHeight = 28;

  page.drawRectangle({
    x: 0,
    y: height - bannerHeight,
    width,
    height: bannerHeight,
    color: rgb(0.9, 0.93, 0.97),
    borderColor: rgb(0.78, 0.82, 0.88),
    borderWidth: 0.5,
  });

  page.drawText(bannerText, {
    x: 18,
    y: height - bannerHeight + 8,
    size: 10,
    font,
    color: rgb(0.04, 0.24, 0.45),
  });
}

function drawWatermark(page: PDFPage, font: PDFFont, watermarkText: string) {
  const { width, height } = page.getSize();
  const fontSize = Math.max(18, Math.min(32, Math.floor(Math.min(width, height) / 12)));

  page.drawText(watermarkText, {
    x: width * 0.12,
    y: height * 0.45,
    size: fontSize,
    font,
    color: rgb(0.4, 0.4, 0.4),
    opacity: 0.12,
    rotate: degrees(-24),
  });
}

export async function generatePrintArtifact(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  watermark: ArtifactWatermarkPayload,
) {
  const bannerText = watermark.bannerText;
  const watermarkText = buildWatermarkText(watermark);

  if (mimeType === 'application/pdf') {
    const pdf = await PDFDocument.load(fileBuffer);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();

    pages.forEach((page) => {
      drawBanner(page, font, bannerText);
      drawWatermark(page, font, watermarkText);
    });

    return pdf.save();
  }

  if (mimeType.startsWith('image/')) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const image = mimeType.includes('png')
      ? await pdf.embedPng(fileBuffer)
      : await pdf.embedJpg(fileBuffer);

    const { width: imgWidth, height: imgHeight } = image.scale(1);
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const scale = Math.min((pageWidth - 40) / imgWidth, (pageHeight - 80) / imgHeight, 1);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2 - 10;

    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
    drawBanner(page, font, bannerText);
    drawWatermark(page, font, watermarkText);

    return pdf.save();
  }

  throw new Error('Formato nao suportado para impressao derivada');
}
