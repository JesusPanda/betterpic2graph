export interface Point {
    x: number;
    y: number;
}

export interface Segment {
    type: 'L' | 'Q'; // Line or Quadratic
    x3: number;
    y3: number;
    x4: number;
    y4: number;
    x5?: number;
    y5?: number;
}

export function toDesmosCoords(x: number, y: number, width: number, height: number): Point {
    return {
        x: x - (width / 2),
        y: (height / 2) - y
    };
}

function formatNum(num: number): string {
    return Number(num.toFixed(3)).toString();
}

export function generateDesmosEquations(tracedData: any, width: number, height: number): string[] {
    const equations: string[] = [];

    if (!tracedData || !tracedData.layers) return equations;

    // Imagetracerjs returns `tracedData.layers`. Each layer can either be a list of paths directly
    // or an object with paths. For safety, let's log the first layer structure if possible.
    for (let layer of tracedData.layers) {

        // Sometimes layers directly contain the array of paths in certain imagetracerjs versions
        let paths = layer.paths || layer;

        if (!Array.isArray(paths)) continue;

        for (const path of paths) {

            if (!path || !path.segments) continue;

            for (let k=0; k < path.segments.length; k++) {
                const segment = path.segments[k];

                const startX = segment.x3;
                const startY = segment.y3;

                const start = toDesmosCoords(startX, startY, width, height);

                if (segment.type === 'L') {
                    const end = toDesmosCoords(segment.x4, segment.y4, width, height);

                    const dx = end.x - start.x;
                    const dy = end.y - start.y;

                    if (Math.abs(dy) < 0.001) {
                        const minX = Math.min(start.x, end.x);
                        const maxX = Math.max(start.x, end.x);
                        equations.push(`y=${formatNum(start.y)} \\left\\{ ${formatNum(minX)} \\le x \\le ${formatNum(maxX)} \\right\\}`);
                    }
                    else if (Math.abs(dx) < 0.001) {
                        const minY = Math.min(start.y, end.y);
                        const maxY = Math.max(start.y, end.y);
                        equations.push(`x=${formatNum(start.x)} \\left\\{ ${formatNum(minY)} \\le y \\le ${formatNum(maxY)} \\right\\}`);
                    }
                    else {
                        const eq = `(${formatNum(start.x)} + t*${formatNum(dx)}, ${formatNum(start.y)} + t*${formatNum(dy)})`;
                        equations.push(eq);
                    }
                } else if (segment.type === 'Q') {
                    if (segment.x5 === undefined || segment.y5 === undefined) continue;

                    const control = toDesmosCoords(segment.x4, segment.y4, width, height);
                    const end = toDesmosCoords(segment.x5, segment.y5, width, height);

                    const xEq = `(1-t)^2*${formatNum(start.x)} + 2(1-t)t*${formatNum(control.x)} + t^2*${formatNum(end.x)}`;
                    const yEq = `(1-t)^2*${formatNum(start.y)} + 2(1-t)t*${formatNum(control.y)} + t^2*${formatNum(end.y)}`;

                    equations.push(`(${xEq}, ${yEq})`);
                }
            }
        }
    }

    return equations;
}
