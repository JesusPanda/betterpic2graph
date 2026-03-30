(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,t,n,r){return{x:e-n/2,y:r/2-t}}function t(e){return Number(e.toFixed(3)).toString()}function n(n,r,i){let a=[];if(!n||!n.layers)return a;for(let o of n.layers){let n=o.paths||o;if(Array.isArray(n)){for(let o of n)if(!(!o||!o.segments))for(let n=0;n<o.segments.length;n++){let s=o.segments[n],c=s.x1,l=s.y1,u=e(c,l,r,i);if(s.type===`L`){let n=e(s.x2,s.y2,r,i),o=n.x-u.x,c=n.y-u.y;if(Math.abs(c)<.001){let e=Math.min(u.x,n.x),r=Math.max(u.x,n.x);a.push(`y=${t(u.y)} \\left\\{ ${t(e)} \\le x \\le ${t(r)} \\right\\}`)}else if(Math.abs(o)<.001){let e=Math.min(u.y,n.y),r=Math.max(u.y,n.y);a.push(`x=${t(u.x)} \\left\\{ ${t(e)} \\le y \\le ${t(r)} \\right\\}`)}else{let e=`(${t(u.x)} + t*${t(o)}, ${t(u.y)} + t*${t(c)})`;a.push(e)}}else if(s.type===`Q`){if(s.x3===void 0||s.y3===void 0)continue;let n=e(s.x2,s.y2,r,i),o=e(s.x3,s.y3,r,i),c=`(1-t)^2*${t(u.x)} + 2(1-t)t*${t(n.x)} + t^2*${t(o.x)}`,l=`(1-t)^2*${t(u.y)} + 2(1-t)t*${t(n.y)} + t^2*${t(o.y)}`;a.push(`(${c}, ${l})`)}}}}return a}var r=`
  <header>
    <h1>Pic2Graph</h1>
    <p class="subtitle">Convert any image into human-like curves for Desmos</p>
  </header>

  <div class="main-container">
    <!-- Left Column: Settings and Input -->
    <div class="panel">
      <h2>1. Choose Image</h2>

      <div id="uploadArea" class="upload-area">
        <input type="file" id="fileInput" accept="image/png, image/jpeg, image/webp" />
        <span id="uploadText">Drag & Drop or <strong>Click to Browse</strong></span>
        <div class="preview-container">
          <img id="imagePreview" alt="Preview" />
        </div>
      </div>

      <div class="control-group" style="margin-top: 1rem;">
        <div class="control-header">
          <label for="toleranceSlider"><strong>Detail Level</strong></label>
          <span id="toleranceValue">Smooth (Human-like)</span>
        </div>
        <!--
          Higher imagetracerjs tolerance = simpler, smoother shapes (fewer curves)
          Lower tolerance = more detailed, closely matching pixels (more curves)
        -->
        <input type="range" id="toleranceSlider" min="1" max="50" value="20" step="1">
        <small style="color: var(--text-muted); font-size: 0.8rem;">
          Slide left for more detail, right for fewer, smoother curves.
        </small>
      </div>

      <button id="generateBtn" class="btn" disabled>Generate Curves</button>
      <div id="status" class="status"></div>
    </div>

    <!-- Right Column: Results -->
    <div class="panel">
      <h2>2. Copy Equations</h2>
      <textarea id="equations" readonly placeholder="Your equations will appear here..."></textarea>

      <div class="control-header" style="align-items: center;">
        <span id="equationCount" style="color: var(--text-muted); font-weight: 500;">0 equations</span>
        <button id="copyBtn" class="btn" style="background-color: #10B981;" disabled>Copy to Clipboard</button>
      </div>
    </div>
  </div>
`;document.querySelector(`#app`).innerHTML=r;var i=document.getElementById(`fileInput`),a=document.getElementById(`uploadArea`),o=document.getElementById(`uploadText`),s=document.getElementById(`imagePreview`),c=document.getElementById(`toleranceSlider`),l=document.getElementById(`toleranceValue`),u=document.getElementById(`generateBtn`),d=document.getElementById(`status`),f=document.getElementById(`equations`),p=document.getElementById(`equationCount`),m=document.getElementById(`copyBtn`),h=null,g=null;window.Worker?g=new Worker(new URL(``+new URL(`worker-C3gPvjq2.js`,import.meta.url).href,``+import.meta.url),{type:`module`}):d.innerHTML=`<span style="color: red;">Error: Web Workers not supported in your browser.</span>`,c.addEventListener(`input`,e=>{let t=parseInt(e.target.value,10);t<10?l.innerText=`Detailed (Many curves)`:t<30?l.innerText=`Balanced`:l.innerText=`Smooth (Human-like)`}),a.addEventListener(`click`,()=>i.click()),[`dragenter`,`dragover`,`dragleave`,`drop`].forEach(e=>{a.addEventListener(e,_,!1)});function _(e){e.preventDefault(),e.stopPropagation()}a.addEventListener(`dragover`,()=>a.classList.add(`dragover`)),a.addEventListener(`dragleave`,()=>a.classList.remove(`dragover`)),a.addEventListener(`drop`,v);function v(e){a.classList.remove(`dragover`);let t=e.dataTransfer;t&&t.files&&t.files.length&&(i.files=t.files,y(t.files[0]))}i.addEventListener(`change`,function(){this.files&&this.files[0]&&y(this.files[0])});function y(e){if(!e.type.startsWith(`image/`)){alert(`Please select an image file.`);return}let t=new FileReader;t.onload=e=>{if(e.target&&typeof e.target.result==`string`){o.style.display=`none`,s.style.display=`block`,s.src=e.target.result;let t=new Image;t.onload=()=>{h=t,u.disabled=!1},t.src=e.target.result}},t.readAsDataURL(e)}u.addEventListener(`click`,()=>{if(!h||!g)return;u.disabled=!0,f.value=``,m.disabled=!0,p.innerText=`Processing...`,d.innerHTML=`<div class="loader"></div> Extracting curves...`;let e=document.createElement(`canvas`);e.width=h.width,e.height=h.height;let t=e.getContext(`2d`,{willReadFrequently:!0});if(!t){d.innerHTML=`<span style="color: red;">Error: Could not get 2D context.</span>`,u.disabled=!1;return}t.drawImage(h,0,0);let n=t.getImageData(0,0,e.width,e.height);g.postMessage({imageData:n,width:e.width,height:e.height,tolerance:parseInt(c.value,10)})}),g.onmessage=e=>{let t=e.data;if(!t.success){d.innerHTML=`<span style="color: red;">Error: ${t.error}</span>`,u.disabled=!1;return}d.innerHTML=`<div class="loader"></div> Formatting equations...`,setTimeout(()=>{try{let e=n(t.tracedData,h.width,h.height);f.value=e.join(`
`),p.innerText=`${e.length.toLocaleString()} equations`,e.length>0&&(m.disabled=!1),d.innerHTML=`<span style="color: #10B981; font-weight: bold;">✓ Generation Complete!</span>`}catch(e){d.innerHTML=`<span style="color: red;">Error formatting equations.</span>`,console.error(e),d.innerHTML=`<span style='color: red;'>Error formatting equations: ${e instanceof Error?e.message:String(e)}</span>`}u.disabled=!1,setTimeout(()=>{d.innerHTML.includes(`Complete`)&&(d.innerHTML=``)},3e3)},50)},m.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(f.value);let e=m.innerText;m.innerText=`✓ Copied!`,m.style.backgroundColor=`#059669`,setTimeout(()=>{m.innerText=e,m.style.backgroundColor=`#10B981`},2e3)}catch{alert(`Failed to copy text. Please select the text and copy manually.`)}});