const s=[{group:"01-navigation",name:"01a-sidebar-default",label:"Sidebar (default)"},{group:"01-navigation",name:"01b-dark-mode",label:"Dark mode"},{group:"01-navigation",name:"01c-light-mode",label:"Light mode"},{group:"02-dashboard",name:"02a-dashboard",label:"Dashboard"},{group:"03-clients",name:"03a-clients-list",label:"Clients list"},{group:"04-reports",name:"04a-reports-list",label:"Reports list"}];function B(e){var c;const r={};for(const d of e)(r[c=d.group]??(r[c]=[])).push(d);return r}function i(e){const r=document.createElement("div");r.style.cssText=`
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  `;for(const[c,d]of Object.entries(B(e))){const l=document.createElement("section");l.style.marginBottom="48px";const x=document.createElement("h2");x.textContent=c,x.style.cssText=`
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      color: #1f2937;
    `,l.appendChild(x);const b=document.createElement("div");b.style.cssText=`
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    `;for(const o of d){const n=document.createElement("div");n.style.cssText=`
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;const t=document.createElement("img");t.src=new URL(`scenarios/${o.group}/${o.name}.png`,document.baseURI).href,t.alt=o.label,t.style.cssText=`
        width: 100%;
        height: auto;
        display: block;
        background: #f3f4f6;
        min-height: 200px;
      `;const a=document.createElement("div");a.style.cssText=`
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      `;const y=document.createElement("span");y.textContent=o.label,a.appendChild(y);const h=document.createElement("code");h.textContent=`${o.name}.png`,h.style.cssText=`
        float: right;
        font-size: 11px;
        color: #9ca3af;
        font-family: 'SF Mono', Monaco, monospace;
      `,a.appendChild(h),t.onerror=()=>{t.style.display="none";const S=document.createElement("div");S.textContent="Screenshot missing — run `npm run e2e:scenarios`",S.style.cssText=`
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          font-style: italic;
          background: #f9fafb;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        `,n.insertBefore(S,a)},n.appendChild(t),n.appendChild(a),b.appendChild(n)}l.appendChild(b),r.appendChild(l)}return r}const D={title:"Gallery/Scenario Screenshots"},p={render:()=>i(s)},m={render:()=>i(s.filter(e=>e.group==="01-navigation"))},g={render:()=>i(s.filter(e=>e.group==="02-dashboard"))},u={render:()=>i(s.filter(e=>e.group==="03-clients"))},f={render:()=>i(s.filter(e=>e.group==="04-reports"))};var E,C,L;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => renderGallery(ALL_SCREENSHOTS)
}`,...(L=(C=p.parameters)==null?void 0:C.docs)==null?void 0:L.source}}};var T,v,R;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => renderGallery(ALL_SCREENSHOTS.filter(s => s.group === '01-navigation'))
}`,...(R=(v=m.parameters)==null?void 0:v.docs)==null?void 0:R.source}}};var N,k,A;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => renderGallery(ALL_SCREENSHOTS.filter(s => s.group === '02-dashboard'))
}`,...(A=(k=g.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var O,_,w;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => renderGallery(ALL_SCREENSHOTS.filter(s => s.group === '03-clients'))
}`,...(w=(_=u.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};var G,H,z;f.parameters={...f.parameters,docs:{...(G=f.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => renderGallery(ALL_SCREENSHOTS.filter(s => s.group === '04-reports'))
}`,...(z=(H=f.parameters)==null?void 0:H.docs)==null?void 0:z.source}}};const M=["AllScenarios","Navigation","Dashboard","Clients","Reports"];export{p as AllScenarios,u as Clients,g as Dashboard,m as Navigation,f as Reports,M as __namedExportsOrder,D as default};
