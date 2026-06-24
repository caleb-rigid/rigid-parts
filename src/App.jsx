import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import './App.css'

const MATERIALS = [
  'A36 Carbon Steel','A572 Gr.50','A500 HSS','A513 DOM Tube',
  'A108 Cold Rolled','304 Stainless Steel','316 Stainless Steel',
  '6061-T6 Aluminum','5052 Aluminum','AR400 Wear Plate','A514 / T-1','Other',
]

const PART_TYPES = [
  'Plate','Beam','Channel','Angle','HSS / Tube','Pipe',
  'Flat Bar','Round Bar','Sheet','Casting','Forging','Weldment','Assembly','Hardware','Other',
]

const DEMO_PARTS = [
  { id:'d1', part_number:'R00001', description:'Base Plate 12x12x1', material:'A36 Carbon Steel', part_type:'Plate', eng_job_number:'E26-001', fab_job_number:'26-126', notes:'Drilled 4x 3/4" holes per drawing', created_by:'Caleb Centracco', created_at: new Date(Date.now()-172800000).toISOString() },
  { id:'d2', part_number:'R00002', description:'Support Gusset 6x6x3/8', material:'A572 Gr.50', part_type:'Plate', eng_job_number:'E26-002', fab_job_number:'26-126', notes:'', created_by:'James Reede', created_at: new Date(Date.now()-86400000).toISOString() },
  { id:'d3', part_number:'R00003', description:'HSS Column 4x4x1/4 x 72"', material:'A500 HSS', part_type:'HSS / Tube', eng_job_number:'E26-003', fab_job_number:'', notes:'Cut to 72" length, cope both ends', created_by:'Caleb Centracco', created_at: new Date().toISOString() },
]

const EMPTY = { description:'', material:'', part_type:'', eng_job_number:'', fab_job_number:'', notes:'', created_by:'' }

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr">
          <span className="modal-title">{title}</span>
          <button className="x-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errs, setErrs] = useState({})
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [demoN, setDemoN] = useState(4)

  const notify = (msg, type='ok') => {
    setToast({msg,type})
    setTimeout(()=>setToast(null),3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const {data,error} = await supabase.from('parts').select('*').order('created_at',{ascending:false})
    if (error || !data) { setIsDemo(true); setParts(DEMO_PARTS) }
    else { setIsDemo(false); setParts(data) }
    setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  const validate = () => {
    const e={}
    if (!form.description.trim()) e.description='Required'
    if (!form.material) e.material='Required'
    if (!form.part_type) e.part_type='Required'
    if (form.eng_job_number && !/^E\d{2}-\d{3,}$/.test(form.eng_job_number.trim())) e.eng_job_number='Format: E26-001'
    if (form.fab_job_number && !/^\d{2}-\d{3,}$/.test(form.fab_job_number.trim())) e.fab_job_number='Format: 26-001'
    setErrs(e)
    return Object.keys(e).length===0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    if (isDemo) {
      const p={ id:`d${demoN}`, part_number:`R${String(demoN).padStart(5,'0')}`, ...form, created_at:new Date().toISOString() }
      setParts(prev=>[p,...prev])
      setDemoN(n=>n+1)
      notify(`Part ${p.part_number} created (demo mode)`)
      setShowForm(false); setForm(EMPTY); setSaving(false); return
    }
    const {data,error} = await supabase.from('parts').insert([{...form,part_number:''}]).select().single()
    if (error) notify(error.message,'err')
    else { notify(`Part ${data.part_number} created`); setParts(prev=>[data,...prev]); setShowForm(false); setForm(EMPTY) }
    setSaving(false)
  }

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); if(errs[k]) setErrs(e=>({...e,[k]:undefined})) }

  const rows = parts.filter(p => {
    const q=search.toLowerCase()
    return !q || [p.part_number,p.description,p.material,p.eng_job_number,p.fab_job_number].some(v=>v?.toLowerCase().includes(q))
  })

  const nextNum = isDemo ? `R${String(demoN).padStart(5,'0')}` :
    parts.length>0 ? `R${String(parseInt(parts[0]?.part_number?.replace('R','')||0)+1).padStart(5,'0')}` : 'R00001'

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
        {isDemo && <span className="demo-pill">DEMO — connect Supabase to persist</span>}
      </div>

      <div className="pg-hdr">
        <div>
          <div className="pg-title-row">
            <span className="pg-num">PARTS</span>
            <span className="pill-open">OPEN</span>
            <span className="pill-norm">NORMAL</span>
          </div>
          <div className="pg-client">Part Number Registry</div>
          <div className="pg-type">Misc. Fabricated Steel</div>
        </div>
        <button className="btn-new" onClick={()=>{setShowForm(true);setForm(EMPTY);setErrs({})}}>+ New Part</button>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-label">TOTAL PARTS</div>
        <div className="progress-track">
          <div className="progress-fill" style={{width: parts.length>0 ? Math.min((parts.length/100)*100,100)+'%' : '0%'}} />
        </div>
        <div className="progress-count">{parts.length} parts</div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-k">Last Assigned</div>
          <div className="stat-v">{parts[0]?.part_number || '—'}</div>
        </div>
        <div className="stat">
          <div className="stat-k">Next Number</div>
          <div className="stat-v orange">{nextNum}</div>
        </div>
        <div className="stat">
          <div className="stat-k">Eng Jobs Linked</div>
          <div className="stat-v">{parts.filter(p=>p.eng_job_number).length}</div>
        </div>
        <div className="stat">
          <div className="stat-k">Fab Jobs Linked</div>
          <div className="stat-v">{parts.filter(p=>p.fab_job_number).length}</div>
        </div>
      </div>

      <div className="main-cols">
        <div className="parts-panel">
          <div className="panel-hdr">
            <span className="panel-label">PARTS</span>
            <input
              className="search"
              type="text"
              placeholder="Search parts…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="msg">Loading…</div>
          ) : rows.length===0 ? (
            <div className="msg">{search ? 'No results.' : 'No parts yet. Create your first part.'}</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Part #</th>
                  <th>Description</th>
                  <th>Material</th>
                  <th>Type</th>
                  <th>Eng Job</th>
                  <th>Fab Job</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(p=>(
                  <tr key={p.id} className="trow" onClick={()=>setSelected(p)}>
                    <td><span className="pnum">{p.part_number}</span></td>
                    <td className="desc">{p.description}</td>
                    <td className="dim">{p.material}</td>
                    <td><span className="tpill">{p.part_type}</span></td>
                    <td className="job">{p.eng_job_number||<span className="na">N/A</span>}</td>
                    <td className="job">{p.fab_job_number||<span className="na">N/A</span>}</td>
                    <td className="dim">{fmt(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="log-panel">
          <div className="panel-hdr">
            <span className="panel-label">ACTIVITY LOG</span>
          </div>
          <div className="log-list">
            {parts.slice(0,8).map(p=>(
              <div key={p.id} className="log-item">
                <span className="log-dot">✓</span>
                <div>
                  <div className="log-line">Part {p.part_number} created</div>
                  <div className="log-meta">{p.created_by||'System'} · {fmt(p.created_at)}</div>
                </div>
              </div>
            ))}
            {parts.length===0 && <div className="dim" style={{padding:'12px'}}>No activity yet</div>}
          </div>
        </div>
      </div>

      {showForm && (
        <Modal title="New Part" onClose={()=>setShowForm(false)}>
          <div className="form-bod">
            <div className="sec-label">Part Details</div>

            <div className="fg">
              <label>Description <span className="req">*</span></label>
              <input className={`fi ${errs.description?'fi-err':''}`} type="text" placeholder="e.g. Base Plate 12x12x1"
                value={form.description} onChange={e=>set('description',e.target.value)} />
              {errs.description&&<span className="em">{errs.description}</span>}
            </div>

            <div className="fg2">
              <div className="fg">
                <label>Material <span className="req">*</span></label>
                <select className={`fi ${errs.material?'fi-err':''}`} value={form.material} onChange={e=>set('material',e.target.value)}>
                  <option value="">Select…</option>
                  {MATERIALS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                {errs.material&&<span className="em">{errs.material}</span>}
              </div>
              <div className="fg">
                <label>Type <span className="req">*</span></label>
                <select className={`fi ${errs.part_type?'fi-err':''}`} value={form.part_type} onChange={e=>set('part_type',e.target.value)}>
                  <option value="">Select…</option>
                  {PART_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                {errs.part_type&&<span className="em">{errs.part_type}</span>}
              </div>
            </div>

            <div className="sec-label" style={{marginTop:'18px'}}>Job References</div>

            <div className="fg2">
              <div className="fg">
                <label>Engineering Job #</label>
                <input className={`fi ${errs.eng_job_number?'fi-err':''}`} type="text" placeholder="E26-001"
                  value={form.eng_job_number} onChange={e=>set('eng_job_number',e.target.value)} />
                {errs.eng_job_number&&<span className="em">{errs.eng_job_number}</span>}
              </div>
              <div className="fg">
                <label>Rigid Fab Job #</label>
                <input className={`fi ${errs.fab_job_number?'fi-err':''}`} type="text" placeholder="26-001"
                  value={form.fab_job_number} onChange={e=>set('fab_job_number',e.target.value)} />
                {errs.fab_job_number&&<span className="em">{errs.fab_job_number}</span>}
              </div>
            </div>

            <div className="fg">
              <label>Created By</label>
              <input className="fi" type="text" placeholder="Your name"
                value={form.created_by} onChange={e=>set('created_by',e.target.value)} />
            </div>

            <div className="fg">
              <label>Notes</label>
              <textarea className="fi ftxt" placeholder="Additional notes or specifications…"
                value={form.notes} onChange={e=>set('notes',e.target.value)} />
            </div>

            <div className="info-box">
              Part number auto-assigned sequentially — <strong>R00001</strong>, <strong>R00002</strong>, …
              {isDemo && <span> (demo: next will be <strong>{nextNum}</strong>)</span>}
            </div>
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn-new" onClick={handleSubmit} disabled={saving}>{saving?'Creating…':'Create Part'}</button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.part_number} onClose={()=>setSelected(null)}>
          <div className="form-bod">
            <div className="view-top">
              <div>
                <div className="vp-num">{selected.part_number}</div>
                <div className="vp-desc">{selected.description}</div>
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <span className="pill-open">OPEN</span>
                <span className="pill-norm">NORMAL</span>
              </div>
            </div>
            <div className="view-grid">
              {[
                ['Material', selected.material],
                ['Type', selected.part_type],
                ['Eng Job #', selected.eng_job_number||'N/A'],
                ['Fab Job #', selected.fab_job_number||'N/A'],
                ['Created By', selected.created_by||'—'],
                ['Created', fmt(selected.created_at)],
              ].map(([k,v])=>(
                <div key={k} className="vf">
                  <div className="vk">{k}</div>
                  <div className="vv">{v}</div>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="fg" style={{marginTop:'16px'}}>
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
