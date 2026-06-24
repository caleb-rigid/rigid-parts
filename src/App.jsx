import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import './App.css'

// ─── CONSTANTS ───────────────────────────────────────────────
const MAT = {
  'Wide Flange (W)': ['W4x13','W5x16','W5x19','W6x9','W6x12','W6x15','W6x20','W6x25','W8x10','W8x13','W8x15','W8x18','W8x21','W8x24','W8x28','W8x31','W8x35','W8x40','W8x48','W8x58','W10x12','W10x15','W10x17','W10x19','W10x22','W10x26','W10x30','W10x33','W10x39','W10x45','W10x49','W10x54','W10x60','W12x14','W12x16','W12x19','W12x22','W12x26','W12x30','W12x35','W12x40','W12x45','W12x50','W12x53','W12x58','W12x65','W14x22','W14x26','W14x30','W14x34','W14x38','W14x43','W14x48','W14x53','W14x61','W14x68','W16x26','W16x31','W16x36','W16x40','W16x45','W16x50','W18x35','W18x40','W18x46','W18x50','W18x55','W18x60','W21x44','W21x50','W21x57','W24x55','W24x62','W24x68'],
  'S-Beam (S)': ['S3x5.7','S3x7.5','S4x7.7','S4x9.5','S5x10','S5x14.75','S6x12.5','S6x17.25','S8x18.4','S8x23','S10x25.4','S10x35','S12x31.8','S12x35','S12x40.8','S15x42.9','S15x50'],
  'Channel (C)': ['C3x4.1','C3x5','C3x6','C4x5.4','C4x7.25','C5x6.7','C5x9','C6x8.2','C6x10.5','C6x13','C7x9.8','C7x12.25','C8x11.5','C8x13.75','C8x18.75','C9x13.4','C9x15','C9x20','C10x15.3','C10x20','C10x25','C12x20.7','C12x25','C12x30','C15x33.9','C15x40','C15x50'],
  'Angle (L)': ['L1-1/2x1-1/2x1/8','L1-1/2x1-1/2x3/16','L2x2x1/8','L2x2x3/16','L2x2x1/4','L2x2x5/16','L2-1/2x2-1/2x3/16','L2-1/2x2-1/2x1/4','L3x3x3/16','L3x3x1/4','L3x3x5/16','L3x3x3/8','L3-1/2x3-1/2x1/4','L3-1/2x3-1/2x5/16','L4x4x1/4','L4x4x5/16','L4x4x3/8','L4x4x1/2','L5x5x5/16','L5x5x3/8','L5x5x1/2','L6x6x3/8','L6x6x1/2','L6x6x5/8'],
  'HSS Square / Rect': ['HSS1x1x1/8','HSS1-1/2x1-1/2x1/8','HSS2x2x1/8','HSS2x2x3/16','HSS2x2x1/4','HSS2-1/2x2-1/2x3/16','HSS2-1/2x2-1/2x1/4','HSS3x3x3/16','HSS3x3x1/4','HSS3x3x5/16','HSS3x3x3/8','HSS4x4x3/16','HSS4x4x1/4','HSS4x4x5/16','HSS4x4x3/8','HSS4x4x1/2','HSS5x5x3/16','HSS5x5x1/4','HSS5x5x5/16','HSS5x5x3/8','HSS5x5x1/2','HSS6x6x3/16','HSS6x6x1/4','HSS6x6x5/16','HSS6x6x3/8','HSS6x6x1/2','HSS8x8x1/4','HSS8x8x3/8','HSS8x8x1/2','HSS10x10x3/8','HSS10x10x1/2','HSS12x12x1/2','HSS3x2x3/16','HSS3x2x1/4','HSS4x2x3/16','HSS4x2x1/4','HSS4x3x1/4','HSS6x2x3/16','HSS6x2x1/4','HSS6x3x1/4','HSS6x4x1/4','HSS6x4x3/8','HSS8x4x1/4','HSS8x4x3/8','HSS8x6x3/8'],
  'HSS Round': ['HSS1.315x0.133','HSS1.660x0.140','HSS1.900x0.145','HSS2.375x0.154','HSS2.375x0.218','HSS2.875x0.203','HSS2.875x0.276','HSS3.500x0.216','HSS3.500x0.300','HSS4.000x0.226','HSS4.000x0.313','HSS4.500x0.237','HSS4.500x0.337','HSS5.563x0.258','HSS6.625x0.280','HSS6.625x0.432','HSS8.625x0.322','HSS8.625x0.500','HSS10.750x0.365','HSS12.750x0.375'],
  'Pipe (Sch 40)': ['1/2" Sch 40','3/4" Sch 40','1" Sch 40','1-1/4" Sch 40','1-1/2" Sch 40','2" Sch 40','2-1/2" Sch 40','3" Sch 40','3-1/2" Sch 40','4" Sch 40','5" Sch 40','6" Sch 40','8" Sch 40','10" Sch 40','12" Sch 40'],
  'Pipe (Sch 80)': ['1/2" Sch 80','3/4" Sch 80','1" Sch 80','1-1/4" Sch 80','1-1/2" Sch 80','2" Sch 80','2-1/2" Sch 80','3" Sch 80','4" Sch 80','6" Sch 80','8" Sch 80'],
  'Flat Bar': ['1/8x1','1/8x1-1/2','1/8x2','3/16x1','3/16x1-1/2','3/16x2','3/16x3','1/4x1','1/4x1-1/2','1/4x2','1/4x2-1/2','1/4x3','1/4x4','1/4x6','3/8x1','3/8x1-1/2','3/8x2','3/8x3','3/8x4','3/8x6','1/2x1','1/2x2','1/2x3','1/2x4','1/2x6','3/4x2','3/4x3','3/4x4','3/4x6','1x2','1x3','1x4','1x6'],
  'Round Bar': ['1/4"','3/8"','1/2"','5/8"','3/4"','7/8"','1"','1-1/4"','1-1/2"','1-3/4"','2"','2-1/2"','3"','3-1/2"','4"'],
  'Plate': '__plate__',
  'Sheet Metal': '__sheet__',
  'Other': '__other__',
}
const PLATE_GRADES = ['A36','A572 Gr.50','AR400','A514 / T-1']
const PLATE_THK = ['3/16"','1/4"','5/16"','3/8"','7/16"','1/2"','5/8"','3/4"','7/8"','1"','1-1/4"','1-1/2"','2"']
const SHEET_MATS = ['HR Steel','CR Steel','304 Stainless','316 Stainless','6061-T6 Aluminum','5052 Aluminum']
const SHEET_GA = ['26ga','24ga','22ga','20ga','18ga','16ga','14ga','12ga','11ga','10ga','7ga','3/16"']

const PART_TYPES = ['Weldment','Plate','Beam','Channel','Angle','HSS / Tube','Pipe','Flat Bar','Round Bar','Sheet','Casting','Forging','Hardware','Other']
const R_CLASSES = ['Assembly','Sub-Assembly','Part']

const PERSONNEL = [
  { name:'C. Centracco', role:'Engineer' },
  { name:'A. Germann',   role:'Engineer' },
  { name:'Z. Rader',     role:'Engineer' },
  { name:'P. Centracco', role:'Engineer' },
  { name:'G. Downing',   role:'Drafter'  },
  { name:'A. Wallenmeyer', role:'Drafter' },
  { name:'C. German',    role:'Drafter'  },
]

// ─── MATERIAL PICKER (outside App to prevent remount) ────────
function MaterialPicker({ matCat, matSize, matSub1, matSub2, onChange }) {
  const sizes = MAT[matCat]
  const isPlate = matCat === 'Plate'
  const isSheet = matCat === 'Sheet Metal'
  const isOther = matCat === 'Other'
  const hasSizes = Array.isArray(sizes)
  const preview = (() => {
    if (!matCat) return ''
    if (isPlate) return matSub1 && matSub2 ? `PL${matSub2} ${matSub1}` : matSub1 ? `Plate ${matSub1}` : 'Plate'
    if (isSheet) return matSub1 && matSub2 ? `${matSub2} ${matSub1}` : matSub1 || 'Sheet Metal'
    if (isOther) return matSub1 || 'Other'
    return matSize || matCat
  })()
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      <select className="fi" value={matCat} onChange={e=>onChange({matCat:e.target.value,matSize:'',matSub1:'',matSub2:''})}>
        <option value="">Select category…</option>
        {Object.keys(MAT).map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      {hasSizes && <select className="fi" value={matSize} onChange={e=>onChange({matCat,matSize:e.target.value,matSub1,matSub2})}>
        <option value="">Select size…</option>
        {sizes.map(s=><option key={s} value={s}>{s}</option>)}
      </select>}
      {isPlate && <>
        <select className="fi" value={matSub1} onChange={e=>onChange({matCat,matSize,matSub1:e.target.value,matSub2})}>
          <option value="">Select grade…</option>
          {PLATE_GRADES.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
        <select className="fi" value={matSub2} onChange={e=>onChange({matCat,matSize,matSub1,matSub2:e.target.value})}>
          <option value="">Select thickness…</option>
          {PLATE_THK.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </>}
      {isSheet && <>
        <select className="fi" value={matSub1} onChange={e=>onChange({matCat,matSize,matSub1:e.target.value,matSub2})}>
          <option value="">Select material…</option>
          {SHEET_MATS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select className="fi" value={matSub2} onChange={e=>onChange({matCat,matSize,matSub1,matSub2:e.target.value})}>
          <option value="">Select gauge / thickness…</option>
          {SHEET_GA.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </>}
      {isOther && <input className="fi" type="text" placeholder="Describe material…" value={matSub1}
        onChange={e=>onChange({matCat,matSize,matSub1:e.target.value,matSub2})} />}
      {preview && <div style={{fontFamily:'Courier New,monospace',fontSize:'12px',color:'#f97316',background:'#111',border:'1px solid #1e1e1e',borderLeft:'3px solid #f97316',padding:'6px 10px',borderRadius:'4px'}}>{preview}</div>}
    </div>
  )
}

// ─── ASSEMBLY MULTI-SELECT ────────────────────────────────────
function AssemblyMultiSelect({ assemblies, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const toggle = num => onChange(selected.includes(num) ? selected.filter(x=>x!==num) : [...selected, num])
  return (
    <div ref={ref} style={{position:'relative'}}>
      <div className="fi multi-trigger" onClick={()=>setOpen(o=>!o)}>
        {selected.length===0 && <span style={{color:'#444'}}>Select parent assemblies…</span>}
        {selected.map(s=><span key={s} className="multi-tag" onClick={e=>{e.stopPropagation();toggle(s)}}>{s} ✕</span>)}
      </div>
      {open && (
        <div className="multi-drop">
          {assemblies.length===0 && <div style={{padding:'10px',color:'#555',fontSize:'12px'}}>No assemblies yet</div>}
          {assemblies.map(a=>(
            <div key={a.id} className={`multi-opt ${selected.includes(a.part_number)?'multi-opt-sel':''}`} onClick={()=>toggle(a.part_number)}>
              <span className="pnum-sm pnum-r_number">{a.part_number}</span>
              <span style={{color:'#aaa'}}>{a.description}</span>
              {selected.includes(a.part_number) && <span style={{marginLeft:'auto',color:'#f97316'}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────
function nextSuffix(existingSuffixes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (!existingSuffixes || existingSuffixes.length === 0) return 'A'
  const sorted = [...existingSuffixes].sort()
  const last = sorted[sorted.length - 1]
  const increment = s => {
    const arr = s.split('')
    let i = arr.length - 1
    while (i >= 0) {
      const idx = chars.indexOf(arr[i])
      if (idx < 25) { arr[i] = chars[idx+1]; return arr.join('') }
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

function matPreview(f) {
  const { matCat='', matSize='', matSub1='', matSub2='' } = f
  if (!matCat) return ''
  if (matCat==='Plate') return matSub1&&matSub2 ? `PL${matSub2} ${matSub1}` : matSub1 ? `Plate ${matSub1}` : 'Plate'
  if (matCat==='Sheet Metal') return matSub1&&matSub2 ? `${matSub2} ${matSub1}` : matSub1||'Sheet Metal'
  if (matCat==='Other') return matSub1||'Other'
  return matSize||matCat
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

// ─── DEMO DATA ────────────────────────────────────────────────
const DEMO = [
  {id:'da1',part_number:'R00001',record_type:'r_number',r_class:'Assembly',description:'Skid Assembly — Alpine Energy',material:'',part_type:'Weldment',parent_assemblies:[],eng_job_number:'E26-001',eng_job_name:'Alpine Energy Services',fab_job_number:'26-126',engineer_drafter:'C. Centracco',notes:'',created_at:new Date(Date.now()-172800000).toISOString()},
  {id:'dp1',part_number:'R00001A',record_type:'r_number',r_class:'Part',description:'Base Beam',material:'W10x39',part_type:'Beam',parent_assemblies:['R00001'],eng_job_number:'E26-001',eng_job_name:'Alpine Energy Services',fab_job_number:'26-126',engineer_drafter:'C. Centracco',notes:'Cut to 144"',created_at:new Date(Date.now()-172000000).toISOString()},
  {id:'dp2',part_number:'R00001B',record_type:'r_number',r_class:'Part',description:'End Plate',material:'PL1/2" A36',part_type:'Plate',parent_assemblies:['R00001','R00002'],eng_job_number:'E26-001',eng_job_name:'Alpine Energy Services',fab_job_number:'26-126',engineer_drafter:'J. Reede',notes:'Used in both skids',created_at:new Date(Date.now()-86000000).toISOString()},
  {id:'da2',part_number:'R00002',record_type:'r_number',r_class:'Assembly',description:'Control Panel Weldment',material:'',part_type:'Weldment',parent_assemblies:[],eng_job_number:'E26-002',eng_job_name:'Alpine Energy Services',fab_job_number:'',engineer_drafter:'C. Centracco',notes:'',created_at:new Date(Date.now()-86400000).toISOString()},
  {id:'dv1',part_number:'V00001',record_type:'vendor',description:'3/4-10 Hex Bolt x 2"',manufacturer:'Fastenal',vendor_name:'Fastenal',catalog_number:'11008',material:'Grade 5 Zinc',engineer_drafter:'',notes:'',created_at:new Date(Date.now()-50000000).toISOString()},
]

const EMPTY_R = {r_class:'Assembly',description:'',matCat:'',matSize:'',matSub1:'',matSub2:'',part_type:'',parent_assemblies:[],eng_job_number:'',eng_job_name:'',fab_job_number:'',engineer_drafter:'',notes:''}
const EMPTY_V = {description:'',manufacturer:'',vendor_name:'',catalog_number:'',material:'',engineer_drafter:'',notes:''}

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [demoR, setDemoR] = useState(2)
  const [demoV, setDemoV] = useState(1)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(null)
  const [editTarget, setEditTarget] = useState(null) // record being edited
  const [form, setForm] = useState({})
  const [errs, setErrs] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  const load = useCallback(async () => {
    setLoading(true)
    const {data,error} = await supabase.from('parts').select('*').order('part_number',{ascending:true})
    if (error||!data) { setIsDemo(true); setRecords(DEMO) }
    else { setIsDemo(false); setRecords(data) }
    setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  const rRecords = records.filter(r=>r.record_type==='r_number').sort((a,b)=>a.part_number.localeCompare(b.part_number))
  const vendors = records.filter(r=>r.record_type==='vendor').sort((a,b)=>a.part_number.localeCompare(b.part_number))
  const topLevelAssemblies = rRecords.filter(r=>/^R\d{5}$/.test(r.part_number))

  const suggestNext = parentNum => {
    const children = rRecords.filter(r => {
      const rest = r.part_number.replace(parentNum,'')
      return r.part_number.startsWith(parentNum) && rest.length>0 && /^[A-Z]+$/.test(rest)
    })
    return nextSuffix(children.map(c=>c.part_number.replace(parentNum,'')))
  }

  const nextRTop = () => {
    const nums = rRecords.filter(r=>/^R\d{5}$/.test(r.part_number)).map(r=>parseInt(r.part_number.replace('R','')))
    const max = nums.length>0 ? Math.max(...nums) : isDemo ? demoR : 0
    return `R${String(max+1).padStart(5,'0')}`
  }

  const nextVNum = () => {
    const nums = vendors.map(v=>parseInt(v.part_number.replace('V','')))
    const max = nums.length>0 ? Math.max(...nums) : isDemo ? demoV : 0
    return `V${String(max+1).padStart(5,'0')}`
  }

  const isPart = form.r_class === 'Part'
  const primaryParent = (form.parent_assemblies||[])[0]
  const previewNum = (() => {
    if (showForm==='vendor') return nextVNum()
    if (editTarget) return editTarget.part_number
    if (isPart && primaryParent) return `${primaryParent}${suggestNext(primaryParent)}`
    return nextRTop()
  })()

  const setF = (k,v) => { setForm(f=>({...f,[k]:v})); if(errs[k]) setErrs(e=>({...e,[k]:undefined})) }
  const setMat = fields => setForm(f=>({...f,...fields}))

  const openNew = type => {
    setShowForm(type); setEditTarget(null); setErrs({})
    setForm(type==='r_number' ? {...EMPTY_R} : {...EMPTY_V})
  }

  const openEdit = rec => {
    setEditTarget(rec)
    setShowForm(rec.record_type)
    setErrs({})
    // Pre-fill form — material fields are stored as string so just put in notes
    setForm({
      r_class: rec.r_class||'Assembly',
      description: rec.description||'',
      matCat:'', matSize:'', matSub1:'', matSub2:'',
      part_type: rec.part_type||'',
      parent_assemblies: rec.parent_assemblies||[],
      eng_job_number: rec.eng_job_number||'',
      eng_job_name: rec.eng_job_name||'',
      fab_job_number: rec.fab_job_number||'',
      engineer_drafter: rec.engineer_drafter||'',
      notes: rec.notes||'',
      // vendor
      manufacturer: rec.manufacturer||'',
      vendor_name: rec.vendor_name||'',
      catalog_number: rec.catalog_number||'',
      material: rec.material||'',
    })
    setSelected(null)
  }

  const validate = () => {
    const e={}
    if (!form.description?.trim()) e.description='Required'
    if (!form.engineer_drafter) e.engineer_drafter='Required'
    if (showForm==='r_number') {
      if (!form.eng_job_number?.trim()) e.eng_job_number='Required'
      else if (!/^E\d{2}-\d{3,}$/.test(form.eng_job_number.trim())) e.eng_job_number='Format: E26-001'
      if (isPart && !primaryParent) e.parent_assemblies='Select at least one parent assembly'
      if (form.fab_job_number && !/^\d{2}-\d{3,}$/.test(form.fab_job_number.trim())) e.fab_job_number='Format: 26-001'
    }
    if (showForm==='vendor') {
      if (!form.manufacturer?.trim()) e.manufacturer='Required'
      if (!form.vendor_name?.trim()) e.vendor_name='Required'
      if (!form.catalog_number?.trim()) e.catalog_number='Required'
    }
    setErrs(e)
    return Object.keys(e).length===0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)

    const material = showForm==='r_number'
      ? (matPreview(form) || form.material || '')
      : (form.material||'')

    if (isDemo) {
      if (editTarget) {
        setRecords(prev=>prev.map(r=>r.id===editTarget.id ? {...r,...form,material} : r).sort((a,b)=>a.part_number.localeCompare(b.part_number)))
        notify(`${editTarget.part_number} updated (demo)`)
      } else {
        const num = showForm==='r_number'
          ? (isPart && primaryParent ? `${primaryParent}${suggestNext(primaryParent)}` : nextRTop())
          : nextVNum()
        const rec = {id:`d${Date.now()}`,record_type:showForm,part_number:num,...form,material,created_at:new Date().toISOString()}
        setRecords(prev=>[...prev,rec].sort((a,b)=>a.part_number.localeCompare(b.part_number)))
        if (showForm==='r_number') setDemoR(n=>Math.max(n,parseInt(num.match(/\d{5}/)?.[0]||'0')))
        else setDemoV(n=>n+1)
        notify(`${num} created (demo)`)
      }
      setShowForm(null); setEditTarget(null); setSaving(false); return
    }

    const { matCat, matSize, matSub1, matSub2, ...formClean } = form

    if (editTarget) {
      const {error} = await supabase.from('parts').update({...formClean,material}).eq('id',editTarget.id)
      if (error) notify(error.message,'err')
      else {
        notify(`${editTarget.part_number} updated`)
        setRecords(prev=>prev.map(r=>r.id===editTarget.id?{...r,...formClean,material}:r).sort((a,b)=>a.part_number.localeCompare(b.part_number)))
        setShowForm(null); setEditTarget(null)
      }
    } else {
      const {data,error} = await supabase.from('parts').insert([{...formClean,material,record_type:showForm,part_number:''}]).select().single()
      if (error) notify(error.message,'err')
      else {
        notify(`${data.part_number} created`)
        setRecords(prev=>[...prev,data].sort((a,b)=>a.part_number.localeCompare(b.part_number)))
        setShowForm(null)
      }
    }
    setSaving(false)
  }

  const filtered = records.filter(r=>{
    const q=search.toLowerCase()
    const matchTab = tab==='all'||r.record_type===tab
    const matchSearch = !q||[r.part_number,r.description,r.material,r.eng_job_number,r.eng_job_name,r.manufacturer,r.catalog_number,...(r.parent_assemblies||[])].some(v=>v?.toLowerCase?.().includes(q))
    return matchTab && matchSearch
  })

  const personRole = name => PERSONNEL.find(p=>p.name===name)?.role||''

  // ── FORM FIELDS rendered inline (not as inner components) ──
  const rFormFields = (
    <>
      <div className="fg">
        <label>Category <span className="req">*</span></label>
        <div className="rclass-row">
          {R_CLASSES.map(c=>(
            <button key={c} type="button"
              className={`rclass-btn ${form.r_class===c?'rclass-active':''}`}
              onClick={()=>{
                setF('r_class',c)
                if (c!=='Part') setF('parent_assemblies',[])
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {isPart && (
        <div className="fg">
          <label>Parent Assembly / Assemblies <span className="req">*</span></label>
          <AssemblyMultiSelect
            assemblies={topLevelAssemblies}
            selected={form.parent_assemblies||[]}
            onChange={v=>setF('parent_assemblies',v)}
          />
          {errs.parent_assemblies && <span className="em">{errs.parent_assemblies}</span>}
          {primaryParent && !editTarget && (
            <div className="parent-note">
              Primary parent: <strong>{primaryParent}</strong> → next suffix: <strong>{suggestNext(primaryParent)}</strong> → number: <strong>{previewNum}</strong>
            </div>
          )}
        </div>
      )}

      <div className="fg">
        <label>Description <span className="req">*</span></label>
        <input className={`fi ${errs.description?'fi-err':''}`} type="text"
          placeholder="e.g. Skid Assembly — Alpine Energy"
          value={form.description||''} onChange={e=>setF('description',e.target.value)} />
        {errs.description&&<span className="em">{errs.description}</span>}
      </div>

      <div className="fg">
        <label>Type</label>
        <select className="fi" value={form.part_type||''} onChange={e=>setF('part_type',e.target.value)}>
          <option value="">Select type…</option>
          {PART_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="fg">
        <label>Material</label>
        {editTarget ? (
          <input className="fi" type="text" value={form.material||''} onChange={e=>setF('material',e.target.value)} placeholder="e.g. W10x39, PL1/2&quot; A36" />
        ) : (
          <MaterialPicker matCat={form.matCat||''} matSize={form.matSize||''} matSub1={form.matSub1||''} matSub2={form.matSub2||''} onChange={setMat} />
        )}
      </div>

      <div className="fg">
        <label>Eng Job # <span className="req">*</span></label>
        <input className={`fi ${errs.eng_job_number?'fi-err':''}`} type="text" placeholder="E26-001"
          value={form.eng_job_number||''}
          onChange={e=>setF('eng_job_number', e.target.value.toUpperCase())} />
        {errs.eng_job_number&&<span className="em">{errs.eng_job_number}</span>}
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
        {errs.fab_job_number&&<span className="em">{errs.fab_job_number}</span>}
      </div>

      <div className="fg">
        <label>Engineer / Drafter <span className="req">*</span></label>
        <select className={`fi ${errs.engineer_drafter?'fi-err':''}`} value={form.engineer_drafter||''} onChange={e=>setF('engineer_drafter',e.target.value)}>
          <option value="">Select…</option>
          {PERSONNEL.map(p=>(
            <option key={p.name} value={p.name}>{p.name} — {p.role}</option>
          ))}
        </select>
        {errs.engineer_drafter&&<span className="em">{errs.engineer_drafter}</span>}
        {form.engineer_drafter && (
          <div className={`role-badge ${personRole(form.engineer_drafter)==='Drafter'?'role-drafter':'role-engineer'}`}>
            {personRole(form.engineer_drafter)}
          </div>
        )}
      </div>

      <div className="fg">
        <label>Notes</label>
        <textarea className="fi ftxt" placeholder="Additional notes…"
          value={form.notes||''} onChange={e=>setF('notes',e.target.value)} />
      </div>
    </>
  )

  const vFormFields = (
    <>
      <div className="fg">
        <label>Description <span className="req">*</span></label>
        <input className={`fi ${errs.description?'fi-err':''}`} type="text" placeholder='e.g. 3/4-10 Hex Bolt x 2"'
          value={form.description||''} onChange={e=>setF('description',e.target.value)} />
        {errs.description&&<span className="em">{errs.description}</span>}
      </div>
      <div className="fg">
        <label>Manufacturer <span className="req">*</span></label>
        <input className={`fi ${errs.manufacturer?'fi-err':''}`} type="text" placeholder="e.g. Parker, Fastenal"
          value={form.manufacturer||''} onChange={e=>setF('manufacturer',e.target.value)} />
        {errs.manufacturer&&<span className="em">{errs.manufacturer}</span>}
      </div>
      <div className="fg">
        <label>Vendor Name <span className="req">*</span></label>
        <input className={`fi ${errs.vendor_name?'fi-err':''}`} type="text" placeholder="e.g. MSC, McMaster"
          value={form.vendor_name||''} onChange={e=>setF('vendor_name',e.target.value)} />
        {errs.vendor_name&&<span className="em">{errs.vendor_name}</span>}
      </div>
      <div className="fg">
        <label>Catalog / Model # <span className="req">*</span></label>
        <input className={`fi ${errs.catalog_number?'fi-err':''}`} type="text" placeholder="e.g. 11008"
          value={form.catalog_number||''} onChange={e=>setF('catalog_number',e.target.value)} />
        {errs.catalog_number&&<span className="em">{errs.catalog_number}</span>}
      </div>
      <div className="fg">
        <label>Material / Spec</label>
        <input className="fi" type="text" placeholder="e.g. Grade 5 Zinc, 304 SS"
          value={form.material||''} onChange={e=>setF('material',e.target.value)} />
      </div>
      <div className="fg">
        <label>Engineer / Drafter <span className="req">*</span></label>
        <select className={`fi ${errs.engineer_drafter?'fi-err':''}`} value={form.engineer_drafter||''} onChange={e=>setF('engineer_drafter',e.target.value)}>
          <option value="">Select…</option>
          {PERSONNEL.map(p=><option key={p.name} value={p.name}>{p.name} — {p.role}</option>)}
        </select>
        {errs.engineer_drafter&&<span className="em">{errs.engineer_drafter}</span>}
        {form.engineer_drafter && (
          <div className={`role-badge ${personRole(form.engineer_drafter)==='Drafter'?'role-drafter':'role-engineer'}`}>
            {personRole(form.engineer_drafter)}
          </div>
        )}
      </div>
      <div className="fg">
        <label>Notes</label>
        <textarea className="fi ftxt" value={form.notes||''} onChange={e=>setF('notes',e.target.value)} />
      </div>
    </>
  )

  return (
    <div className="app">
      <header className="hdr">
        <div className="logo-wrap"><span className="logo-r">RIGID</span><span className="logo-sub">INDUSTRIAL GROUP</span></div>
        <nav className="nav">
          <span className="nl active">PARTS</span>
          <span className="nl">JOBS</span>
          <span className="nl">SCHEDULE</span>
          <span className="nl">REPORTS</span>
          <span className="nl">WORKFORCE</span>
        </nav>
        <div className="usr"><div className="usr-name">Caleb Centracco</div><div className="usr-role">Project Manager</div></div>
      </header>

      <div className="bc">
        <span className="bc-a">Parts</span><span className="bc-sep"> / </span><span className="bc-b">Registry</span>
        {isDemo && <span className="demo-pill">DEMO MODE</span>}
      </div>

      <div className="pg-hdr">
        <div>
          <div className="pg-title-row"><span className="pg-num">PARTS</span><span className="pill-open">OPEN</span><span className="pill-norm">NORMAL</span></div>
          <div className="pg-client">Part &amp; Assembly Number Registry</div>
          <div className="pg-type">Misc. Fabricated Steel</div>
        </div>
        <div className="btn-group">
          <button className="btn-new" onClick={()=>openNew('r_number')}>+ New R Number</button>
          <button className="btn-new btn-vendor" onClick={()=>openNew('vendor')}>+ Vendor Part</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat"><div className="stat-k">Next R Number</div><div className="stat-v orange">{nextRTop()}</div></div>
        <div className="stat"><div className="stat-k">R Numbers</div><div className="stat-v">{rRecords.length}</div></div>
        <div className="stat"><div className="stat-k">Top-Level</div><div className="stat-v">{topLevelAssemblies.length}</div></div>
        <div className="stat"><div className="stat-k">Vendor Parts</div><div className="stat-v">{vendors.length}</div></div>
      </div>

      <div className="main-cols">
        <div className="parts-panel">
          <div className="panel-hdr">
            <div className="tab-row">
              {[['all','All'],['r_number','R Numbers'],['vendor','Vendor']].map(([k,l])=>(
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
                  <th>Cat</th>
                  <th>Description</th>
                  <th>Material</th>
                  <th>Type</th>
                  <th>Eng Job #</th>
                  <th>Eng Job Name</th>
                  <th>Parent(s) / Mfr</th>
                  <th>Eng / Drafter</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} className={`trow trow-${r.record_type}`} onClick={()=>setSelected(r)}>
                    <td><span className={`pnum pnum-${r.record_type}`}>{r.part_number}</span></td>
                    <td><span className={`rtag rtag-${r.r_class||r.record_type}`}>{r.r_class||(r.record_type==='vendor'?'VND':'R')}</span></td>
                    <td className="desc">{r.description}</td>
                    <td className="dim">{r.material||<span className="na">—</span>}</td>
                    <td><span className="tpill">{r.part_type||'—'}</span></td>
                    <td className="job">{r.eng_job_number||<span className="na">—</span>}</td>
                    <td className="dim">{r.eng_job_name||<span className="na">—</span>}</td>
                    <td className="job">{(r.parent_assemblies||[]).join(', ')||r.manufacturer||<span className="na">—</span>}</td>
                    <td className="dim">{r.engineer_drafter||<span className="na">—</span>}</td>
                    <td className="dim">{fmt(r.created_at)}</td>
                    <td onClick={e=>e.stopPropagation()}>
                      <button className="edit-btn" onClick={()=>openEdit(r)}>Edit</button>
                    </td>
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
            {records.length===0&&<div className="dim" style={{padding:'12px'}}>No activity yet</div>}
          </div>
        </div>
      </div>

      {/* R NUMBER FORM */}
      {showForm==='r_number' && (
        <Modal
          title={editTarget ? `Edit ${editTarget.part_number}` : 'New R Number'}
          subtitle={editTarget ? editTarget.description : `Will be assigned: ${previewNum}`}
          onClose={()=>{setShowForm(null);setEditTarget(null)}}
        >
          <div className="form-bod">
            {!editTarget && <div className="preview-num">{previewNum}</div>}
            {rFormFields}
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>{setShowForm(null);setEditTarget(null)}}>Cancel</button>
            <button className="btn-new" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create R Number'}
            </button>
          </div>
        </Modal>
      )}

      {/* VENDOR FORM */}
      {showForm==='vendor' && (
        <Modal
          title={editTarget ? `Edit ${editTarget.part_number}` : 'New Vendor Part'}
          subtitle={editTarget ? editTarget.description : `Will be assigned: ${previewNum}`}
          onClose={()=>{setShowForm(null);setEditTarget(null)}}
        >
          <div className="form-bod">
            {!editTarget && <div className="preview-num vnum">{previewNum}</div>}
            {vFormFields}
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>{setShowForm(null);setEditTarget(null)}}>Cancel</button>
            <button className="btn-new btn-vendor" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Vendor Part'}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW DETAIL */}
      {selected && (
        <Modal title={selected.part_number} subtitle={selected.description} onClose={()=>setSelected(null)}>
          <div className="form-bod">
            <div className="view-top">
              <span className={`pnum-lg pnum-${selected.record_type}`}>{selected.part_number}</span>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}}>
                <span className={`rtag rtag-${selected.r_class||selected.record_type}`}>{selected.r_class||(selected.record_type==='vendor'?'VENDOR':'R NUMBER')}</span>
                <span className="pill-open">OPEN</span>
              </div>
            </div>
            <div className="vp-desc">{selected.description}</div>
            <div className="view-grid">
              {selected.record_type==='r_number' ? <>
                <div className="vf"><div className="vk">Material</div><div className="vv">{selected.material||'—'}</div></div>
                <div className="vf"><div className="vk">Type</div><div className="vv">{selected.part_type||'—'}</div></div>
                <div className="vf"><div className="vk">Eng Job #</div><div className="vv orange">{selected.eng_job_number||'—'}</div></div>
                <div className="vf"><div className="vk">Eng Job Name</div><div className="vv">{selected.eng_job_name||'—'}</div></div>
                <div className="vf"><div className="vk">Fab Job #</div><div className="vv">{selected.fab_job_number||'—'}</div></div>
                <div className="vf"><div className="vk">Parent(s)</div><div className="vv orange">{(selected.parent_assemblies||[]).join(', ')||'Top-level'}</div></div>
                <div className="vf"><div className="vk">{personRole(selected.engineer_drafter)||'Eng / Drafter'}</div><div className="vv">{selected.engineer_drafter||'—'}</div></div>
                <div className="vf"><div className="vk">Created</div><div className="vv">{fmt(selected.created_at)}</div></div>
              </> : <>
                <div className="vf"><div className="vk">Manufacturer</div><div className="vv">{selected.manufacturer||'—'}</div></div>
                <div className="vf"><div className="vk">Vendor</div><div className="vv">{selected.vendor_name||'—'}</div></div>
                <div className="vf"><div className="vk">Catalog #</div><div className="vv orange">{selected.catalog_number||'—'}</div></div>
                <div className="vf"><div className="vk">Material / Spec</div><div className="vv">{selected.material||'—'}</div></div>
                <div className="vf"><div className="vk">{personRole(selected.engineer_drafter)||'Eng / Drafter'}</div><div className="vv">{selected.engineer_drafter||'—'}</div></div>
                <div className="vf"><div className="vk">Created</div><div className="vv">{fmt(selected.created_at)}</div></div>
              </>}
            </div>
            {selected.record_type==='r_number' && rRecords.filter(r=>(r.parent_assemblies||[]).includes(selected.part_number)).length>0 && (
              <div style={{marginTop:'16px'}}>
                <div className="sec-label">Child parts / sub-assemblies</div>
                {rRecords.filter(r=>(r.parent_assemblies||[]).includes(selected.part_number)).map(c=>(
                  <div key={c.id} className="child-row" onClick={()=>setSelected(c)}>
                    <span className="pnum-sm pnum-r_number">{c.part_number}</span>
                    <span className="dim">{c.description}</span>
                    <span className="dim" style={{marginLeft:'auto'}}>{c.material}</span>
                  </div>
                ))}
              </div>
            )}
            {selected.notes&&<div style={{marginTop:'16px'}}><div className="vk">Notes</div><div className="vnotes">{selected.notes}</div></div>}
          </div>
          <div className="modal-ftr">
            <button className="btn-ghost" onClick={()=>setSelected(null)}>Close</button>
            <button className="btn-new" onClick={()=>openEdit(selected)}>Edit</button>
          </div>
        </Modal>
      )}

      {toast&&<div className={`toast ${toast.type==='err'?'toast-err':'toast-ok'}`}>{toast.msg}</div>}
    </div>
  )
}
