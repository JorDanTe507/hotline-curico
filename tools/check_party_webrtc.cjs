const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browsers=[];
 try{
  for(let i=0;i<2;i++)browsers.push(await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']}));
  const [host,guest]=await Promise.all(browsers.map(b=>b.newPage()));
  for(const page of [host,guest])page.setDefaultTimeout(90000);
  await Promise.all([host,guest].map(async(page,index)=>{
   page.on('pageerror',e=>console.error('Navegador:',e.message));
   await page.goto('http://127.0.0.1:5231/hotline-curico/');
   await page.getByRole('button',{name:'Cooperativo online',exact:true}).click();
   await page.getByRole('button',{name:'Iniciar sesión con Google'}).waitFor();
   const login=()=>Promise.all([page.waitForEvent('popup'),page.getByRole('button',{name:'Iniciar sesión con Google'}).click()]).then(v=>v[0]);
   if(index===0){
    const cancelled=await login();await cancelled.close();await page.getByText('Inicio de sesión cancelado.').waitFor();
   }
   const popup=await login();
   await popup.waitForURL('http://127.0.0.1:9099/**');
   await popup.getByText('Add new account',{exact:true}).click();
   await popup.getByText('Auto-generate user information',{exact:true}).click();
   await popup.getByRole('button',{name:'Sign in with Google.com'}).click();
   await page.getByRole('button',{name:'Crear party',exact:true}).waitFor();
  }));
  await host.getByRole('button',{name:'Crear party',exact:true}).click();
  await host.getByLabel('Código de esta sala').waitFor();
  const code=await host.getByLabel('Código de esta sala').inputValue();
  await guest.getByLabel('Código de invitación').fill(code);
  await guest.getByRole('button',{name:'Unirse con código'}).click();
  await guest.waitForFunction(()=>window.hotlineGame.scene.keys.RemoteWorld?.children.getByName('J2')?.visible);
  const id=await host.evaluate(()=>hotlineGame.scene.getScene('Game').coop.actor(2).character.id);
  await guest.reload();
  await guest.getByRole('button',{name:'Cooperativo online',exact:true}).click();
  await guest.waitForFunction(()=>window.hotlineGame.scene.keys.RemoteWorld?.children.getByName('J2')?.visible);
  assert.equal(await host.evaluate(()=>hotlineGame.scene.getScene('Game').coop.actor(2).character.id),id);
  if(!await guest.getByRole('button',{name:'Abandonar sala'}).isVisible())await guest.getByRole('button',{name:'Cooperativo online',exact:true}).click();
  await guest.getByRole('button',{name:'Abandonar sala'}).click();
  await host.waitForFunction(()=>hotlineGame.scene.getScene('Game').coop.partnerControl.status==='voluntary');
  await guest.getByRole('button',{name:'Cerrar sesión'}).click();
  await guest.getByRole('button',{name:'Iniciar sesión con Google'}).waitFor();
  console.log('PASS dos navegadores, Firebase emulado, código privado, WebRTC automático, recarga y abandono voluntario');
 }catch(e){
  for(const b of browsers)for(const ctx of b.contexts())for(const p of ctx.pages()){
   console.error('Estado visible:',await p.locator('.hc-party').innerText({timeout:1000}).catch(()=>'sin panel'));
  }
  throw e;
 }finally{await Promise.all(browsers.map(b=>b.close()))}
})().catch(e=>{console.error(e);process.exitCode=1});
