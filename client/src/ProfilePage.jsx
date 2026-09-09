import React from 'react';
import { auth, db } from './firebase'; // Vérifie que le chemin est correct
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, addDoc, collection } from 'firebase/firestore'; // ✅ Ajout addDoc et collection
import emailjs from '@emailjs/browser'; // ✅ Ajout de la bibliothèque d'envoi
import profileBg from './assets/profile-bg.png';
const img = new Image();
img.src = profileBg;
const ProfilePage = ({ user, userPlan, tokens, packTokens, resetDate, expiryDate, onBack, onShowPricing }) => {
  const planColor = userPlan?.toLowerCase() === 'elite' ? '#a855f7' : '#3b82f6';
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  // ✅ ÉTATS POUR LE FORMULAIRE DE CONTACT
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [contactData, setContactData] = React.useState({ subject: 'renseignement', message: '' });
  const [isSending, setIsSending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [cancelError, setCancelError] = React.useState(null);

  const [isCancelling, setIsCancelling] = React.useState(false);
  const [cancelSuccess, setCancelSuccess] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactData.message.trim()) return;

    setIsSending(true);
    try {
      // 1️⃣ Enregistrement dans Firebase
      await addDoc(collection(db, "contact_messages"), {
        uid: user?.uid || "anonyme",
        email: user?.email || "non-connecté",
        nom: user?.displayName || "Inconnu",
        objet: contactData.subject,
        message: contactData.message,
        createdAt: new Date().toISOString(),
      });

      // 2️⃣ Envoi réel de l'e-mail avec tes clés
      await emailjs.send(
        'service_qh3e56a', // Ton Service ID Gmail
        'template_nil0lc5', // Ton Template ID
        {
          title: contactData.subject,
          name: user?.displayName || "Utilisateur",
          email: user?.email || "Non fourni",
          message: contactData.message,
          time: new Date().toLocaleString()
        },
        'HLKSnEAZsjY0shKFy' // Ta Public Key
      );

      // ✅ On remplace l'alert par un état de succès (interface stylisée)
      setIsSuccess(true);
      
      // On ferme la fenêtre proprement après 3 secondes
      setTimeout(() => {
        setIsSuccess(false);
        setShowContactModal(false);
        setContactData({ subject: 'renseignement', message: '' });
      }, 3000);

    } catch (error) {
      console.error("Erreur d'envoi:", error);
    }
    setIsSending(false);
  };

  // ✅ FONCTION DE SUPPRESSION (DÉJÀ PROPRE)
  const finalDelete = async () => {
    if (confirmText !== "SUPPRIMER") return;

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(currentUser);
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        // ✅ Ici, pas d'alert, le bouton devient simplement "Se reconnecter"
        setConfirmText("RECONNEXION_REQUISE"); 
      }
    }
 }; // Fin de finalDelete

// 🛑 FONCTIONS DE RÉSILIATION STRIPE
  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

const confirmCancelSubscription = async () => {
    setShowCancelModal(false);
    setIsCancelling(true);
    setCancelError(null);
    try {
        // 1. On récupère le user connecté depuis l'instance auth de Firebase
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Utilisateur non connecté.");

        // 2. On génère son token d'authentification sécurisé
        const token = await currentUser.getIdToken();

        // 3. On fait le fetch en envoyant le token dans les headers
        const response = await fetch('http://localhost:5000/cancel-subscription', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 🔑 C'est ça qui manquait !
            },
            body: JSON.stringify({ userId: currentUser.uid })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de la résiliation");

        setCancelSuccess(true);
    } catch (error) {
        console.error("Erreur résiliation:", error);
        setCancelError("Impossible de joindre le serveur de résiliation.");
    }
    setIsCancelling(false);
};

// On détecte si l'écran est un mobile (largeur inférieure à 768px)
  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 10000, color: 'white',
      fontFamily: "'Inter', sans-serif", overflowY: 'auto',
      backgroundColor: '#090d16', // Évite le flash blanc/transparent
      
      backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.5), rgba(10, 15, 30, 0.2)), url(${profileBg})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      
      // 📱 SI MOBILE : cadre à 65% pour centrer le visage. SI PC : reste parfaitement centré.
      backgroundPosition: isMobile ? '65% center' : 'center center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s'
        }}>
          ← Retour
        </button>
      </div>

      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
<img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'default'}`} 
              alt="Profil" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://via.placeholder.com/100";
              }}
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${planColor}`, boxShadow: `0 0 20px ${planColor}44`, objectFit: 'cover' }} 
            />
            <div style={{
              position: 'absolute', bottom: '5px', right: '5px',
              backgroundColor: planColor, width: '20px', height: '20px',
              borderRadius: '50%', border: '2px solid #0f172a'
            }}></div>
          </div>
          <h2 style={{ fontSize: '28px', margin: '15px 0 5px 0', letterSpacing: '-0.5px' }}>{user?.displayName}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>{user?.email}</p>
        </div>

      {/* Stats Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '30px', borderRadius: '24px', backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Statut du compte</span>
            <span style={{ 
              backgroundColor: `${planColor}22`, color: planColor, 
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', 
              fontWeight: 'bold', textTransform: 'uppercase', border: `1px solid ${planColor}44`
            }}>
              {userPlan}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px' }}>⚡ Éclairs</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{tokens}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>📅</span> Prochain reset : <strong style={{ color: '#94a3b8' }}>{resetDate}</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px' }}>💎 Diamants</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#00d2ff' }}>{packTokens}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>⏳</span> Expiration : <strong style={{ color: '#94a3b8' }}>{expiryDate || "Valable 1 an"}</strong>
              </div>
            </div>
          </div>
        </div>

      {/* Actions */}
<button 
  onClick={() => {
    // 1. On appelle d'abord la fonction pour afficher les prix
    onShowPricing();
    // 2. On ferme le profil
    onBack(); 
  }}
  style={{
    width: '100%', 
    marginTop: '30px', 
    padding: '16px', 
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white', 
    border: 'none', 
    fontWeight: 'bold', 
    fontSize: '16px',
    cursor: 'pointer', 
    boxShadow: '0 10px 20px -5px rgba(168, 85, 247, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  }}
>
  ✨ Modifier mon abonnement
</button>
{/* ✅ BOUTON DE RÉSILIATION */}
        {userPlan?.toLowerCase() !== 'discovery' && userPlan?.toLowerCase() !== 'gratuit' && (
          <button 
            onClick={handleCancelSubscription} 
            disabled={isCancelling || cancelSuccess} 
            style={{ 
              width: '100%', marginTop: '15px', padding: '16px', borderRadius: '16px', 
              background: cancelSuccess ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)', 
              color: cancelSuccess ? '#4ade80' : '#f87171', 
              border: `1px solid ${cancelSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
              fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: '0.3s' 
            }}
          >
            {cancelSuccess ? "✓ Abonnement résilié" : isCancelling ? "Résiliation en cours..." : "🛑 Résilier mon abonnement"}
          </button>
        )}
        {/* ✅ BOUTON CONTACTEZ-NOUS */}
        <button 
          onClick={() => setShowContactModal(true)}
          style={{
            width: '100%', 
            marginTop: '15px', 
            padding: '16px', 
            borderRadius: '16px',
            background: 'rgba(59, 130, 246, 0.5)',
            color: '#abd1ff', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            fontWeight: '600', 
            fontSize: '15px',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          📬 Contactez-nous
        </button>

        <button 
          onClick={() => setShowDeleteModal(true)}
          style={{
            width: '100%', 
            marginTop: '15px', 
            background: 'rgba(102, 0, 0, 0.48)',
            border: '1px solid rgba(136, 32, 0, 0.91)', 
            color: '#ff0000', 
            padding: '12px', 
            borderRadius: '16px', 
            cursor: 'pointer', 
            fontSize: '13px',
            transition: 'all 0.3s'
          }}
     
   
        >
          Supprimer mon compte
        </button>
      </div>

{/* ✅ FENÊTRE DE CONFIRMATION (MODAL SUPPRESSION SÉCURISÉE) */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '20px'
        }}>
          <div style={{
            background: '#1e293b', padding: '30px', borderRadius: '24px',
            maxWidth: '400px', width: '100%', border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '20px' }}>⚠️ Action irréversible</h3>

            {/* 🛑 VÉRIFICATION DE L'ABONNEMENT ACTIF */}
            {userPlan?.toLowerCase() !== 'discovery' && userPlan?.toLowerCase() !== 'gratuit' && !cancelSuccess ? (
              <>
                <p style={{ fontSize: '14px', color: '#f87171', lineHeight: '1.6', marginBottom: '20px' }}>
                  🛑 <strong>Abonnement actif détecté :</strong> Vous devez impérativement résilier votre abonnement avant de pouvoir supprimer votre compte.
                </p>
                <button 
                  onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  Compris
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                  La suppression de votre compte entraînera la perte définitive de vos 💎 <strong>{packTokens} diamants</strong> et ⚡ <strong>{tokens} éclairs</strong>.
                </p>
                
                <p style={{ marginTop: '20px', fontSize: '13px', color: 'white' }}>
                  Tapez <strong>SUPPRIMER</strong> pour confirmer :
                </p>
                
                <input 
                  type="text" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Écrivez ici..."
                  style={{
                    width: '100%', padding: '12px', marginTop: '10px', borderRadius: '12px',
                    border: '1px solid #334155', background: '#0f172a', color: 'white', textAlign: 'center', outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button 
                    onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Retour
                  </button>
                  <button 
                    onClick={confirmText === "RECONNEXION_REQUISE" 
                      ? async () => { await auth.signOut(); window.location.reload(); } 
                      : finalDelete
                    }
                    disabled={confirmText !== "SUPPRIMER" && confirmText !== "RECONNEXION_REQUISE"}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', 
                      background: (confirmText === "SUPPRIMER" || confirmText === "RECONNEXION_REQUISE") ? '#ef4444' : '#450a0a', 
                      color: 'white', border: 'none', 
                      cursor: (confirmText === "SUPPRIMER" || confirmText === "RECONNEXION_REQUISE") ? 'pointer' : 'not-allowed',
                      fontWeight: '600', transition: '0.3s'
                    }}
                  >
                    {confirmText === "RECONNEXION_REQUISE" ? "Se reconnecter" : "Supprimer"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ✅ FENÊTRE DE CONTACT MISE À JOUR (PLUS D'ALERT BRUTE) */}
      {showContactModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000, padding: '20px'
        }}>
          <div style={{
            background: '#1e293b', padding: '30px', borderRadius: '24px',
            maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: isSuccess ? 'center' : 'left'
          }}>
            
            {isSuccess ? (
              // ✅ INTERFACE DE SUCCÈS (Remplace la fenêtre blanche localhost)
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
                <h3 style={{ color: '#60a5fa', marginBottom: '10px' }}>Message envoyé !</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                  Merci {user?.displayName}, nous avons bien reçu votre demande. <br/>
                  Nous vous répondrons bientôt.
                </p>
              </div>
            ) : (
              // FORMULAIRE INITIAL
              <>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>📬 Nous contacter</h3>
                
                <form onSubmit={handleSendMessage}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Objet de votre demande</label>
                  <select 
                    value={contactData.subject}
                    onChange={(e) => setContactData({...contactData, subject: e.target.value})}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a',
                      color: 'white', border: '1px solid #334155', marginBottom: '20px', outline: 'none'
                    }}
                  >
                    <option value="renseignement">Renseignement</option>
                    <option value="probleme">Signaler un problème</option>
                    <option value="devis">Demande de devis</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Votre message</label>
                  <textarea 
                    required
                    value={contactData.message}
                    onChange={(e) => setContactData({...contactData, message: e.target.value})}
                    placeholder="Comment pouvons-nous vous aider ?"
                    style={{
                      width: '100%', height: '120px', padding: '12px', borderRadius: '12px',
                      background: '#0f172a', color: 'white', border: '1px solid #334155',
                      marginBottom: '25px', outline: 'none', resize: 'none', fontFamily: 'inherit'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      style={{ 
                        flex: 1, padding: '14px', borderRadius: '12px', 
                        background: '#334155', border: 'none', color: 'white', 
                        cursor: 'pointer', fontWeight: '600' 
                      }}
                    >
                      ← Retour
                    </button>
                    <button 
                      type="submit"
                      disabled={isSending}
                      style={{ 
                        flex: 1, padding: '14px', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                        color: 'white', border: 'none', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                      }}
                    >
                      {isSending ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {showCancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '20px'
        }}>
          <div style={{
            background: '#1e293b', padding: '30px', borderRadius: '24px',
            maxWidth: '400px', width: '100%', border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '20px' }}>⚠️ Résilier l'abonnement</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              Êtes-vous sûr de vouloir résilier votre abonnement ? Vous garderez vos avantages jusqu'à la fin de la période payée.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={() => setShowCancelModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Annuler
              </button>
              <button 
                onClick={confirmCancelSubscription}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', 
                  background: '#ef4444', color: 'white', border: 'none', 
                  cursor: 'pointer', fontWeight: '600', transition: '0.3s'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;