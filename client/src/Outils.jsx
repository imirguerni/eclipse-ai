import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * ============================================================
 * OUTILS
 * ============================================================
 *
 * - Importer une image ou une vidéo
 * - Recevoir un média modifié depuis Filtre
 * - Envoyer le média vers /api/upload
 * - Enregistrer le média dans Firestore
 * - Télécharger un média
 *
 * ============================================================
 */

const Outils = forwardRef(({
  user = null,
  db = null,
  activeItem = null,
  onMediaImported = null,
  onMediaApplied = null,
  onHistoryUpdate = null,
}, ref) => {

  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ==========================================================
  // RÉFÉRENCE INPUT
  // ==========================================================

  const fileInputRef = useRef(null);

  // ==========================================================
  // FONCTION POUR OUVRIR L'IMPORT
  // ==========================================================

  const openImport = () => {
    setError('');
    setMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ==========================================================
  // DÉTERMINER LE TYPE DU FICHIER
  // ==========================================================

  const getMediaType = (file) => {

    if (!file) {
      return null;
    }

    if (file.type.startsWith('video/')) {
      return 'VIDEO';
    }

    if (file.type.startsWith('image/')) {
      return 'IMAGE';
    }

    return null;
  };

  // ==========================================================
  // IMPORTER IMAGE / VIDÉO
  // ==========================================================

  const handleImport = async (event) => {

    const file = event.target.files?.[0];

    // Permet de sélectionner à nouveau le même fichier
    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setMessage('');
    setIsImporting(true);

    try {

      const mediaType = getMediaType(file);

      if (!mediaType) {
        throw new Error(
          'Format non supporté. Sélectionne une image ou une vidéo.'
        );
      }

      // ------------------------------------------------------
      // APERÇU LOCAL IMMÉDIAT
      // ------------------------------------------------------

      const localUrl = URL.createObjectURL(file);

      const importedMedia = {
        id: Date.now(),
        url: localUrl,
        file,
        name: file.name,
        type: mediaType,
        mimeType: file.type,
        size: file.size,
        prompt: 'Fichier importé',
        isLocal: true,
      };

      console.log(
        '📥 Média importé :',
        importedMedia
      );

      // ------------------------------------------------------
      // ENVOI AU PARENT
      // ------------------------------------------------------

      if (typeof onMediaImported === 'function') {
        onMediaImported(importedMedia);
      }

      setMessage(
        `${mediaType === 'VIDEO' ? 'Vidéo' : 'Image'} importée.`
      );

    } catch (err) {

      console.error(
        '❌ Erreur import :',
        err
      );

      setError(
        err?.message ||
        'Impossible d’importer le fichier.'
      );

    } finally {

      setIsImporting(false);
    }
  };

  // ==========================================================
  // UPLOAD VERS LE SERVEUR
  // ==========================================================

  const uploadMedia = async (
    blobOrFile,
    fileName = 'media'
  ) => {

    if (!blobOrFile) {
      throw new Error(
        'Aucun fichier à envoyer.'
      );
    }

    setIsUploading(true);
    setError('');

    try {

      const formData = new FormData();

      const file =
        blobOrFile instanceof File
          ? blobOrFile
          : new File(
              [blobOrFile],
              fileName,
              {
                type:
                  blobOrFile.type ||
                  'application/octet-stream',
              }
            );

      formData.append(
        'file',
        file
      );

      // ------------------------------------------------------
      // TOKEN FIREBASE
      // ------------------------------------------------------

      let token = null;

      try {

        if (
          user &&
          typeof user.getIdToken === 'function'
        ) {
          token =
            await user.getIdToken();
        }

      } catch (tokenError) {

        console.warn(
          '⚠️ Impossible de récupérer le token Firebase :',
          tokenError
        );
      }

      // ------------------------------------------------------
      // HEADERS
      // ------------------------------------------------------

      const headers = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      // ------------------------------------------------------
      // UPLOAD
      // ------------------------------------------------------

      const response =
        await fetch(
       `${import.meta.env.VITE_API_URL}/api/upload`,
          {
            method: 'POST',
            headers,
            body: formData,
          }
        );

      if (!response.ok) {

        const text =
          await response.text();

        throw new Error(
          text ||
          `Erreur upload (${response.status})`
        );
      }

      const data =
        await response.json();

      console.log(
        '☁️ Upload terminé :',
        data
      );

      if (!data?.url) {
        throw new Error(
          'Le serveur n’a pas retourné d’URL.'
        );
      }

      return data;

    } finally {

      setIsUploading(false);
    }
  };

  // ==========================================================
// CONVERTIR UNE VIDÉO WEBM EN MP4
// ==========================================================

const convertVideoToMp4 = async (uploadedUrl) => {

  if (!uploadedUrl) {
    throw new Error(
      'Aucune vidéo à convertir.'
    );
  }

  console.log(
    '🎬 Demande conversion WebM → MP4 :',
    uploadedUrl
  );

  // --------------------------------------------------------
  // TOKEN FIREBASE
  // --------------------------------------------------------

  let token = null;

  try {

    if (
      user &&
      typeof user.getIdToken === 'function'
    ) {
      token = await user.getIdToken();
    }

  } catch (tokenError) {

    console.warn(
      '⚠️ Impossible de récupérer le token Firebase :',
      tokenError
    );
  }

  // --------------------------------------------------------
  // HEADERS
  // --------------------------------------------------------

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  // --------------------------------------------------------
  // APPEL SERVEUR
  // --------------------------------------------------------

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/convert-video`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: uploadedUrl,
      }),
    }
  );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      text ||
      `Erreur conversion vidéo (${response.status})`
    );
  }

  const data =
    await response.json();

  console.log(
    '✅ Réponse conversion MP4 :',
    data
  );

  if (!data?.url) {
    throw new Error(
      'Le serveur n’a pas retourné l’URL du MP4.'
    );
  }

  return data;
};
  // ==========================================================
  // ENREGISTRER DANS FIRESTORE
  // ==========================================================

  const saveToHistory = async (historyItem) => {
    console.log('🚨 SAVE FIRESTORE APPELÉ');
console.log('👤 USER :', user);
console.log('🆔 UID :', user?.uid);
console.log('🔥 DB :', db);
console.log('🎬 HISTORY ITEM :', historyItem);

    if (!db) {
      throw new Error(
        'Firebase Firestore (db) n’est pas disponible.'
      );
    }

    if (!user?.uid) {
      throw new Error(
        'Utilisateur non connecté. Impossible d’enregistrer le média.'
      );
    }

    // --------------------------------------------------------
    // IMPORTANT :
    // On reprend exactement les champs utilisés par le
    // listener Firestore de App.jsx :
    //
    // userId
    // status
    // createdAt
    // url
    // type
    // --------------------------------------------------------

    const firestoreData = {

      userId:
        user.uid,

      status:
        'completed',

      url:
        historyItem.url,

      type:
        historyItem.type,

      prompt:
        historyItem.prompt ||
        'Média modifié',

      originalUrl:
        historyItem.originalUrl ||
        null,

      filterName:
        historyItem.filterName ||
        null,

      intensity:
        historyItem.intensity ??
        null,

      settings:
        historyItem.settings ||
        null,

      createdAt:
        serverTimestamp(),
    };

    console.log(
      '🔥 Enregistrement Firestore :',
      firestoreData
    );

    const docRef =
      await addDoc(
        collection(db, 'imageLocks'),
        firestoreData
      );

    console.log(
      '✅ Média enregistré dans Firestore :',
      docRef.id
    );

    return {
      ...historyItem,
      id: docRef.id,
    };
  };

  // ==========================================================
  // APPLIQUER UN MÉDIA MODIFIÉ
  // ==========================================================

  const applyMedia = async (result) => {

    if (!result) {

      setError(
        'Aucun résultat à appliquer.'
      );

      return null;
    }

    setError('');
    setMessage('');

    try {

      console.log(
        '🎨 Média à appliquer :',
        result
      );

      // ------------------------------------------------------
      // 1. UPLOAD
      // ------------------------------------------------------

      let uploadedData = null;

      if (result.blob) {

  uploadedData =
    await uploadMedia(
      result.blob,
      result.fileName ||
        `media-${Date.now()}`
    );

} 

else if (result.file) {

        uploadedData =
          await uploadMedia(
            result.file,
            result.file.name
          );

      } else if (result.url) {

        uploadedData = {
          url: result.url,
        };

      } else {

        throw new Error(
          'Le résultat ne contient aucun média.'
        );
      }

      // ------------------------------------------------------
      // 2. TYPE DU MÉDIA
      // ------------------------------------------------------

      const mediaType =
        result.type ||
        (
          result.mimeType?.startsWith('video/')
            ? 'VIDEO'
            : 'IMAGE'
        );

      // ------------------------------------------------------
      // 3. CONSTRUIRE L'ÉLÉMENT HISTORIQUE
      // ------------------------------------------------------

      const historyItem = {

        id: null,

        url:
          uploadedData.url,

        type:
          mediaType,

        prompt:
          result.prompt ||
          result.filterName ||
          'Média modifié',

        originalUrl:
          result.originalUrl ||
          activeItem?.url ||
          null,

        filterName:
          result.filterName ||
          null,

        intensity:
          result.intensity ??
          null,

        settings:
          result.settings ||
          null,

        createdAt:
          new Date().toISOString(),
      };

      console.log(
        '🗂️ Élément historique avant Firestore :',
        historyItem
      );

      // ------------------------------------------------------
      // 4. SAUVEGARDE FIRESTORE
      // ------------------------------------------------------

      const savedHistoryItem =
        await saveToHistory(
          historyItem
        );

      console.log(
        '✅ Historique Firestore terminé :',
        savedHistoryItem
      );

      // ------------------------------------------------------
      // 5. RETOUR VERS APP.JSX
      // ------------------------------------------------------

      if (
        typeof onMediaApplied ===
        'function'
      ) {

        await onMediaApplied(
          savedHistoryItem
        );
      }

      /*
       * IMPORTANT :
       *
       * On ne fait PAS :
       *
       * onHistoryUpdate(historyItem)
       *
       * ici pour éviter un doublon.
       *
       * App.jsx possède déjà un onSnapshot()
       * sur imageLocks.
       *
       * Dès que Firestore reçoit le document,
       * le listener de App.jsx va automatiquement
       * ajouter le média à history.
       */

      setMessage(
        '✓ Modifications appliquées et enregistrées dans l’historique.'
      );

      return savedHistoryItem;

    } catch (err) {

      console.error(
        '❌ Erreur application média :',
        err
      );

      setError(
        err?.message ||
        'Impossible d’appliquer les modifications.'
      );

      return null;
    }
  };

  // ==========================================================
  // TÉLÉCHARGER UN MÉDIA
  // ==========================================================

  const downloadMedia = (
    url,
    fileName = 'media'
  ) => {

    if (!url) {

      setError(
        'Aucun média à télécharger.'
      );

      return;
    }

    const link =
      document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ==========================================================
  // MÉTHODES ACCESSIBLES DEPUIS APP.JSX
  // ==========================================================

  useImperativeHandle(
    ref,
    () => ({
      openImport,
      applyMedia,
      downloadMedia,
    }),
    [user, db, activeItem]
  );

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div
      style={{
        display: 'none',
      }}
    >

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={handleImport}
      />

      {isImporting && (
        <span>
          Importation...
        </span>
      )}

      {isUploading && (
        <span>
          Envoi...
        </span>
      )}

      {error && (
        <span>
          {error}
        </span>
      )}

      {message && (
        <span>
          {message}
        </span>
      )}

    </div>
  );
});

export default Outils;