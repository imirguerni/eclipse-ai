// Envoi des médias modifiés vers Firebase Storage (et, en option, enregistrement dans Firestore).
//
// Pourquoi : l'adresse « blob: » créée par le navigateur disparaît à l'actualisation de la page.
// Il faut envoyer le fichier sur Firebase Storage et garder l'adresse permanente (downloadURL).
//
// Utilisation (dans le composant parent) :
//
//   import { getStorage } from 'firebase/storage';
//   import { getFirestore } from 'firebase/firestore';
//   import { createFirebaseUploader } from './firebaseUpload.js';
//
//   const uploadResult = useMemo(
//     () => createFirebaseUploader({
//       storage: getStorage(),
//       uid: user.uid,
//       // Optionnel : écrit aussi une entrée dans Firestore (users/<uid>/history)
//       // db: getFirestore(),
//       // historyPath: ['users', user.uid, 'history']
//     }),
//     [user.uid]
//   );
//
//   <Filtre ... uploadResult={uploadResult} onApply={(media) => ajouterALHistorique(media)} />
//
// `media.url` est alors l'adresse permanente Firebase (et plus une adresse « blob: »).

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const safeFileName = (name) => String(name || `media-${Date.now()}`).replace(/[^\w.\-]+/g, '_');

export function createFirebaseUploader({
  storage,
  uid,
  db = null,
  historyPath = null, // ex. ['users', uid, 'history']
  basePath = null // ex. `users/${uid}/filtres` (par défaut : users/<uid>/filtres)
}) {
  if (!storage) throw new Error('createFirebaseUploader : « storage » est obligatoire (getStorage()).');

  return async function uploadResult(result, { onProgress, settings, meta } = {}) {
    if (!result || !result.blob) throw new Error('Aucun fichier à envoyer.');
    const folder = basePath || `users/${uid || 'anonyme'}/filtres`;
    const storagePath = `${folder}/${Date.now()}-${safeFileName(result.fileName)}`;
    const fileRef = ref(storage, storagePath);

    const task = uploadBytesResumable(fileRef, result.blob, {
      contentType: result.mimeType || result.blob.type || 'application/octet-stream',
      cacheControl: 'public,max-age=31536000'
    });
    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => { if (onProgress && snap.totalBytes) onProgress(snap.bytesTransferred / snap.totalBytes); },
        reject,
        resolve
      );
    });
    const url = await getDownloadURL(fileRef);

    let docId = null;
    if (db && Array.isArray(historyPath) && historyPath.length) {
      const docRef = await addDoc(collection(db, ...historyPath), {
        type: result.type || null,
        url,
        storagePath,
        fileName: result.fileName || null,
        mimeType: result.mimeType || null,
        size: result.blob.size,
        createdAt: serverTimestamp(),
        filterName: (meta && meta.filterName) || null,
        originalUrl: meta && typeof meta.originalUrl === 'string' && !meta.originalUrl.startsWith('blob:') ? meta.originalUrl : null,
        // Réglages stockés en texte : évite les limites de Firestore (tableaux imbriqués, valeurs undefined).
        settingsJson: JSON.stringify(settings || null)
      });
      docId = docRef.id;
    }
    return { url, storagePath, docId };
  };
}
