import ImageTracer from 'imagetracerjs';
const data = new Uint8Array(10*10*4);
data.fill(255);
for (let i=0; i<10; i++) {
    data[(i*10+i)*4] = 0;
    data[(i*10+i)*4+1] = 0;
    data[(i*10+i)*4+2] = 0;
    data[(i*10+i)*4+3] = 255;
}
const traced = ImageTracer.imagedataToTracedata({width: 10, height: 10, data: data}, {ltres:1, qtres:1});
if(traced.layers && traced.layers[0] && traced.layers[0].paths && traced.layers[0].paths[0]) {
    console.log(JSON.stringify(traced.layers[0].paths[0].segments[0], null, 2));
} else {
    console.log("No segments found");
    console.log(JSON.stringify(traced.layers));
}
