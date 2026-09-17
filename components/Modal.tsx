'use client'
import { X } from 'lucide-react'
export default function Modal({title,onClose,children}:{title:string,onClose:()=>void,children:React.ReactNode}){return <div className="modalback" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modalhead"><h2>{title}</h2><button onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
