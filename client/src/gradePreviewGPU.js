// OVortex - moteur d'aperçu GPU WebGL2 (séparé du moteur d'export CPU)
// Prend en charge les LUT tonales et la matrice couleur de prepareGrade().
// Les effets spatiaux (netteté, clarté, débruitage, peau, bloom, enhance),
// les LUT 3D et les roues/bandes HSL restent à traiter par le moteur CPU.

const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){
  v_uv = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_image;
uniform sampler2D u_lutR;
uniform sampler2D u_lutG;
uniform sampler2D u_lutB;
uniform bool u_hasLuts;
uniform bool u_hasMatrix;
uniform mat3 u_matrix;
uniform vec2 u_resolution;
uniform float u_vignette;
float lookupLut(sampler2D lut, float value){
  return texture(lut, vec2(clamp(value, 0.0, 1.0), 0.5)).r;
}
void main(){
  vec4 src = texture(u_image, v_uv);
  vec3 c = src.rgb;
  if (u_hasLuts) c = vec3(lookupLut(u_lutR,c.r), lookupLut(u_lutG,c.g), lookupLut(u_lutB,c.b));
  if (u_hasMatrix) c = u_matrix * c;
  if (u_vignette != 0.0) {
    vec2 p = (v_uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y,1.0), 1.0);
    float edge = smoothstep(0.18, 0.78, length(p));
    float amount = u_vignette > 0.0 ? min(0.9, u_vignette * 0.009) : -min(0.7, -u_vignette * 0.007);
    c *= 1.0 - edge * amount;
  }
  outColor = vec4(clamp(c, 0.0, 1.0), src.a);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Erreur shader WebGL2';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function makeTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

export function createGradePreviewGPU(canvas) {
  if (!canvas) throw new Error('Canvas absent pour le moteur GPU.');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL2 indisponible dans ce navigateur.');

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Échec liaison shader GPU');
  gl.deleteShader(vs); gl.deleteShader(fs);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const imageTexture = makeTexture(gl);
  const lutTextures = [makeTexture(gl), makeTexture(gl), makeTexture(gl)];
  const loc = (name) => gl.getUniformLocation(program, name);
  const uniforms = {
    image: loc('u_image'), lutR: loc('u_lutR'), lutG: loc('u_lutG'), lutB: loc('u_lutB'),
    hasLuts: loc('u_hasLuts'), hasMatrix: loc('u_hasMatrix'), matrix: loc('u_matrix'),
    resolution: loc('u_resolution'), vignette: loc('u_vignette')
  };
  gl.uniform1i(uniforms.image, 0);
  gl.uniform1i(uniforms.lutR, 1); gl.uniform1i(uniforms.lutG, 2); gl.uniform1i(uniforms.lutB, 3);
  let lastSource = null;
  let lastPlan = null;
  let destroyed = false;

  function uploadLut(texture, values, unit) {
    const data = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      const v = Math.max(0, Math.min(255, Math.round(values[i])));
      const j = i * 4; data[j] = v; data[j + 1] = v; data[j + 2] = v; data[j + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  function render(source, plan, options = {}) {
    if (destroyed) return;
    const sw = source?.videoWidth || source?.naturalWidth || source?.width;
    const sh = source?.videoHeight || source?.naturalHeight || source?.height;
    if (!sw || !sh) return;
    const maxSide = Math.max(2, Number(options.maxSide) || 960);
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const width = Math.max(2, Math.round(sw * scale));
    const height = Math.max(2, Math.round(sh * scale));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (source !== lastSource || options.videoFrame === true) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      lastSource = source;
    }

    const luts = plan?.luts;
    const hasLuts = Boolean(luts && luts.length === 3);
    gl.uniform1i(uniforms.hasLuts, hasLuts ? 1 : 0);
    const matrix = plan?.matrix;
    const hasMatrix = Boolean(matrix && matrix.length === 9);
    gl.uniform1i(uniforms.hasMatrix, hasMatrix ? 1 : 0);
    // Les LUT et la matrice sont préparées par prepareGrade : ne les renvoyer
    // au GPU que lorsque l'objet plan change (pas à chaque image vidéo).
    if (plan !== lastPlan) {
      if (hasLuts) {
        uploadLut(lutTextures[0], luts[0], 1);
        uploadLut(lutTextures[1], luts[1], 2);
        uploadLut(lutTextures[2], luts[2], 3);
      }
      if (hasMatrix) {
        // prepareGrade construit ses matrices en ordre ligne ; GLSL attend
        // les colonnes. Transposition explicite avant uniformMatrix3fv.
        const m = matrix;
        const columnMajor = new Float32Array([m[0],m[3],m[6], m[1],m[4],m[7], m[2],m[5],m[8]]);
        gl.uniformMatrix3fv(uniforms.matrix, false, columnMajor);
      }
      lastPlan = plan;
    }
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.vignette, Number(plan?.vignette) || 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function destroy() {
    if (destroyed) return; destroyed = true;
    gl.deleteTexture(imageTexture); lutTextures.forEach((t) => gl.deleteTexture(t));
    gl.deleteBuffer(buffer); gl.deleteProgram(program);
  }

  return { render, destroy, supported: true };
}
