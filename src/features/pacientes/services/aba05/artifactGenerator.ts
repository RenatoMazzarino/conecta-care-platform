import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface ArtifactWatermarkPayload {
  bannerText: string;
  watermarkText: string;
  headerNote?: string;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number, maxLines = 2) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines && words.length > 0) {
    const lastIndex = lines.length - 1;
    const last = lines[lastIndex];
    const ellipsis = '…';
    while (font.widthOfTextAtSize(`${last}${ellipsis}`, size) > maxWidth && last.length > 0) {
      lines[lastIndex] = last.slice(0, -1);
    }
    if (lines[lastIndex] !== last) {
      lines[lastIndex] = `${lines[lastIndex]}${ellipsis}`;
    }
  }

  return lines;
}

function buildWatermarkText(payload: ArtifactWatermarkPayload) {
  return payload.watermarkText;
}

function drawBanner(page: PDFPage, font: PDFFont, italicFont: PDFFont, bannerText: string, headerNote?: string) {
  const { width, height } = page.getSize();
  const maxWidth = width - 36;
  const noteSize = 8;
  const noteLines = headerNote ? wrapText(headerNote, italicFont, noteSize, maxWidth, 2) : [];
  const bannerHeight = noteLines.length > 0 ? 28 + noteLines.length * 10 : 28;

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
    y: height - 16,
    size: 10,
    font,
    color: rgb(0.04, 0.24, 0.45),
  });

  if (noteLines.length > 0) {
    const startY = height - bannerHeight + 6;
    noteLines.forEach((line, index) => {
      page.drawText(line, {
        x: 18,
        y: startY + index * 9,
        size: noteSize,
        font: italicFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
  }
}

function drawWatermark(page: PDFPage, font: PDFFont, watermarkText: string) {
  const { width, height } = page.getSize();
  let fontSize = Math.max(12, Math.min(20, Math.floor(Math.min(width, height) / 20)));
  const maxWidth = width * 0.6;
  let lines = wrapText(watermarkText, font, fontSize, maxWidth, 3);

  while (lines.length > 3 && fontSize > 11) {
    fontSize -= 1;
    lines = wrapText(watermarkText, font, fontSize, maxWidth, 3);
  }

  const lineHeight = fontSize + 4;
  const blockHeight = lines.length * lineHeight;
  const lineWidths = lines.map((line) => font.widthOfTextAtSize(line, fontSize));
  const blockWidth = Math.max(...lineWidths, 0) + 140;
  const tileHeight = blockHeight + 120;
  const tileWidth = blockWidth + 160;
  const startY = -height * 0.4;
  const endY = height * 1.4;
  const startX = -width * 0.4;
  const endX = width * 1.4;
  let rowIndex = 0;

  for (let y = startY; y < endY; y += tileHeight) {
    const rowOffset = ((rowIndex * 83) % tileWidth) - tileWidth * 0.35;
    for (let x = startX + rowOffset; x < endX; x += tileWidth) {
      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y + index * lineHeight,
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
          opacity: 0.12,
          rotate: degrees(-24),
        });
      });
    }
    rowIndex += 1;
  }
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
    const italicFont = await pdf.embedFont(StandardFonts.HelveticaOblique);
    const pages = pdf.getPages();

    pages.forEach((page) => {
      drawBanner(page, font, italicFont, bannerText, watermark.headerNote);
      drawWatermark(page, font, watermarkText);
    });

    return pdf.save();
  }

  if (mimeType.startsWith('image/')) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdf.embedFont(StandardFonts.HelveticaOblique);
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
    drawBanner(page, font, italicFont, bannerText, watermark.headerNote);
    drawWatermark(page, font, watermarkText);

    return pdf.save();
  }

  throw new Error('Formato nao suportado para impressao derivada');
}
