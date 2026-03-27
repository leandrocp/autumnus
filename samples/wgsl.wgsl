@group(0) @binding(0) var<uniform> time: f32;

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  return vec4<f32>(f32(index), time, 0.0, 1.0);
}
