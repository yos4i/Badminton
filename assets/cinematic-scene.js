/* The racket face lies in XY; its normal and the outgoing shuttle point +Z.
   All movement is evaluated from elapsed time, independent of frame rate. */
function initIntroScene(container) {
  const T = window.THREE;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, .1, 80);
  const renderer = new T.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.outputEncoding = T.sRGBEncoding;
  container.appendChild(renderer.domElement);
  scene.add(new T.AmbientLight(0x91bedc, .65));
  const light = new T.DirectionalLight(0xffffff, 2.2);
  light.position.set(1, 4, 5); scene.add(light);
  const rim = new T.PointLight(0x29bfff, 4, 20);
  rim.position.set(-3, 1, -2); scene.add(rim);
  const flash = new T.PointLight(0xb9eaff, 0, 12);
  flash.position.set(0, .25, 1); scene.add(flash);
  const material = (color, metalness=.3) => new T.MeshStandardMaterial({color, metalness, roughness:.3});
  const frame = material(0x27b7df, .7), carbon = material(0x172732), white = material(0xf7fafc, .05);
  const pivot = new T.Group(); pivot.position.set(0, -1.75, 0); scene.add(pivot);
  const head = new T.Group(); head.position.y = 2; pivot.add(head);
  const hoop = new T.Mesh(new T.TorusGeometry(.56, .027, 10, 80), frame);
  hoop.scale.y = 1.3; head.add(hoop);
  const points=[];
  for(let i=-7;i<=7;i++){
    const x=i*.07, y=Math.sqrt(.53*.53-x*x)*1.3;
    points.push(new T.Vector3(x,-y,0),new T.Vector3(x,y,0));
    const v=i*.09, u=Math.sqrt(.53*.53-(v/1.3)**2);
    points.push(new T.Vector3(-u,v,0),new T.Vector3(u,v,0));
  }
  head.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xc5e0e8,transparent:true,opacity:.7})));
  const shaft=new T.Mesh(new T.CylinderGeometry(.018,.022,1.05,10),carbon);
  shaft.position.y=.75; pivot.add(shaft);
  const grip=new T.Mesh(new T.CylinderGeometry(.048,.058,.52,12),material(0x34475b));
  grip.position.y=.08; pivot.add(grip);
  for(let i=0;i<9;i++){
    const wrap=new T.Mesh(new T.TorusGeometry(.051,.006,4,16),carbon);
    wrap.rotation.x=Math.PI/2;wrap.position.y=-.14+i*.055;pivot.add(wrap);
  }
  const shuttle=new T.Group(); scene.add(shuttle);
  const cork=new T.Mesh(new T.SphereGeometry(.105,20,16),white);
  cork.scale.z=1.15;shuttle.add(cork);
  const band=new T.Mesh(new T.CylinderGeometry(.091,.091,.055,20),material(0x222c37));
  band.rotation.x=Math.PI/2;band.position.z=-.055;shuttle.add(band);
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    const base=new T.Vector3(Math.cos(a)*.065,Math.sin(a)*.065,-.07);
    const tip=new T.Vector3(Math.cos(a)*.245,Math.sin(a)*.245,-.61);
    const feather=new T.Mesh(new T.SphereGeometry(1,8,12),white);
    feather.scale.set(.047,.012,.24);
    feather.position.lerpVectors(base,tip,.68);
    feather.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tip.clone().sub(base).normalize());
    shuttle.add(feather);
    shuttle.add(new T.Line(new T.BufferGeometry().setFromPoints([base,tip]),new T.LineBasicMaterial({color:0xd3e0e9})));
  }
  // Distant court markings give the close-up a stable sense of perspective.
  const court=[];
  for(const x of [-3,0,3])court.push(new T.Vector3(x,-2,-10),new T.Vector3(x,-2,5));
  for(const z of [-10,-5,0,5])court.push(new T.Vector3(-3,-2,z),new T.Vector3(3,-2,z));
  scene.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(court),new T.LineBasicMaterial({color:0x3688a2,transparent:true,opacity:.22})));
  const particles=Array.from({length:32},(_,i)=>{
    const mesh=new T.Mesh(new T.SphereGeometry(.012,4,4),new T.MeshBasicMaterial({color:0xb8eeff,transparent:true}));
    mesh.userData.velocity=new T.Vector3(Math.cos(i*2.4)*3,Math.sin(i*2.4)*2,1+(i%5));
    mesh.visible=false;scene.add(mesh);return mesh;
  });
  const streak=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:0xc1efff,transparent:true,opacity:0}));scene.add(streak);
  const impact=new T.Vector3(0,.25,.115), forward=new T.Vector3(0,0,1), outgoing=new T.Vector3(.12,-.2,1).normalize();
  const incoming=new T.Quaternion().setFromUnitVectors(forward,new T.Vector3(-.15,-.1,-1).normalize());
  const departing=new T.Quaternion().setFromUnitVectors(forward,outgoing);
  const resize=()=>{camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();renderer.setSize(container.clientWidth,container.clientHeight);};
  resize();window.addEventListener('resize',resize);
  let start,raf,disposed=false;
  function tick(now){
    if(disposed)return;
    if(start===undefined)start=now;
    const t=(now-start)/1000, strike=.7, hold=.045;
    const p=Math.min(1,t/strike);
    // A fast, accelerating swing around the grip, ending square at contact.
    const swing=Math.pow(Math.max(0,(p-.35)/.65),3);
    pivot.rotation.set(-1.05*(1-swing),0,-.16*(1-swing));
    shuttle.position.copy(impact).add(new T.Vector3(.18*(1-p),.12*(1-p),1.5*(1-p)));
    shuttle.quaternion.copy(incoming);
    const f=Math.max(0,t-strike-hold);
    if(t>=strike){
      shuttle.quaternion.slerpQuaternions(incoming,departing,Math.min(1,(t-strike)/.065));
      shuttle.position.copy(impact).addScaledVector(outgoing,f*23);
      pivot.rotation.x=Math.min(1.3,f*6);
      pivot.rotation.z=-Math.min(.35,f*2);
      flash.intensity=12*Math.max(0,1-(t-strike)/.16);
      particles.forEach(m=>{m.visible=f<.4;m.position.copy(impact).addScaledVector(m.userData.velocity,f);m.material.opacity=Math.max(0,1-f/.4);});
      const coords=streak.geometry.attributes.position;
      const tail=shuttle.position.clone().addScaledVector(outgoing,-Math.min(2.7,f*23));
      coords.setXYZ(0,tail.x,tail.y,tail.z);coords.setXYZ(1,shuttle.position.x,shuttle.position.y,shuttle.position.z);coords.needsUpdate=true;
      streak.material.opacity=f>0?Math.max(0,1-f/.38):0;
    }
    const distance=camera.aspect<.8?9:6.2;
    const kick=Math.max(0,1-f/.2)*(t>=strike?.07:0);
    camera.position.set(2.1-p*.2+Math.sin(t*90)*kick,.8,distance-p*.3);
    camera.lookAt(0,.1,0);
    renderer.render(scene,camera);
    if(t<1.5)raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);
  return ()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);
    const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();
  };
}
