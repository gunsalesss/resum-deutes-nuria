import { PlusIcon } from './icons'

export default function AddButton({ label, onClick }) {
  return (
    <button className="add-big-button" onClick={onClick}>
      <PlusIcon />
      {label}
    </button>
  )
}
