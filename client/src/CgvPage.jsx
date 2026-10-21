
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './TermsPage.css';

const translations = {
  fr: {
    back: '← Retour au Studio',
    title: 'Conditions Générales de Vente (CGV)',
    updated: 'Dernière mise à jour : 8 septembre 2026 — Eclipse IA',
    sections: [
      {
        title: "1. Champ d'application",
        paragraphs: [
          'Les présentes Conditions Générales de Vente (CGV) régissent l’ensemble des ventes de services, d’abonnements, de packs de jetons (« Éclairs ») et de « Diamants » réalisées sur la plateforme Eclipse IA. Tout achat effectué sur le site implique l’adhésion entière et sans réserve de l’utilisateur aux présentes CGV.'
        ]
      },
      {
        title: '2. Produits et Tarifs',
        paragraphs: [
          'Eclipse IA propose l’accès à son studio de création de contenu par intelligence artificielle sous forme de crédits virtuels (Éclairs / Diamants) ou d’abonnements.'
        ],
        bullets: [
          'Les prix sont affichés en euros (€), toutes taxes comprises (TTC).',
          'Eclipse IA se réserve le droit de modifier ses prix à tout moment. Les services seront toutefois facturés selon les tarifs en vigueur au moment de la validation de la commande.'
        ]
      },
      {
        title: '3. Modalités de Paiement et Sécurité',
        paragraphs: [
          'Le règlement des achats s’effectue par carte bancaire ou via les solutions de paiement sécurisées proposées sur la plateforme, par exemple Stripe.',
          'Le débit est immédiat au moment de la validation de la transaction. Aucune donnée bancaire sensible n’est stockée sur les serveurs d’Eclipse IA.'
        ]
      },
      {
        title: '4. Absence de Droit de Rétractation',
        paragraphs: [
          'Conformément à l’article L. 221-28 du Code de la consommation, les services de génération de contenu numérique fournis sur un support immatériel et dont l’exécution commence immédiatement après l’achat (consommation de crédits ou génération de vidéos par l’IA) ne bénéficient pas du droit de rétractation, ce que l’utilisateur reconnaît et accepte expressément lors de sa commande.'
        ]
      },
      {
        title: '5. Remboursement et Utilisation des Crédits',
        paragraphs: [
          'Les Éclairs et Diamants achetés sont strictement personnels, non cessibles et non remboursables, y compris en cas de clôture du compte, qu’elle soit à l’initiative de l’utilisateur ou d’Eclipse IA en cas de non-respect des Conditions Générales d’Utilisation (CGU).'
        ]
      }
    ],
    contactTitle: 'Une question concernant une commande ?',
    contactText: 'Notre équipe de support est à votre disposition pour résoudre tout problème de facturation.',
    contactButton: 'Contacter le support',
    footer: '© 2026 Eclipse IA — Studio de Création Multimodale.'
  },

  en: {
    back: '← Back to Studio',
    title: 'General Terms and Conditions of Sale',
    updated: 'Last updated: September 8, 2026 — Eclipse IA',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'These General Terms and Conditions of Sale govern all sales of services, subscriptions, token packs (“Lightning”) and “Diamonds” made through the Eclipse IA platform. Any purchase made on the website constitutes the user’s full and unconditional acceptance of these terms.'
        ]
      },
      {
        title: '2. Products and Pricing',
        paragraphs: [
          'Eclipse IA provides access to its AI-powered content creation studio through virtual credits (Lightning / Diamonds) or subscriptions.'
        ],
        bullets: [
          'Prices are displayed in euros (€), including all applicable taxes.',
          'Eclipse IA reserves the right to change its prices at any time. However, services will be charged at the prices in effect when the order is confirmed.'
        ]
      },
      {
        title: '3. Payment Methods and Security',
        paragraphs: [
          'Purchases can be paid for by bank card or through the secure payment solutions offered on the platform, such as Stripe.',
          'Payment is charged immediately when the transaction is confirmed. No sensitive banking information is stored on Eclipse IA servers.'
        ]
      },
      {
        title: '4. No Right of Withdrawal',
        paragraphs: [
          'Under Article L. 221-28 of the French Consumer Code, digital content generation services supplied in intangible form and whose performance begins immediately after purchase (use of credits or AI video generation) are not eligible for the right of withdrawal. The user expressly acknowledges and accepts this when placing an order.'
        ]
      },
      {
        title: '5. Refunds and Use of Credits',
        paragraphs: [
          'Purchased Lightning credits and Diamonds are strictly personal, non-transferable and non-refundable, including if the account is closed, whether at the user’s request or by Eclipse IA due to a breach of the Terms of Use.'
        ]
      }
    ],
    contactTitle: 'Questions about an order?',
    contactText: 'Our support team is available to help resolve any billing issues.',
    contactButton: 'Contact Support',
    footer: '© 2026 Eclipse IA — Multimodal Creation Studio.'
  },

  ko: {
    back: '← 스튜디오로 돌아가기',
    title: '판매 이용약관',
    updated: '최종 업데이트: 2026년 9월 8일 — Eclipse IA',
    sections: [
      {
        title: '1. 적용 범위',
        paragraphs: [
          '본 판매 이용약관은 Eclipse IA 플랫폼에서 제공되는 서비스, 구독, 토큰 팩(“라이트닝”) 및 “다이아몬드”의 모든 판매에 적용됩니다. 웹사이트에서 구매하면 사용자는 본 약관에 전적으로 동의하는 것으로 간주됩니다.'
        ]
      },
      {
        title: '2. 상품 및 가격',
        paragraphs: [
          'Eclipse IA는 가상 크레딧(라이트닝 / 다이아몬드) 또는 구독 방식으로 AI 콘텐츠 제작 스튜디오를 이용할 수 있도록 제공합니다.'
        ],
        bullets: [
          '가격은 관련 세금을 포함한 유로(€)로 표시됩니다.',
          'Eclipse IA는 언제든지 가격을 변경할 수 있습니다. 다만 주문이 확정될 때 적용되는 가격으로 서비스 요금이 청구됩니다.'
        ]
      },
      {
        title: '3. 결제 방법 및 보안',
        paragraphs: [
          '구매 금액은 은행 카드 또는 Stripe와 같은 플랫폼의 보안 결제 서비스를 통해 결제할 수 있습니다.',
          '거래가 확정되면 결제가 즉시 처리됩니다. 민감한 은행 정보는 Eclipse IA 서버에 저장되지 않습니다.'
        ]
      },
      {
        title: '4. 청약 철회권의 제한',
        paragraphs: [
          '프랑스 소비자법 제L. 221-28조에 따라, 무형의 디지털 콘텐츠 생성 서비스 중 구매 직후 제공이 시작되는 서비스(크레딧 사용 또는 AI 동영상 생성)는 청약 철회권의 적용 대상이 아닐 수 있습니다. 사용자는 주문 시 이 내용을 명시적으로 확인하고 동의합니다.'
        ]
      },
      {
        title: '5. 환불 및 크레딧 사용',
        paragraphs: [
          '구매한 라이트닝 크레딧과 다이아몬드는 개인 전용이며 양도하거나 환불할 수 없습니다. 사용자의 요청 또는 이용약관 위반에 따른 Eclipse IA의 조치로 계정이 폐쇄되는 경우에도 동일하게 적용됩니다.'
        ]
      }
    ],
    contactTitle: '주문 관련 문의가 있으신가요?',
    contactText: '결제 또는 청구 문제를 해결할 수 있도록 지원팀이 도와드립니다.',
    contactButton: '고객 지원 문의',
    footer: '© 2026 Eclipse IA — 멀티모달 콘텐츠 제작 스튜디오.'
  },

  ja: {
    back: '← スタジオに戻る',
    title: '販売利用規約',
    updated: '最終更新日：2026年9月8日 — Eclipse IA',
    sections: [
      {
        title: '1. 適用範囲',
        paragraphs: [
          '本販売利用規約は、Eclipse IAプラットフォームで提供されるサービス、サブスクリプション、トークンパック（「ライトニング」）および「ダイヤモンド」のすべての販売に適用されます。本サイトで購入を行うことにより、ユーザーは本規約に全面的かつ無条件に同意したものとみなされます。'
        ]
      },
      {
        title: '2. 商品および料金',
        paragraphs: [
          'Eclipse IAでは、仮想クレジット（ライトニング／ダイヤモンド）またはサブスクリプションを通じて、AIコンテンツ制作スタジオを利用できます。'
        ],
        bullets: [
          '価格は税込みのユーロ（€）で表示されます。',
          'Eclipse IAはいつでも価格を変更する権利を有します。ただし、注文の確定時に適用されている料金に基づいて請求されます。'
        ]
      },
      {
        title: '3. 支払い方法とセキュリティ',
        paragraphs: [
          '購入代金は、銀行カードまたはStripeなど、本プラットフォームが提供する安全な決済サービスを通じて支払うことができます。',
          '取引の確定時に決済が行われます。機密性の高い銀行情報がEclipse IAのサーバーに保存されることはありません。'
        ]
      },
      {
        title: '4. クーリングオフの適用除外',
        paragraphs: [
          'フランス消費者法第L. 221-28条に基づき、無形のデジタルコンテンツ生成サービスで、購入直後に提供が開始されるもの（クレジットの使用やAIによる動画生成など）は、クーリングオフの対象外となる場合があります。ユーザーは注文時にこの内容を明示的に確認し、同意します。'
        ]
      },
      {
        title: '5. 返金およびクレジットの利用',
        paragraphs: [
          '購入したライトニングクレジットおよびダイヤモンドは本人のみが使用でき、譲渡および返金はできません。ユーザー自身によるアカウント閉鎖の場合も、利用規約違反によりEclipse IAがアカウントを閉鎖した場合も同様です。'
        ]
      }
    ],
    contactTitle: '注文についてご質問がありますか？',
    contactText: '請求や支払いに関する問題について、サポートチームがお手伝いします。',
    contactButton: 'サポートに問い合わせる',
    footer: '© 2026 Eclipse IA — マルチモーダル制作スタジオ。'
  },

  zh: {
    back: '← 返回创作工作室',
    title: '销售条款与条件',
    updated: '最后更新：2026年9月8日 — Eclipse IA',
    sections: [
      {
        title: '1. 适用范围',
        paragraphs: [
          '本销售条款与条件适用于 Eclipse IA 平台提供的所有服务、订阅、代币包（“闪电”）和“钻石”的销售。用户在本网站进行任何购买，即表示完全且无条件地接受本条款。'
        ]
      },
      {
        title: '2. 产品与价格',
        paragraphs: [
          'Eclipse IA 通过虚拟积分（闪电／钻石）或订阅方式，提供人工智能内容创作工作室的使用权限。'
        ],
        bullets: [
          '价格以欧元（€）显示，并包含所有适用税费。',
          'Eclipse IA 保留随时调整价格的权利，但订单将按照确认时有效的价格收费。'
        ]
      },
      {
        title: '3. 付款方式与安全',
        paragraphs: [
          '用户可以使用银行卡，或通过平台提供的安全支付服务（例如 Stripe）完成付款。',
          '交易确认后将立即扣款。Eclipse IA 服务器不会存储敏感的银行信息。'
        ]
      },
      {
        title: '4. 不适用撤回权的情形',
        paragraphs: [
          '根据法国《消费者法典》第 L. 221-28 条，对于以无形形式提供、并在购买后立即开始履行的数字内容生成服务（例如消耗积分或使用 AI 生成视频），撤回权可能不适用。用户在下单时明确确认并接受这一点。'
        ]
      },
      {
        title: '5. 退款与积分使用',
        paragraphs: [
          '已购买的闪电积分和钻石仅供购买者本人使用，不得转让且不予退款。无论账户由用户主动关闭，还是因违反使用条款而由 Eclipse IA 关闭，均适用此规定。'
        ]
      }
    ],
    contactTitle: '对订单有疑问？',
    contactText: '我们的支持团队可以协助您解决账单或付款问题。',
    contactButton: '联系客户支持',
    footer: '© 2026 Eclipse IA — 多模态创作工作室。'
  }
};

const CgvPage = ({ onBack, onContactClick }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    'fr'
  ).toLowerCase().split(/[-_]/)[0];

  const content = translations[currentLanguage] || translations.fr;

  return (
    <div className="terms-wrapper">
      <div className="terms-container">
        <button onClick={onBack} className="btn-back">
          {content.back}
        </button>

        <header className="terms-header">
          <h1>{content.title}</h1>
          <p>{content.updated}</p>
        </header>

        <div className="terms-content">
          {content.sections.map((section, index) => (
            <section className="terms-section" key={index}>
              <h2>{section.title}</h2>

              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}

              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="contact-box">
            <h2>{content.contactTitle}</h2>
            <p>{content.contactText}</p>

            <button
              onClick={onContactClick}
              className="btn-contact-support"
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {content.contactButton}
            </button>
          </section>
        </div>

        <footer className="terms-footer">
          {content.footer}
        </footer>
      </div>
    </div>
  );
};

export default CgvPage;
