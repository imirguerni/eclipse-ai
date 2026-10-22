
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const HISTORY_TRANSLATIONS = {
  fr: {
    back: '← Retour au studio',
    images: 'Images',
    videos: 'Vidéos',
    enlarge: 'Cliquer pour agrandir',
    generatedImage: 'Image générée',
    noDescription: 'Sans description',
    remix: '🪄 Remixer',
    edit: '✏️ Modifier',
    editTitle: 'Ouvrir cette vidéo dans l’éditeur',
    download: 'Télécharger',
    delete: 'Supprimer',
    localFile: 'Fichier local',
    empty: 'Historique vide',
    largePreview: 'Aperçu en grand format'
  },
  en: {
    back: '← Back to Studio',
    images: 'Images',
    videos: 'Videos',
    enlarge: 'Click to enlarge',
    generatedImage: 'Generated image',
    noDescription: 'No description',
    remix: '🪄 Remix',
    edit: '✏️ Edit',
    editTitle: 'Open this video in the editor',
    download: 'Download',
    delete: 'Delete',
    localFile: 'Local file',
    empty: 'Your history is empty',
    largePreview: 'Large preview'
  },
  ko: {
    back: '← 스튜디오로 돌아가기',
    images: '이미지',
    videos: '동영상',
    enlarge: '클릭하여 확대',
    generatedImage: '생성된 이미지',
    noDescription: '설명 없음',
    remix: '🪄 리믹스',
    edit: '✏️ 편집',
    editTitle: '편집기에서 이 동영상 열기',
    download: '다운로드',
    delete: '삭제',
    localFile: '로컬 파일',
    empty: '기록이 비어 있습니다',
    largePreview: '확대 미리보기'
  },
  ja: {
    back: '← スタジオに戻る',
    images: '画像',
    videos: '動画',
    enlarge: 'クリックして拡大',
    generatedImage: '生成された画像',
    noDescription: '説明なし',
    remix: '🪄 リミックス',
    edit: '✏️ 編集',
    editTitle: 'この動画をエディターで開く',
    download: 'ダウンロード',
    delete: '削除',
    localFile: 'ローカルファイル',
    empty: '履歴は空です',
    largePreview: '拡大プレビュー'
  },
  zh: {
    back: '← 返回工作室',
    images: '图片',
    videos: '视频',
    enlarge: '点击放大',
    generatedImage: '生成的图片',
    noDescription: '暂无描述',
    remix: '🪄 重新创作',
    edit: '✏️ 编辑',
    editTitle: '在编辑器中打开此视频',
    download: '下载',
    delete: '删除',
    localFile: '本地文件',
    empty: '历史记录为空',
    largePreview: '大图预览'
  }
};

const MyHistoryPage = ({
  history = [],
  onBack,
  onRemix,
  onEdit,
  onDownload,
  onDelete
}) => {
  const { i18n } = useTranslation();

  const language = String(
    i18n.resolvedLanguage || i18n.language || 'fr'
  ).toLowerCase().split('-')[0];

  const translations =
    HISTORY_TRANSLATIONS[language] || HISTORY_TRANSLATIONS.fr;

  const [filter, setFilter] = useState('IMAGE');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filteredData = (Array.isArray(history) ? history : []).filter(
    item => String(item.type || 'IMAGE').toUpperCase() === filter
  );

  const isVideo = item =>
    String(item?.type || '').toUpperCase() === 'VIDEO' ||
    Boolean(item?.videoUrl);

  const mediaUrl = item => item?.url || item?.videoUrl || '';

  return (
    <div
      className="history-page-container"
      style={{
        flex: 1,
        background: '#080808',
        padding: '30px',
        height: '100vh',
        color: 'white',
        width: '100%',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .history-header {
          flex-shrink: 0 !important;
          background: #080808 !important;
          padding-bottom: 20px !important;
          margin-bottom: 20px !important;
        }

        .history-scroll-area {
          flex: 1 !important;
          min-height: 0;
          overflow-y: auto !important;
          padding-right: 5px;
        }

        .history-media-action:hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
        }

        .history-media-preview:hover .history-preview-overlay {
          opacity: 1 !important;
        }

        @media (max-width: 768px) {
          .history-page-container {
            padding: 16px !important;
          }

          .history-header {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
            padding-bottom: 16px !important;
            margin-bottom: 16px !important;
          }

          .btn-back-studio {
            width: 100% !important;
            text-align: center !important;
            padding: 12px !important;
          }

          .filter-container {
            width: 100% !important;
            display: flex !important;
            box-sizing: border-box;
          }

          .filter-container button {
            flex: 1 !important;
            text-align: center !important;
            padding: 12px !important;
          }

          .history-grid {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)) !important;
            gap: 16px !important;
          }

          .history-action-row {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0
        }}
      >
        <div
          className="history-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="btn-back-studio"
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid #a855f7',
              color: '#a855f7',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.2s'
            }}
          >
            {translations.back}
          </button>

          <div
            className="filter-container"
            style={{
              display: 'flex',
              gap: '8px',
              background: '#111',
              padding: '5px',
              borderRadius: '14px',
              border: '1px solid #222'
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('IMAGE')}
              aria-pressed={filter === 'IMAGE'}
              style={{
                padding: '10px 25px',
                borderRadius: '10px',
                border: 'none',
                background: filter === 'IMAGE' ? '#a855f7' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                transition: '0.2s'
              }}
            >
              🖼️ {translations.images}
            </button>

            <button
              type="button"
              onClick={() => setFilter('VIDEO')}
              aria-pressed={filter === 'VIDEO'}
              style={{
                padding: '10px 25px',
                borderRadius: '10px',
                border: 'none',
                background: filter === 'VIDEO' ? '#a855f7' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                transition: '0.2s'
              }}
            >
              🎬 {translations.videos}
            </button>
          </div>
        </div>

        <div className="history-scroll-area">
          <div
            className="history-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px'
            }}
          >
            {filteredData.length > 0 ? (
              filteredData.map(item => {
                const video = isVideo(item);
                const url = mediaUrl(item);

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#111',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid #222',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0
                    }}
                  >
                    <div
                      className="history-media-preview"
                      onClick={() => setSelectedMedia(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedMedia(item);
                        }
                      }}
                      title={translations.enlarge}
                      style={{
                        aspectRatio: '1/1',
                        background: '#000',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      {filter === 'IMAGE' ? (
                        <img
                          src={url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          alt={item.prompt || translations.generatedImage}
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none',
                            display: 'block'
                          }}
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedMetadata={e => {
                            try {
                              if (e.currentTarget.duration > 4) {
                                e.currentTarget.currentTime = 2;
                              }
                            } catch (_) {}
                          }}
                          onError={e => {
                            console.error(
                              'Erreur de chargement de la vidéo dans l’historique :',
                              e.currentTarget.error,
                              url
                            );
                          }}
                        />
                      )}

                      <div
                        className="history-preview-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          fontSize: '24px',
                          pointerEvents: 'none'
                        }}
                      >
                        {filter === 'IMAGE' ? '🔍' : '▶️'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#ccc',
                          margin: 0,
                          height: '56px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.5'
                        }}
                      >
                        {item.prompt || item.description || translations.noDescription}
                      </p>

                      <div
                        className="history-action-row"
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'stretch'
                        }}
                      >
                        <button
                          type="button"
                          className="history-media-action"
                          onClick={() => onRemix?.(item)}
                          style={{
                            flex: 1,
                            background: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: '0.15s'
                          }}
                        >
                          {translations.remix}
                        </button>

                        {video && url && (
                          <button
                            type="button"
                            className="history-media-action"
                            onClick={() => onEdit?.(item)}
                            title={translations.editTitle}
                            style={{
                              flex: 1,
                              background: 'rgba(168,85,247,0.14)',
                              color: '#c084fc',
                              border: '1px solid rgba(168,85,247,0.55)',
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              transition: '0.15s'
                            }}
                          >
                            {translations.edit}
                          </button>
                        )}

                        <button
                          type="button"
                          className="history-media-action"
                          onClick={() => onDownload?.(item)}
                          style={{
                            background: '#222',
                            color: 'white',
                            border: '1px solid #333',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: '0.15s'
                          }}
                          title={translations.download}
                          aria-label={translations.download}
                        >
                          📥
                        </button>

                        <button
                          type="button"
                          className="history-media-action"
                          onClick={() => onDelete?.(item.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.2)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: '0.15s'
                          }}
                          title={translations.delete}
                          aria-label={translations.delete}
                        >
                          🗑️
                        </button>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #222',
                          paddingTop: '10px',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#555' }}>
                          {isNaN(Number(item.id))
                            ? translations.localFile
                            : new Date(Number(item.id)).toLocaleDateString(
                                language === 'zh' ? 'zh-CN' :
                                language === 'ja' ? 'ja-JP' :
                                language === 'ko' ? 'ko-KR' :
                                language === 'en' ? 'en-US' : 'fr-FR'
                              )}
                        </span>

                        <span
                          style={{
                            fontSize: '10px',
                            background: '#1a1a1a',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: '#a855f7',
                            border: '1px solid #333',
                            maxWidth: '60%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.model ||
                            item.engine ||
                            (filter === 'IMAGE' ? 'Flux Pro' : 'Hailuo AI')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '100px 20px'
                }}
              >
                <h3 style={{ color: '#444' }}>{translations.empty}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedMedia(null)}
            aria-label="Fermer"
            title="Fermer"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '75vh',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              background: '#000',
              display: 'flex'
            }}
          >
            {isVideo(selectedMedia) ? (
              <video
                src={mediaUrl(selectedMedia)}
                controls
                autoPlay
                playsInline
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            ) : (
              <img
                src={mediaUrl(selectedMedia)}
                alt={translations.largePreview}
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
              marginTop: '20px',
              background: 'rgba(255,255,255,0.05)',
              padding: '15px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxSizing: 'border-box'
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#ddd',
                lineHeight: '1.5'
              }}
            >
              {selectedMedia.prompt ||
                selectedMedia.description ||
                translations.noDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHistoryPage;
