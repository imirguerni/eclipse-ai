import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Ajuste selon le nom de ton fichier d'init Firebase (firebaseConfig ou firebase)

const Success = ({ onBack }) => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('loading');
    
    const [loadingMessage, setLoadingMessage] = useState("Validation de votre paiement...");
    const [successMessage, setSuccessMessage] = useState("Paiement validé. Vos ressources ont été ajoutées.");

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        // 🔒 On écoute l'état de l'authentification pour être sûr que Firebase est prêt
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                console.error("Aucun utilisateur connecté pour valider le paiement.");
                setStatus('error');
                return;
            }

            try {
                const token = await currentUser.getIdToken();

                const timer = setTimeout(() => {
                    setLoadingMessage("Sécurisation de vos crédits...");
                }, 2500);

                console.log("Validation en cours pour la session:", sessionId);
                
                const response = await fetch(`http://localhost:5000/verify-payment?session_id=${sessionId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                clearTimeout(timer);

                if (response.ok && data.success) {
                    setStatus('success');
                    
                    if (data.type === 'subscription' || data.mode === 'subscription') {
                        setSuccessMessage("Félicitations ! Votre abonnement est actif et vos Éclairs sont prêts.");
                    } else {
                        setSuccessMessage("Paiement validé. Vos Diamants ont été ajoutés à votre compte.");
                    }
                } else {
                    console.error("Erreur de validation serveur :", data.error);
                    setStatus('error');
                }
            } catch (err) {
                console.error("Erreur de communication lors de la vérification:", err);
                setStatus('error');
            }
        });

        return () => unsubscribe(); // Nettoyage de l'écouteur
    }, [sessionId]);

    const fullScreenStyle = {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10000,
        fontFamily: 'sans-serif'
    };

    return (
        <div style={fullScreenStyle}>
            {status === 'loading' && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem' }}>🔄 {loadingMessage}</h2>
                    <p style={{ color: '#888' }}>Veuillez patienter quelques instants.</p>
                </div>
            )}

            {status === 'success' && (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{ color: '#4CAF50', fontSize: '3rem', marginBottom: '10px' }}>MERCI !</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>{successMessage}</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        style={{ 
                            padding: '15px 40px', 
                            fontSize: '18px', 
                            cursor: 'pointer', 
                            backgroundColor: '#6200ee', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(98, 0, 238, 0.4)'
                        }}
                    >
                        RETOUR AU STUDIO
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#f44336', fontSize: '2.5rem' }}>❌ Oups...</h1>
                    <p style={{ marginBottom: '20px' }}>Nous n'avons pas pu valider le paiement automatiquement.</p>
                    <button 
                        onClick={onBack}
                        style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
                    >
                        Retourner au site
                    </button>
                </div>
            )}
        </div>
    );
};

export default Success;