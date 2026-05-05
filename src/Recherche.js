import './Recherche.css';

function Recherche({ valeur, onChange }) {
  return (
    <div className="recherche">
      <input
        type="text"
        className="recherche-input"
        placeholder="Rechercher une ligne (départ, arrivée)..."
        value={valeur}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export default Recherche;