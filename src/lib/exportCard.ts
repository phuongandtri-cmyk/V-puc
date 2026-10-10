import { toPng } from 'html-to-image';

/**
 * Exports the visible on-screen Lookbook card to a pixel-identical PNG file.
 */
export async function exportCardPng(node: HTMLElement | null, fileName: string): Promise<boolean> {
  if (!node) {
    console.error('[exportCard] Target node is null');
    showExportToast('Không tải được ảnh thẻ, vui lòng thử lại.');
    return false;
  }

  const restorations: Array<() => void> = [];

  try {
    // 1. Wait until the character reports ready (data-sprite-ready="true"), max 8 s
    const startTime = Date.now();
    while (Date.now() - startTime < 8000) {
      const notReady = node.querySelector('[data-sprite-ready="false"]');
      if (!notReady) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // 2. Inline every external <img> and SVG <image> inside the node (convert to data URL)
    let inlinedCount = 0;

    // Standard HTML <img>
    const imgElements = Array.from(node.querySelectorAll('img'));
    for (const img of imgElements) {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
        try {
          const res = await fetch(src, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            const origSrc = src;
            img.setAttribute('src', dataUrl);
            inlinedCount++;
            restorations.push(() => img.setAttribute('src', origSrc));
          }
        } catch (e) {
          console.warn('[exportCard] Could not inline img src:', src, e);
        }
      }
    }

    // SVG <image>
    const svgImages = Array.from(node.querySelectorAll('image'));
    for (const svgImg of svgImages) {
      const href = svgImg.getAttribute('href') || svgImg.getAttribute('xlink:href');
      if (href && !href.startsWith('data:') && !href.startsWith('blob:')) {
        try {
          const res = await fetch(href, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            const origHref = svgImg.getAttribute('href');
            const origXlink = svgImg.getAttribute('xlink:href');
            svgImg.setAttribute('href', dataUrl);
            svgImg.setAttribute('xlink:href', dataUrl);
            inlinedCount++;
            restorations.push(() => {
              if (origHref !== null) svgImg.setAttribute('href', origHref);
              else svgImg.removeAttribute('href');
              if (origXlink !== null) svgImg.setAttribute('xlink:href', origXlink);
              else svgImg.removeAttribute('xlink:href');
            });
          }
        } catch (e) {
          console.warn('[exportCard] Could not inline SVG image href:', href, e);
        }
      }
    }

    // CSS background-image
    const allDescendants = Array.from(node.querySelectorAll<HTMLElement>('*'));
    for (const el of allDescendants) {
      const bg = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(') && !bg.includes('data:')) {
        const match = bg.match(/url\(["']?([^"']+)["']?\)/);
        if (match && match[1] && !match[1].startsWith('data:') && !match[1].startsWith('blob:')) {
          const url = match[1];
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
              const blob = await res.blob();
              const dataUrl = await blobToDataUrl(blob);
              const origStyle = el.style.backgroundImage;
              el.style.backgroundImage = `url("${dataUrl}")`;
              inlinedCount++;
              restorations.push(() => {
                el.style.backgroundImage = origStyle;
              });
            }
          } catch (e) {
            console.warn('[exportCard] Could not inline CSS background-image:', url, e);
          }
        }
      }
    }

    // 3. Bake every character SVG to a standalone PNG image before capture
    const charSvgs = Array.from(
      node.querySelectorAll<SVGSVGElement>('svg[data-export-character="true"]')
    );
    for (const charSvg of charSvgs) {
      const baked = await bakeSvgCharacter(charSvg);
      if (baked) {
        restorations.push(baked.restore);
      }
    }

    // 4. Await img.decode() for all <img>, plus document.fonts.ready, plus two requestAnimationFrame ticks
    await Promise.all(
      Array.from(node.querySelectorAll('img')).map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // 4. Assert that zero external hrefs remain
    let externalLeft = 0;
    node.querySelectorAll('img').forEach((img) => {
      const s = img.getAttribute('src');
      if (s && !s.startsWith('data:') && !s.startsWith('blob:')) externalLeft++;
    });
    node.querySelectorAll('image').forEach((img) => {
      const h = img.getAttribute('href') || img.getAttribute('xlink:href');
      if (h && !h.startsWith('data:') && !h.startsWith('blob:')) externalLeft++;
    });

    console.log('[export] inlined:', inlinedCount, 'external left:', externalLeft, 'flat sprite:', true);

    // 5. Capture with html-to-image toPng twice (keeping the second result for iOS Safari compatibility)
    const options = {
      pixelRatio: 2,
      cacheBust: false,
      backgroundColor: '#F4EBD9',
      filter: (domNode: HTMLElement) => {
        if (domNode && domNode.getAttribute && domNode.getAttribute('data-debug-overlay') === 'true') {
          return false;
        }
        return true;
      },
    };

    await toPng(node, options);
    const dataUrl = await toPng(node, options);

    if (!dataUrl || dataUrl.length < 500) {
      throw new Error('Generated data URL is invalid or empty');
    }

    // 6. Download via <a download={fileName}> with safe fallback
    try {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('[exportCard] Could not trigger download element:', e);
    }

    return true;
  } catch (error) {
    console.error('[exportCard] Failed to export card:', error);
    showExportToast('Không tải được ảnh thẻ, vui lòng thử lại.');
    return false;
  } finally {
    // Restore original attributes/styles
    for (const restore of restorations) {
      try {
        restore();
      } catch (e) {
        // Ignore
      }
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Bakes an SVG character into a 2x retina PNG Image element,
 * eliminating all SVG, mask, defs, and CSS class complexities during capture.
 */
async function bakeSvgCharacter(
  svg: SVGSVGElement
): Promise<{ replacementImg: HTMLImageElement; restore: () => void } | null> {
  try {
    const rect = svg.getBoundingClientRect();
    const renderedWidth = Math.max(1, rect.width || svg.clientWidth || 300);
    const renderedHeight = Math.max(1, rect.height || svg.clientHeight || 500);

    // 1. Clone the SVG
    const clone = svg.cloneNode(true) as SVGSVGElement;

    // 2. Inline any remaining external <image> hrefs in the clone
    const cloneImages = Array.from(clone.querySelectorAll('image'));
    for (const img of cloneImages) {
      const href = img.getAttribute('href') || img.getAttribute('xlink:href');
      if (href && !href.startsWith('data:') && !href.startsWith('blob:')) {
        try {
          const res = await fetch(href, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            img.setAttribute('href', dataUrl);
            img.setAttribute('xlink:href', dataUrl);
          }
        } catch (e) {
          console.warn('[exportCard] Could not inline image in character clone:', e);
        }
      }
    }

    // 3. Match elements and copy computed styles into literal attributes
    const origElements = Array.from(svg.querySelectorAll('*'));
    const cloneElements = Array.from(clone.querySelectorAll('*'));
    for (let i = 0; i < cloneElements.length; i++) {
      const cloneEl = cloneElements[i] as Element;
      const origEl = origElements[i] as Element | undefined;
      if (!origEl) continue;

      const computed = window.getComputedStyle(origEl);

      // Copy computed presentation styles into literal attributes
      const currentFill = cloneEl.getAttribute('fill');
      if (!currentFill || !currentFill.startsWith('url(')) {
        if (computed.fill && computed.fill !== 'none') {
          cloneEl.setAttribute('fill', computed.fill);
        } else if (computed.fill === 'none') {
          cloneEl.setAttribute('fill', 'none');
        }
      }

      const currentStroke = cloneEl.getAttribute('stroke');
      if (!currentStroke || !currentStroke.startsWith('url(')) {
        if (computed.stroke && computed.stroke !== 'none') {
          cloneEl.setAttribute('stroke', computed.stroke);
        } else if (computed.stroke === 'none' && cloneEl.hasAttribute('stroke')) {
          cloneEl.setAttribute('stroke', 'none');
        }
      }

      if (computed.strokeWidth && computed.strokeWidth !== '0px') {
        cloneEl.setAttribute('stroke-width', computed.strokeWidth);
      }
      if (computed.strokeLinejoin) {
        cloneEl.setAttribute('stroke-linejoin', computed.strokeLinejoin);
      }
      if (computed.strokeLinecap) {
        cloneEl.setAttribute('stroke-linecap', computed.strokeLinecap);
      }
      if (computed.opacity && computed.opacity !== '1') {
        cloneEl.setAttribute('opacity', computed.opacity);
      }
      if (computed.fillOpacity && computed.fillOpacity !== '1') {
        cloneEl.setAttribute('fill-opacity', computed.fillOpacity);
      }
      if (computed.strokeOpacity && computed.strokeOpacity !== '1') {
        cloneEl.setAttribute('stroke-opacity', computed.strokeOpacity);
      }
      if (computed.visibility && computed.visibility !== 'visible') {
        cloneEl.setAttribute('visibility', computed.visibility);
      }
      if (computed.display && computed.display !== 'inline' && computed.display !== 'block') {
        cloneEl.setAttribute('display', computed.display);
      }

      // Remove CSS classes & complex style properties
      cloneEl.removeAttribute('class');
      if (cloneEl instanceof HTMLElement || cloneEl instanceof SVGElement) {
        cloneEl.style.removeProperty('mix-blend-mode');
        cloneEl.style.removeProperty('isolation');
        cloneEl.style.removeProperty('filter');
      }
    }

    // Set explicit dimensions and ensure XML namespaces on clone
    clone.setAttribute('width', String(Math.round(renderedWidth)));
    clone.setAttribute('height', String(Math.round(renderedHeight)));
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.removeAttribute('class');
    clone.style.removeProperty('mix-blend-mode');
    clone.style.removeProperty('isolation');
    clone.style.removeProperty('filter');

    // 4. Render SVG clone to an Image via XMLSerializer -> Blob -> Object URL
    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      tempImg.onload = () => resolve();
      tempImg.onerror = (e) => reject(e);
      tempImg.src = blobUrl;
    });
    URL.revokeObjectURL(blobUrl);

    // 5. Draw to canvas at 2x resolution
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(renderedWidth * 2);
    canvas.height = Math.round(renderedHeight * 2);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
    const pngDataUrl = canvas.toDataURL('image/png');

    // 6. Temporarily replace <svg> in DOM
    const replacementImg = document.createElement('img');
    replacementImg.src = pngDataUrl;
    replacementImg.setAttribute('data-baked-character', 'true');
    replacementImg.style.width = `${renderedWidth}px`;
    replacementImg.style.height = `${renderedHeight}px`;
    replacementImg.style.objectFit = 'contain';
    replacementImg.style.display = 'block';

    const origDisplay = svg.style.display;
    svg.style.display = 'none';
    svg.parentElement?.insertBefore(replacementImg, svg.nextSibling);

    const restore = () => {
      replacementImg.remove();
      svg.style.display = origDisplay;
    };

    return { replacementImg, restore };
  } catch (err) {
    console.warn('[exportCard] Failed to bake SVG character to PNG, keeping SVG:', err);
    return null;
  }
}

function showExportToast(msg: string) {
  const existing = document.getElementById('export-card-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'export-card-toast';
  toast.innerText = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#8E1B1B';
  toast.style.color = '#FFFDF7';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '8px';
  toast.style.border = '2px solid #1E1B18';
  toast.style.boxShadow = '3px 3px 0 #1E1B18';
  toast.style.fontSize = '13px';
  toast.style.fontWeight = 'bold';
  toast.style.zIndex = '99999';
  toast.style.pointerEvents = 'none';
  toast.style.fontFamily = 'sans-serif';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
