import * as pdfjsLib from 'pdfjs-dist';
// Use the modern worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const generatePdfThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            try {
                const typedarray = new Uint8Array(this.result as ArrayBuffer);
                const loadingTask = pdfjsLib.getDocument({ data: typedarray });
                const pdf = await loadingTask.promise;

                // Fetch the first page
                const page = await pdf.getPage(1);
                
                // Set scale for a nice thumbnail size (not too huge to save storage)
                const scale = 1.5;
                const viewport = page.getViewport({ scale });

                // Prepare canvas using PDF page dimensions
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                if (!context) {
                    reject(new Error("Could not create canvas context"));
                    return;
                }

                // Crop to the top half of the page to capture title/logo
                canvas.height = viewport.height / 2;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;
                
                // Extract half of the page? Or just the whole page? 
                // We'll return the whole page as a data URL (JPEG to save space)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);

            } catch (err) {
                console.error("Error generating PDF thumbnail:", err);
                reject(err);
            }
        };

        fileReader.onerror = (err) => {
            console.error("FileReader error:", err);
            reject(err);
        };

        fileReader.readAsArrayBuffer(file);
    });
};
