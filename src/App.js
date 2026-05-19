import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [nbRecherches, setNbRecherches] = useState(0);

  function handleRecherche(valeur) {
    setRecherche(valeur);
    setNbRecherches(n => n + 1);
  }

  // Fonction fetch séparée (réutilisable)
function chargerLignes() {
  setChargement(true);
  setErreur(null);
  fetch("http://localhost:5000/lignes")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur serveur : " + response.status);
      }
      return response.json();
    })
    .then(data => {
      setLignes(data);
      setChargement(false);
    })
    .catch(error => {
      setErreur(error.message);
      setChargement(false);
    });
}

// Appel au démarrage
useEffect(() => {
  chargerLignes();
}, []); 

  const lignesFiltrees = lignes.filter((l) =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  function handleClickLigne(ligne) {
  // Si on reclique sur la même ligne, on la ferme
  if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
    setLigneSelectionnee(null);
    return;
  }

  // Sinon on charge les détails depuis Flask
  fetch(`http://localhost:5000/lignes/${ligne.id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur serveur : " + response.status);
      }
      return response.json();
    })
    .then(data => {
      setLigneSelectionnee(data);
    })
    .catch(error => {
      console.error("Erreur chargement détails :", error.message);
    });
}

  // Écran de chargement
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
      </div>
    );
  }

  // Écran d'erreur
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé (python api/app.py).</p>
          </div>
        </main>
      </div>
    );
  }

  // Écran normal
  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <Recherche valeur={recherche} onChange={handleRecherche} />
        <button onClick={chargerLignes} style={{
            marginBottom: "12px",
            padding: "8px 16px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem"
        }}>
             Recharger
        </button>
        <p style={{color: "#7f8c8d", fontSize: "0.85rem", marginBottom: "8px"}}>
          Vous avez effectué {nbRecherches} recherche{nbRecherches > 1 ? 's' : ''}
        </p>
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvée{lignesFiltrees.length > 1 ? 's' : ''}
        </p>

        {lignesFiltrees.length === 0 && (
          <p style={{textAlign: 'center', color: '#e74c3c', marginTop: "20px"}}>
            Aucune ligne trouvée pour "{recherche}"
          </p>
        )}

        {lignesFiltrees.map((ligne) => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}

        {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;