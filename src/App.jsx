import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import MaterialSelect from './MaterialSelect'
import './App.css'

const PART_TYPES = [
  'Assembly','Sub-Assembly','Weldment','Plate','Beam','Channel',
  'Angle','HSS / Tube','Pipe','Flat Bar','Round Bar','Sheet',
  'Casting','Forging','Hardware','Other',
]

function nextSuffix(existingSuffixes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (!existingSuffixes || existingSuffixes.length === 0) return 'A'
  const sorted = [...existingSuffixes].sort()
  const last = sorted[sorted.length - 1]
  const increment = (s) => {
    const arr = s.split('')
    let i = arr.length - 1
    while (i >= 0) {
      const idx = chars.indexOf(arr[i])
      if (idx < 25) { arr[i] = chars[idx + 1]; return arr.join('') }
      arr[i] = 'A'; i--
    }
    return 'A' + arr.join('')
  }
  return increment(last)
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const DEMO_RECORDS = [
  { id:'da1', part_number:'R00001', record_type:'assembly', description:'Skid Assembly — Alpine Energy', material:'', part_type:'Assembly', eng_job_number:'E26-001', eng_job_name:'Alpine Energy Services', fab_job_number:'26-126', engineer_drafter:'C. Centracco', notes:'Main skid frame', created_at: new Date(Date.now()-172800000).toISOString() },
  { id:'dp1', part_number:'R00001A', record_type:'part', parent_assembly:'R00001', description:'Base Beam', material:'W10x39', part_type:'Beam', eng_job_number:'E26-001', eng_job_name:'Alpine Energy Services', fab_job_number:'26-126', engineer_drafter:'C. Centracco', notes:'Cut to 144"', created_at: new Date(Date.now()-172000000).toISOString() },
  { id:'dp2', part_number:'R00001B', record_type:'part', parent_assembly:'R00001', description:'End Plate', material:'PL1/2" A36', part_type:'Plate', eng_job_number:'E26-001', eng_job_name:'Alpine Energy Services', fab_job_number:'26-126', engineer_drafter:'J. Reede', notes:'', created_at: new Date(Date.now()-86000000).toISOString() },
  { id:'da2', part_number:'R00002', record_type:'assembly', description:'Control Panel Weldment', material:'', part_type:'Weldment', eng_job_number:'E26-002', eng_job_name:'Alpine Energy Services', fab_job_number:'', engineer_drafter:'C. Centracco', notes:'', created_at: new Date(Date.now()-86400000).toISOString() },
  { id:'dv1', part_number:'V00001', record_type:'vendor', description:'3/4-10 Hex Bolt x 2"', manufacturer:'Fastenal', vendor_name:'Fastenal', catalog_number:'11008', material:'Grade 5 Zinc', part_type:'Hardware', engineer_drafter:'', notes:'', created_at: new Date(Date.now()-50000000).toISOString() },
]

const EMPTY_ASSEMBLY = { description:'', material:'', part_type:'Assembly', eng_job_number:'', eng_job_name:'', fab_job_number:'', engineer_drafter:'', notes:'' }
const EMPTY_PART = { description:'', material:'', part_type:'', parent_assembly:'', eng_job_number:'', eng_job_name:'', fab_job_number:'', engineer_drafter:'', notes:'' }
const EMPTY_VENDOR = { description:'', manufacturer:'', vendor_name:'', catalog_number:'', material:'', part_type:'Hardware', engineer_drafter:'', notes:'' }

export default function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [demoCounters, setDemoCounters] = useState({ r: 2, v: 1 })

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({})
  const [errs, setErrs] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  const load = useCallback(async () => {
    setLoading(true)
    const {data,error} = await supabase.from('parts').select('*').order('part_number',{ascending:true})
    if (error || !data) { setIsDemo(true); setRecords(DEMO_RECORDS) }
    else { setIsDemo(false); setRecords(data) }
    setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  const assemblies = records.filter(r=>r.record_type==='assembly').sort((a,b)=>a.part_number.localeCompare(b.part_number))
  const childrenOf = (num) => records.filter(r=>r.record_type==='part' && r.parent_assembly===num).sort((a,b)=>a.part_number.localeCompare(b.part_number))

  const suggestSuffix = (parentNum) => {
    const children = childrenOf(parentNum)
    const suffixes = children.map(c=>c.part_number.replace(parentNum,'')).filter(Boolean)
    return nextSuffix(suffixes)
  }

  const setF = (k,v) => { setForm(f=>({...f,[k]:v})); if(errs[k]) setErrs(e=>({...e,[k]:undefined})) }

  const openForm = (type) => {
    setShowForm(type); setErrs({})
    if (type==='assembly') setForm({...EMPTY_ASSEMBLY})
    else if (type==='part') setForm({...EMPTY_PART})
    else setForm({...EMPTY_VENDOR})
  }

  const validate = () => {
    const e={}
    if (!form.description?.trim()) e.description='Required'
    if (showForm==='part' && !form.parent_assembly) e.parent_assembly='Required'
    if (showForm==='vendor') {
      if (!form.manufacturer?.trim()) e.manufacturer='Required'
      if (!form.vendor_name?.trim()) e.vendor_name='Required'
      if (!form.catalog_number?.trim()) e.catalog_number='Required'
    }
    if (form.eng_job_number && !/^E\d{2}-\d{3,}$/.test(form.eng_job_number.trim())) e.eng_job_number='Format: E26-001'
    if (form.fab_job_number && !/^\d{2}-\d{3,}$/.test(form.fab_job_number.trim())) e.fab_job_number='Format: 26-001'
    setErrs(e)
    return Object.keys(e).length===0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)

    if (isDemo) {
      let newNum = ''
      if (showForm==='assembly') {
        const n = demoCounters.r + 1
        newNum = `R${String(n).padStart(5,'0')}`
        setDemoCounters(c=>({...c,r:n}))
      } else if (showForm==='part') {
        newNum = `${form.parent_assembly}${suggestSuffix(form.parent_assembly)}`
      } else {
        const n = demoCounters.v + 1
        newNum = `V${String(n).padStart(5,'0')}`
        setDemoCounters(c=>({...c,v:n}))
      }
      const rec = { id:`d${Date.now()}`, record_type:showForm, part_number:newNum, ...form, created_at:new Date().toISOString() }
      setRecords(prev=>[...prev, rec].sort((a,b)=>a.part_number.localeCompare(b.part_number)))
      notify(`${newNum} created (demo mode)`)
      setShowForm(null); setSaving(false); return
    }

    const {data,error} = await supabase.from('parts').insert([{...form, record_type:showForm, part_number:''}]).select().single()
    if (error) notify(error.message,'err')
    else {
      notify(`${data.part_number} created`)
      setRecords(prev=>[...prev,data].sort((a,b)=>a.part_number.localeCompare(b.part_number)))
      setShowForm(null)
    }
    setSaving(false)
  }

  const filtered = records.filter(r=>{
    const q=search.toLowerCase()
    const matchTab = tab==='all' || r.record_type===tab
    const matchSearch = !q || [r.part_number,r.description,r.material,r.eng_job_number,r.eng_job_name,r.parent_assembly,r.manufacturer,r.catalog_number].some(v=>v?.toLowerCase().includes(q))
    return matchTab && matchSearch
  })

  const rAssemblies = records.filter(r=>r.record_type==='assembly')
  const rParts = records.filter(r=>r.record_type==='part')
  const rVendors = records.filter(r=>r.record_type==='vendor')
  const nextR = isDemo ? `R${String(demoCounters.r+1).padStart(5,'0')}` :
    rAssemblies.length>0 ? `R${String(parseInt([...rAssemblies].sort((a,b)=>b.part_number.localeCompare(a.part_number))[0]?.part_number?.replace('R','')||0)+1).padStart(5,'0')}` : 'R00001'
  const nextV = isDemo ? `V${String(demoCounters.v+1).padStart(5,'0')}` :
    rVendors.length>0 ? `V${String(parseInt([...rVendors].sort((a,b)=>b.part_number.localeCompare(a.part_number))[0]?.part_number?.replace('V','')||0)+1).padStart(5,'0')}` : 'V00001'

  const parentSuffix = form.parent_assembly ? suggestSuffix(form.parent_assembly) : '?'
  const previewPart = showForm==='part' && form.parent_assembly ? `${form.parent_assembly}${parentSuffix}` : ''

  const FormFields = ({ type }) => (
    <>
      {type==='part' && (
        <div className="fg">
          <label>Parent Assembly <span className="req">*</span></label>
          <select className={`fi ${errs.parent_assembly?'fi-err':''}`} value={form.parent_assembly||''} onChange={e=>setF('parent_assembly',e.target.value)}>
            <option value="">Select assembly…</option>
            {assemblies.map(a=><option key={a.id} value={a.part_number}>{a.part_number} — {a.description}</option>)}
          </select>
          {errs.parent_assembly && <span className="em">{errs.parent_assembly}</span>}
          {form.parent_assembly && (
            <div className="parent-note">Next suffix: <strong>{parentSuffix}</strong> → <strong>{form.parent_assembly}{parentSuffix}</strong></div>
          )}
        </div>
      )}

      <div className="fg">
        <label>Description <span className="req">*</span></label>
        <input className={`fi ${errs.description?'fi-err':''}`} type="text"
          placeholder={type==='assembly'?'e.g. Skid Assembly — Alpine Energy':type==='part'?'e.g. Base Beam W10x39 x 144"':'e.g. 3/4-10 Hex Bolt x 2"'}
          value={form.description||''} onChange={e=>setF('description',e.target.value)} />
        {errs.description && <span className="em">{errs.description}</span>}
      </div>

      {type !== 'vendor' && (
        <div className="fg">
          <label>Type</label>
          <select className="fi" value={form.part_type||''} onChange={e=>setF('part_type',e.target.value)}>
            <option value="">Select type…</option>
            {PART_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      <div className="fg">
        <label>Material</label>
        {type==='vendor' ? (
          <input className="fi" type="text" placeholder="e.g. Grade 5 Zinc, 304 SS…"
            value={form.material||''} onChange={e=>setF('material',e.target.value)} />
        ) : (
          <MaterialSelect value={form.material||''} onChange={v=>setF('material',v)} />
        )}
      </div>

      {type==='vendor' && (
        <>
          <div className="fg">
            <label>Manufacturer <span className="req">*</span></label>
            <input className={`fi ${errs.manufacturer?'fi-err':''}`} type="text" placeholder="e.g. Parker, Fastenal, Siemens"
              value={form.manufacturer||''} onChange={e=>setF('manufacturer',e.target.value)} />
            {errs.manufacturer && <span className="em">{errs.manufacturer}</span>}
          </div>
          <div className="fg">
            <label>Vendor Name <span className="req">*</span></label>
            <input className={`fi ${errs.vendor_name?'fi-err':''}`} type="text" placeholder="e.g. Fastenal, MSC, McMaster"
              value={form.vendor_name||''} onChange={e=>setF('vendor_name',e.target.value)} />
            {errs.vendor_name && <span className="em">{errs.vendor_name}</span>}
          </div>
          <div className="fg">
            <label>Catalog / Model # <span className="req">*</span></label>
            <input className={`fi ${errs.catalog_number?'fi-err':''}`} type="text" placeholder="e.g. 11008"
              value={form.catalog_number||''} onChange={e=>setF('catalog_number',e.target.value)} />
            {errs.catalog_number && <span className="em">{errs.catalog_number}</span>}
          </div>
        </>
      )}

      {type !== 'vendor' && (
        <>
          <div className="fg">
            <label>Eng Job #</label>
            <input className={`fi ${errs.eng_job_number?'fi-err':''}`} type="text" placeholder="E26-001"
              value={form.eng_job_number||''} onChange={e=>setF('eng_job_number',e.target.value)} />
            {errs.eng_job_number && <span className="em">{errs.eng_job_number}</span>}
          </div>
          <div className="fg">
            <label>Eng Job Name</label>
            <input className="fi" type="text" placeholder="e.g. Alpine Energy Services"
              value={form.eng_job_name||''} onChange={e=>setF('eng_job_name',e.target.value)} />
          </div>
          <div className="fg">
            <label>Fab Job #</label>
            <input className={`fi ${errs.fab_job_number?'fi-err':''}`} type="text" placeholder="26-001"
              value={form.fab_job_number||''} onChange={e=>setF('fab_job_number',e.target.value)} />
            {errs.fab_job_number && <span className="em">{errs.fab_job_number}</span>}
          </div>
        </>
      )}

      <div className="fg">
        <label>Engineer / Drafter</label>
        <input className="fi" type="text" placeholder="e.g. C. Centracco"
          value={form.engineer_drafter||''} onChange={e=>setF('engineer_drafter',e.target.value)} />
      </div>

      <div className="fg">
        <label>Notes</label>
        <textarea className="fi ftxt" placeholder="Additional notes…"
          value={form.notes||''} onChange={e=>setF('notes',e.target.value)} />
      </div>
    </>
  )

  return (
    <div className="app">
      <header className="hdr">
        <div className="logo-wrap">
          <span className="logo-r">RIGID</span>
          <span className="logo-sub">INDUSTRIAL GROUP</span>
        </div>
        <nav className="nav">
          <span className="nl active">PARTS</span>
          <span className="nl">JOBS</span>
          <span className="nl">SCHEDULE</span>
          <span className="nl">REPORTS</span>
          <span className="nl">WORKFORCE</span>
        </nav>
        <div className="usr">
          <div className="usr-name">Caleb Centracco</div>
          <div className="usr-role">Project Manager</div>
        </div>
      </header>

      <div className="bc">
        <span className="bc-a">Parts</span>
        <span className="bc-sep"> / </span>
        <span className="bc-b">Registry</span>
        {isDemo && <span className="demo-pill">DEMO MODE</span>}
      </div>

      <div className="pg-hdr">
        <div>
          <div className="pg-title-row">
            <span className="pg-num">PARTS</span>
            <span className="pill-open">OPEN</span>
            <span className="pill-norm">NORMAL</span>
          </div>
          <div className="pg-client">Part &amp; Assembly Number Registry</div>
          <div className="pg-type">Misc. Fabricated Steel</div>
        </div>
        <div className="btn-group">
          <button className="btn-new" onClick={()=>openForm('assembly')}>+ Assembly</button>
          <button className="btn-new btn-part" onClick={()=>openForm('part')}>+ Part</button>
          <button className="btn-new btn-vendor" onClick={()=>openForm('vendor')}>+ Vendor Part</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat"><div className="stat-k">Next Assembly #</div><div className="stat-v orange">{nextR}</div></div>
        <div className="stat"><div className="stat-k">Assemblies</div><div className="stat-v">{rAssemblies.length}</div></div>
        <div className="stat"><div className="stat-k">Parts</div><div className="stat-v">{rParts.length}</div></div>
        <div className="stat"><div className="stat-k">Vendor Parts</div><div className="stat-v">{rVendors.length}</div></div>
      </div>

      <div className="main-cols">
        <div className="parts-panel">
          <div className="panel-hdr">
            <div className="tab-row">
              {[['all','All'],['assembly','Assemblies'],['part','Parts'],['vendor','Vendor']].map(([k,l])=>(
                <button key={k} className={`tab ${tab===k?'tab-active':''}`} onClick={()=>setTab(k)}>{l}</button>
              ))}
            </div>
            <input className="search" type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>

          {loading ? <div className="msg">Loading…</div> : filtered.length===0 ? (
            <div className="msg">{search?'No results.':'No records yet.'}</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Material</th>
                  <th>Eng Job #</th>
                  <th>Eng Job Name</th>
                  <th>Parent / Mfr</th>
                  <th>Eng / Drafter</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} className={`trow trow-${r.record_type}`} onClick={()=>setSelected(r)}>
                    <td><span className={`pnum pnum-${r.record_type}`}>{r.part_number}</span></td>
                    <td><span className={`rtag rtag-${r.record_type}`}>{r.record_type==='assembly'?'ASM':r.record_type==='part'?'PART':'VND'}</span></td>
                    <td className="desc">{r.description}</td>
                    <td className="dim">{r.material||<span className="na">—</span>}</td>
                    <td className="job">{r.eng_job_number||<span className="na">—</span>}</td>
                    <td className="dim">{r.eng_job_name||<span className="na">—</span>}</td>
                    <td className="job">{r.parent_assembly||r.manufacturer||<span className="na">—</span>}</td>
                    <td className="dim">{r.engineer_drafter||<span className="na">—</span>}</td>
                    <td className="dim">{fmt(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="log-panel">
          <div className="panel-hdr"><span className="panel-label">ACTIVITY LOG</span></div>
          <div className="log-list">
            {[...records].sort((a,b)=>b.created_at>a.created_at?1:-1).slice(0,12).map(r=>(
              <div key={r.id} className="log-item">
                <span className={`log-dot ld-${r.record_type}`}>✓</span>
                <div>
                  <div className="log-line"><span className={`pnum-sm pnum-${r.record_type}`}>{r.part_number}</span>{r.description}</div>
                  <div className="log-meta">{r.engineer_drafter||'System'} · {fmt(r.created_at)}</div>
                </div>
              </div>
            ))}
            {records.length===0 && <div className="dim" style={{padding:'12px'}}>No activity yet</div>}
          </div>
        </div>
      </div>

      {showForm==='assembly' && (
        <Modal title="New Assembly" subtitle={`Will be assigned: ${nextR}`} onClose={()=>setShowForm(null)}>
          <div className="form-bod">
            <div className="preview-num">{nextR}</div>
            <FormFields type="assembly" />
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setShowForm(null)}>Cancel</button>
            <button className="btn-new" onClick={handleSubmit} disabled={saving}>{saving?'Creating…':'Create Assembly'}</button>
          </div>
        </Modal>
      )}

      {showForm==='part' && (
        <Modal title="New Part" subtitle={previewPart ? `Will be assigned: ${previewPart}` : 'Select a parent assembly'} onClose={()=>setShowForm(null)}>
          <div className="form-bod">
            {previewPart && <div className="preview-num">{previewPart}</div>}
            <div className="info-box" style={{marginBottom:'14px'}}>
              This part can be referenced in multiple assemblies. Its number is permanent.
            </div>
            <FormFields type="part" />
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setShowForm(null)}>Cancel</button>
            <button className="btn-new btn-part" onClick={handleSubmit} disabled={saving}>{saving?'Creating…':'Create Part'}</button>
          </div>
        </Modal>
      )}

      {showForm==='vendor' && (
        <Modal title="New Vendor Part" subtitle={`Will be assigned: ${nextV}`} onClose={()=>setShowForm(null)}>
          <div className="form-bod">
            <div className="preview-num vnum">{nextV}</div>
            <FormFields type="vendor" />
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setShowForm(null)}>Cancel</button>
            <button className="btn-new btn-vendor" onClick={handleSubmit} disabled={saving}>{saving?'Creating…':'Create Vendor Part'}</button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.part_number} subtitle={selected.description} onClose={()=>setSelected(null)}>
          <div className="form-bod">
            <div className="view-top">
              <span className={`pnum-lg pnum-${selected.record_type}`}>{selected.part_number}</span>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}}>
                <span className={`rtag rtag-${selected.record_type}`}>{selected.record_type==='assembly'?'ASSEMBLY':selected.record_type==='part'?'PART':'VENDOR'}</span>
                <span className="pill-open">OPEN</span>
              </div>
            </div>
            <div className="vp-desc">{selected.description}</div>
            <div className="view-grid">
              {selected.record_type!=='vendor' ? <>
                <div className="vf"><div className="vk">Material</div><div className="vv">{selected.material||'—'}</div></div>
                <div className="vf"><div className="vk">Type</div><div className="vv">{selected.part_type||'—'}</div></div>
                <div className="vf"><div className="vk">Eng Job #</div><div className="vv orange">{selected.eng_job_number||'—'}</div></div>
                <div className="vf"><div className="vk">Eng Job Name</div><div className="vv">{selected.eng_job_name||'—'}</div></div>
                <div className="vf"><div className="vk">Fab Job #</div><div className="vv">{selected.fab_job_number||'—'}</div></div>
                {selected.record_type==='part' && <div className="vf"><div className="vk">Parent Assembly</div><div className="vv orange">{selected.parent_assembly||'—'}</div></div>}
                <div className="vf"><div className="vk">Engineer / Drafter</div><div className="vv">{selected.engineer_drafter||'—'}</div></div>
              </> : <>
                <div className="vf"><div className="vk">Manufacturer</div><div className="vv">{selected.manufacturer||'—'}</div></div>
                <div className="vf"><div className="vk">Vendor</div><div className="vv">{selected.vendor_name||'—'}</div></div>
                <div className="vf"><div className="vk">Catalog #</div><div className="vv orange">{selected.catalog_number||'—'}</div></div>
                <div className="vf"><div className="vk">Material / Spec</div><div className="vv">{selected.material||'—'}</div></div>
                <div className="vf"><div className="vk">Engineer / Drafter</div><div className="vv">{selected.engineer_drafter||'—'}</div></div>
              </>}
              <div className="vf"><div className="vk">Created</div><div className="vv">{fmt(selected.created_at)}</div></div>
            </div>

            {selected.record_type==='assembly' && childrenOf(selected.part_number).length > 0 && (
              <div style={{marginTop:'16px'}}>
                <div className="sec-label">Parts in this assembly</div>
                {childrenOf(selected.part_number).map(c=>(
                  <div key={c.id} className="child-row" onClick={()=>setSelected(c)}>
                    <span className="pnum-sm pnum-part">{c.part_number}</span>
                    <span className="dim">{c.description}</span>
                    <span className="dim" style={{marginLeft:'auto'}}>{c.material}</span>
                  </div>
                ))}
              </div>
            )}
            {selected.notes && (
              <div style={{marginTop:'16px'}}>
                <div className="vk">Notes</div>
                <div className="vnotes">{selected.notes}</div>
              </div>
            )}
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}

      {toast && <div className={`toast ${toast.type==='err'?'toast-err':'toast-ok'}`}>{toast.msg}</div>}
    </div>
  )
}
