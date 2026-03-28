import ImageTracer from 'imagetracerjs';

self.onmessage = async (e: MessageEvent) => {
    const { imageData, width, height, tolerance } = e.data;

    try {
        // ImageTracer requires { width, height, data } format for the imageData
        const tracedData = ImageTracer.imagedataToTracedata(
            { width, height, data: new Uint8Array(imageData.data) },
            {
                // Options map 'tolerance' to simplification and blurring
                ltres: tolerance, // Linear error threshold (lower = more lines, higher = smoother)
                qtres: tolerance, // Quadratic error threshold
                pathomit: 8,      // Omit tiny paths
                rightangleenhance: false, // More curvy
                blurradius: tolerance > 5 ? 1 : 0,
                blurdelta: 20
            }
        );

        console.log("Traced Data layers:", tracedData.layers); self.postMessage({ success: true, tracedData });
    } catch (err) {
        self.postMessage({ success: false, error: String(err) });
    }
};
