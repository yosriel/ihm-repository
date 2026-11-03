// Read-only audits and explicitly simulated checkout against the running demo.
const { chromium } = require('../front/node_modules/playwright');
const axe = require('../front/node_modules/axe-core');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(__dirname, '..', process.argv[2] || 'outputs/APF3/evidencias');
fs.mkdirSync(out, { recursive: true });
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true });
 const results = {date:new Date().toISOString(), baseURL:'http://localhost:5173', axeVersion:axe.version, browser:await browser.version(), states:[], keyboard:[]};
 for (const width of [320,390,768,1440]) {
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}); const page=await ctx.newPage();
  async function record(name,ids) {
   await page.locator('main h1').waitFor(); await page.waitForTimeout(350);
   await page.addScriptTag({content:axe.source});
   const audit=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,lang:document.documentElement.lang,media:document.querySelectorAll('video,audio,iframe').length,unnamed:[...document.querySelectorAll('button')].filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).length}));
   const entry={name,width,url:page.url(),...metrics,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,tags:v.tags,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:audit.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))};
   results.states.push(entry); fs.writeFileSync(path.join(out,'resultados.json'),JSON.stringify(results,null,2));
   fs.writeFileSync(path.join(out,`${name}-${width}-axe.json`),JSON.stringify(audit,null,2));
   await page.evaluate(text=>{const box=document.createElement('div');box.id='audit-annotation';box.textContent=text;Object.assign(box.style,{position:'fixed',bottom:'8px',left:'8px',zIndex:999999,background:'#fff',color:'#111',padding:'8px',border:'3px solid #b60028',maxWidth:'90%',font:'bold 14px Arial',pointerEvents:'none'});document.body.append(box);},`${ids} | DESPUÉS | ${name} | ${width}px | 03/11/2026`);
   await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
   if(await page.locator('dialog[open]').count()) await page.locator('dialog[open]').screenshot({path:path.join(out,`${name}-${width}-dialogo.png`)});
   await page.locator('#audit-annotation').evaluate(e=>e.remove());
  }
  await page.goto('http://localhost:5173/'); await record('inicio','P1');
  await page.getByRole('button',{name:'Ayuda',exact:true}).click(); await record('ayuda','B04 B05');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Venta telefónica',exact:true}).click();await record('venta-asistida','B04 B05');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Abrir asesoría de compra',exact:true}).click();await record('asesoria','B02');await page.keyboard.press('Escape');
  await page.goto('http://localhost:5173/catalogo?q=freidora'); await page.locator('.product-card').first().waitFor(); await record('catalogo','B01 B02 B03 B04 B05');
  await page.getByRole('button',{name:'Precio',exact:true}).click(); await record('filtros','B03'); await page.keyboard.press('Escape');
  await page.goto('http://localhost:5173/producto/taurus-air-fry'); await page.getByRole('button',{name:'Agregar al carrito'}).waitFor(); await record('producto','B01 B02');
  await page.getByRole('button',{name:'Agregar al carrito'}).click(); await page.getByRole('link',{name:'Ver carrito',exact:true}).click(); await record('carrito','B06');
  await page.getByRole('link',{name:'Continuar con la entrega'}).click(); await record('entrega','P2 etiquetas');
  await page.getByRole('button',{name:'Revisar dirección'}).click(); await record('errores','P2 validación');
  await page.getByLabel('Distrito',{exact:true}).selectOption('Miraflores'); await page.getByLabel('Calle, avenida o jirón').fill('Avenida de Prueba'); await page.getByLabel('Dirección sin número').check();
  await page.getByRole('button',{name:'Revisar dirección'}).click(); await page.getByRole('button',{name:'Usar esta dirección'}).click(); await record('resumen','P2 simulación');
  await page.getByRole('button',{name:'Agregar tarjeta de demostración',exact:true}).click();await record('tarjeta-demo','B07');await page.getByRole('button',{name:'Usar tarjeta de demostración'}).click();await record('tarjeta-error','B07 etiquetas y errores');await page.getByLabel('Código de tarjeta ficticia').fill('DEMO');await page.getByRole('button',{name:'Usar tarjeta de demostración'}).click();
  await page.getByLabel('Acepto las condiciones de compra.').check(); await page.getByRole('button',{name:'Confirmar compra'}).click(); await page.getByRole('heading',{name:'Confirmación completada'}).waitFor(); await record('confirmacion','P2 resultado');
  // Text-spacing override is a separate technical probe, not a full human review.
  await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
  results.states.push({name:'espaciado-confirmacion',width,...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth}))});
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const page=await ctx.newPage();
 async function tabTo(locator) {for(let i=0;i<150;i++){if(await locator.evaluate(el=>el===document.activeElement))return;await page.keyboard.press('Tab');}throw new Error('Tab no alcanza '+await locator.first().textContent());}
 async function activate(locator,key='Enter'){await tabTo(locator);await page.keyboard.press(key);await page.waitForTimeout(200);}
 await page.goto('http://localhost:5173/');
 await tabTo(page.getByRole('searchbox'));await page.keyboard.type('freidora');await page.keyboard.press('Enter');
 await activate(page.getByRole('button',{name:'Precio',exact:true}));await tabTo(page.getByLabel('Precio máximo'));await page.keyboard.type('400');await activate(page.getByRole('button',{name:'Aplicar filtros'}));
 await page.locator('.product-card').first().waitFor();await activate(page.locator('.product-name a[href="/producto/taurus-air-fry"]'));await activate(page.getByRole('button',{name:'Agregar al carrito'}));await activate(page.getByRole('link',{name:'Ver carrito',exact:true}));
 await activate(page.getByRole('link',{name:'Continuar con la entrega'}));await tabTo(page.locator('input[value=home]'));await page.keyboard.press('ArrowRight');await activate(page.getByRole('button',{name:'Continuar a revisión'}));await activate(page.getByLabel('Acepto las condiciones de compra.'),'Space');await activate(page.getByRole('button',{name:'Confirmar compra'}));await page.getByRole('heading',{name:'Confirmación completada'}).waitFor();
 results.keyboard.push({result:'PASS',method:'Tab real para alcanzar cada control; Enter y Espacio; sin locator.focus ni ratón',flow:'búsqueda, precio, producto, carrito, retiro y confirmación',screenReader:'NO EJECUTADO'});
 await ctx.close();await browser.close();fs.writeFileSync(path.join(out,'resultados.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({states:results.states.length,violations:results.states.filter(x=>x.violations?.length).map(x=>({name:x.name,width:x.width,violations:x.violations})),overflow:results.states.filter(x=>x.scrollWidth>x.width+1),keyboard:results.keyboard},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
