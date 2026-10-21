import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PRIVACY_CONTENT = {
  fr: {
    back: '← Retour au Studio', title: 'Politique de confidentialité', updated: 'Dernière mise à jour : 18 mars 2026 — Eclipse IA',
    sections: [
      { title: '1. Collecte des données', intro: 'Lorsque vous utilisez Eclipse IA, nous collectons les informations suivantes :', items: [
        ['Informations de compte :', 'votre adresse e-mail et le nom d’utilisateur fournis lors de l’inscription.'],
        ['Contenus générés :', 'les prompts (instructions textuelles) ainsi que les images et vidéos générées, afin de permettre leur affichage dans votre historique.'],
        ['Données de paiement :', 'les transactions sont gérées par Stripe. Eclipse IA ne reçoit pas vos numéros complets de carte bancaire.'] ] },
      { title: '2. Utilisation des données', intro: 'Vos données sont utilisées pour les finalités suivantes :', items: [
        ['', 'fournir et maintenir le service Eclipse IA ;'], ['', 'gérer votre abonnement et vos crédits de génération ;'], ['', 'améliorer l’interface utilisateur et les performances du service ;'], ['', 'assurer la sécurité et prévenir les fraudes, notamment les abus liés à la création de plusieurs comptes.'] ] },
      { title: '3. Conservation et stockage', paragraphs: [
        ['Stockage local :', ' pour faciliter l’utilisation du service, Eclipse IA peut utiliser le stockage local de votre navigateur (localStorage) afin de mémoriser vos préférences et votre historique récent.'],
        ['Serveurs :', ' les données nécessaires au fonctionnement du service, notamment celles relatives au compte et aux abonnements, peuvent être stockées sur des serveurs sécurisés. Les durées de conservation dépendent de la nature des données, des besoins du service et des obligations légales applicables.'] ] },
      { title: '4. Partage avec des tiers', intro: 'Nous ne vendons pas vos données personnelles. Certaines informations peuvent être transmises aux prestataires nécessaires au fonctionnement du service, dans la limite de leurs besoins :', items: [
        ['Fournisseurs d’IA :', ' les prompts et les données nécessaires à la génération peuvent être transmis aux API des fournisseurs concernés (par exemple Flux ou OpenAI). Leur traitement dépend également des conditions et politiques de ces fournisseurs.'],
        ['Stripe :', ' pour le traitement sécurisé des paiements.'] ] },
      { title: '5. Vos droits (RGPD)', paragraphs: [
        ['Conformément à la réglementation applicable en matière de protection des données, notamment au RGPD lorsque celui-ci s’applique,', ' vous pouvez disposer de droits d’accès, de rectification, d’effacement, de limitation du traitement, d’opposition et, dans certains cas, de portabilité. Vous pouvez également retirer votre consentement lorsque le traitement repose sur celui-ci.'],
        ['', 'Vous pouvez demander la clôture de votre compte et la suppression des données concernées depuis les réglages de votre profil, lorsque cette fonctionnalité est disponible, ou en contactant le support. Certains éléments peuvent devoir être conservés lorsque la loi l’exige ou pour établir, exercer ou défendre des droits en justice.'] ] }
    ],
    securityTitle: 'Sécurité', security: 'Nous mettons en œuvre des mesures techniques et organisationnelles destinées à protéger vos données. Toutefois, aucune méthode de transmission ou de stockage électronique ne peut garantir une sécurité absolue. Un risque résiduel subsiste malgré les mesures mises en place.',
    footer: '© 2026 Eclipse IA — Protection des données.'
  },
  en: {
    back: '← Back to Studio', title: 'Privacy Policy', updated: 'Last updated: March 18, 2026 — Eclipse IA',
    sections: [
      { title: '1. Data Collection', intro: 'When you use Eclipse IA, we collect the following information:', items: [
        ['Account information:', ' your email address and username provided during registration.'],
        ['Generated content:', ' prompts (text instructions) and generated images or videos, so they can be displayed in your history.'],
        ['Payment data:', ' transactions are handled by Stripe. Eclipse IA does not receive your full payment card number.'] ] },
      { title: '2. How We Use Data', intro: 'Your data is used for the following purposes:', items: [
        ['', 'to provide and maintain the Eclipse IA service;'], ['', 'to manage your subscription and generation credits;'], ['', 'to improve the user interface and service performance;'], ['', 'to maintain security and prevent fraud, including abuse involving multiple accounts.'] ] },
      { title: '3. Retention and Storage', paragraphs: [
        ['Local storage:', ' for convenience, Eclipse IA may use your browser’s local storage (localStorage) to remember your preferences and recent history.'],
        ['Servers:', ' data needed to operate the service, including account and subscription information, may be stored on secure servers. Retention periods depend on the type of data, service needs and applicable legal requirements.'] ] },
      { title: '4. Sharing with Third Parties', intro: 'We do not sell your personal data. Some information may be shared with service providers needed to operate the service, limited to what they need:', items: [
        ['AI providers:', ' prompts and data needed for generation may be sent to the relevant providers’ APIs (for example, Flux or OpenAI). Their processing is also subject to those providers’ terms and privacy policies.'],
        ['Stripe:', ' to process payments securely.'] ] },
      { title: '5. Your Rights (GDPR)', paragraphs: [
        ['Under applicable data protection laws, including the GDPR where it applies,', ' you may have rights to access, rectify, erase, restrict or object to processing, and, in certain circumstances, to data portability. You may also withdraw consent where processing is based on consent.'],
        ['', 'You may request account closure and deletion of relevant data through your profile settings, where available, or by contacting support. Some information may need to be retained where required by law or to establish, exercise or defend legal claims.'] ] }
    ],
    securityTitle: 'Security', security: 'We implement technical and organizational measures designed to protect your data. However, no method of electronic transmission or storage can guarantee absolute security. Some residual risk remains despite the safeguards in place.',
    footer: '© 2026 Eclipse IA — Data Protection.'
  },
  ko: {
    back: '← 스튜디오로 돌아가기', title: '개인정보 처리방침', updated: '최종 업데이트: 2026년 3월 18일 — Eclipse IA',
    sections: [
      { title: '1. 데이터 수집', intro: 'Eclipse IA를 이용할 때 다음 정보를 수집할 수 있습니다:', items: [
        ['계정 정보:', ' 가입 시 제공한 이메일 주소와 사용자 이름.'],
        ['생성 콘텐츠:', ' 기록에서 표시할 수 있도록 프롬프트(텍스트 지시문)와 생성된 이미지 및 동영상.'],
        ['결제 데이터:', ' 결제 거래는 Stripe가 처리합니다. Eclipse IA는 전체 결제 카드 번호를 받지 않습니다.'] ] },
      { title: '2. 데이터 이용', intro: '데이터는 다음 목적으로 사용됩니다:', items: [
        ['', 'Eclipse IA 서비스를 제공하고 유지하기 위해;'], ['', '구독 및 생성 크레딧을 관리하기 위해;'], ['', '사용자 인터페이스와 서비스 성능을 개선하기 위해;'], ['', '여러 계정 생성 악용을 포함한 사기를 방지하고 보안을 유지하기 위해.'] ] },
      { title: '3. 보관 및 저장', paragraphs: [
        ['로컬 저장소:', ' 편의를 위해 Eclipse IA는 브라우저의 로컬 저장소(localStorage)를 사용하여 환경설정과 최근 기록을 기억할 수 있습니다.'],
        ['서버:', ' 계정 및 구독 정보 등 서비스 운영에 필요한 데이터는 보안 서버에 저장될 수 있습니다. 보관 기간은 데이터 유형, 서비스 운영상 필요 및 적용되는 법적 의무에 따라 달라집니다.'] ] },
      { title: '4. 제3자와의 공유', intro: '개인정보를 판매하지 않습니다. 서비스 운영에 필요한 범위에서 필요한 서비스 제공업체와 일부 정보를 공유할 수 있습니다:', items: [
        ['AI 제공업체:', ' 생성에 필요한 프롬프트와 데이터는 해당 제공업체의 API(예: Flux 또는 OpenAI)로 전송될 수 있습니다. 해당 데이터 처리는 제공업체의 약관 및 개인정보 처리방침도 적용받습니다.'],
        ['Stripe:', ' 안전한 결제 처리를 위해 사용됩니다.'] ] },
      { title: '5. 이용자의 권리(GDPR)', paragraphs: [
        ['적용되는 개인정보 보호 법률 및 해당되는 경우 GDPR에 따라', ' 이용자는 개인정보 열람, 정정, 삭제, 처리 제한, 처리 반대 및 특정 상황에서 데이터 이동을 요청할 권리를 가질 수 있습니다. 동의에 근거한 처리의 경우 동의를 철회할 수도 있습니다.'],
        ['', '가능한 경우 프로필 설정에서 계정 폐쇄 및 관련 데이터 삭제를 요청하거나 고객지원에 문의할 수 있습니다. 법률상 요구되거나 법적 청구를 제기·행사·방어하기 위해 일부 정보는 보관해야 할 수 있습니다.'] ] }
    ],
    securityTitle: '보안', security: '당사는 데이터를 보호하기 위한 기술적·관리적 조치를 시행합니다. 그러나 전자적 전송이나 저장 방식 중 절대적인 보안을 보장하는 방법은 없습니다. 보호 조치를 시행하더라도 잔여 위험이 존재할 수 있습니다.',
    footer: '© 2026 Eclipse IA — 개인정보 보호.'
  },
  ja: {
    back: '← スタジオに戻る', title: 'プライバシーポリシー', updated: '最終更新日：2026年3月18日 — Eclipse IA',
    sections: [
      { title: '1. データの収集', intro: 'Eclipse IAをご利用の際、以下の情報を収集することがあります。', items: [
        ['アカウント情報：', '登録時に提供されたメールアドレスとユーザー名。'],
        ['生成コンテンツ：', '履歴に表示するためのプロンプト（テキストによる指示）および生成された画像・動画。'],
        ['決済データ：', '決済取引はStripeが処理します。Eclipse IAがカード番号全体を受け取ることはありません。'] ] },
      { title: '2. データの利用', intro: 'データは次の目的で利用します。', items: [
        ['', 'Eclipse IAサービスの提供および維持。'], ['', 'サブスクリプションと生成クレジットの管理。'], ['', 'ユーザーインターフェースとサービス性能の改善。'], ['', '複数アカウントの悪用などの不正を防止し、セキュリティを確保すること。'] ] },
      { title: '3. 保存と保管', paragraphs: [
        ['ローカルストレージ：', '利便性のため、Eclipse IAはブラウザーのローカルストレージ（localStorage）を使用して、設定や最近の履歴を保存する場合があります。'],
        ['サーバー：', 'アカウントやサブスクリプション情報など、サービス運営に必要なデータは安全なサーバーに保存される場合があります。保存期間はデータの種類、サービス上の必要性、適用される法的義務によって異なります。'] ] },
      { title: '4. 第三者との共有', intro: '個人データを販売することはありません。サービス運営に必要な範囲で、必要なサービス提供者と情報を共有する場合があります。', items: [
        ['AIプロバイダー：', '生成に必要なプロンプトやデータは、該当するプロバイダーのAPI（FluxやOpenAIなど）に送信される場合があります。その処理には各プロバイダーの利用規約およびプライバシーポリシーも適用されます。'],
        ['Stripe：', '決済を安全に処理するために利用します。'] ] },
      { title: '5. お客様の権利（GDPR）', paragraphs: [
        ['適用されるデータ保護法（該当する場合はGDPRを含む）に基づき、', '個人データへのアクセス、訂正、削除、処理の制限、処理への異議申し立て、および一定の場合のデータポータビリティを請求できることがあります。同意に基づく処理については、同意を撤回できる場合もあります。'],
        ['', '利用可能な場合はプロフィール設定からアカウントの閉鎖と該当データの削除を申請するか、サポートにお問い合わせください。法律上必要な場合や法的請求の確立・行使・防御のため、一部の情報を保持することがあります。'] ] }
    ],
    securityTitle: 'セキュリティ', security: '当社はデータ保護のため、技術的および組織的な対策を講じています。ただし、電子的な送信または保存方法で完全な安全性を保証することはできません。対策を講じても、一定の残存リスクがあります。',
    footer: '© 2026 Eclipse IA — データ保護。'
  },
  zh: {
    back: '← 返回工作室', title: '隐私政策', updated: '最后更新：2026年3月18日 — Eclipse IA',
    sections: [
      { title: '1. 数据收集', intro: '使用 Eclipse IA 时，我们可能会收集以下信息：', items: [
        ['账户信息：', '注册时提供的电子邮箱地址和用户名。'],
        ['生成内容：', '提示词（文本指令）以及生成的图片和视频，以便在历史记录中显示。'],
        ['支付数据：', '支付交易由 Stripe 处理。Eclipse IA 不会收到完整的银行卡号。'] ] },
      { title: '2. 数据使用', intro: '您的数据用于以下目的：', items: [
        ['', '提供并维护 Eclipse IA 服务；'], ['', '管理您的订阅和生成额度；'], ['', '改进用户界面和服务性能；'], ['', '保障安全并防止欺诈，包括滥用多个账户的行为。'] ] },
      { title: '3. 保存与存储', paragraphs: [
        ['本地存储：', '为方便使用，Eclipse IA 可能使用浏览器本地存储（localStorage）保存您的偏好设置和近期历史记录。'],
        ['服务器：', '账户和订阅信息等运行服务所需的数据可能存储在安全服务器上。保存期限取决于数据类型、服务需要以及适用的法律义务。'] ] },
      { title: '4. 与第三方共享', intro: '我们不会出售您的个人数据。为运行服务所必需的信息可能会在必要范围内提供给相关服务供应商：', items: [
        ['AI 供应商：', '生成所需的提示词和数据可能会发送至相关供应商的 API（例如 Flux 或 OpenAI）。这些供应商也会依据其自身的条款和隐私政策处理数据。'],
        ['Stripe：', '用于安全处理支付。'] ] },
      { title: '5. 您的权利（GDPR）', paragraphs: [
        ['根据适用的数据保护法律（包括在适用情况下的 GDPR），', '您可能享有访问、更正、删除、限制处理、反对处理以及在特定情况下进行数据可携带的权利。如果处理基于您的同意，您也可以撤回同意。'],
        ['', '如该功能可用，您可以在个人资料设置中申请关闭账户并删除相关数据，也可以联系支持团队。若法律要求保留，或为确立、行使或抗辩法律请求所必需，我们可能需要保留部分信息。'] ] }
    ],
    securityTitle: '安全', security: '我们采取旨在保护您数据的技术和组织措施。但任何电子传输或存储方式都无法保证绝对安全，即使已采取保护措施，仍可能存在一定的残余风险。',
    footer: '© 2026 Eclipse IA — 数据保护。'
  }
};

const getLanguage = (language) => {
  const code = String(language || 'fr').toLowerCase().split('-')[0];
  return PRIVACY_CONTENT[code] ? code : 'fr';
};

const PrivacyPage = ({ onBack }) => {
  const { i18n } = useTranslation();
  const lang = getLanguage(i18n.resolvedLanguage || i18n.language);
  const content = PRIVACY_CONTENT[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh', padding: '60px 20px', fontFamily: '"Inter", "Segoe UI", sans-serif', lineHeight: '1.7', overflowY: 'auto' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ marginBottom: '40px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 24px', borderRadius: '99px', fontSize: '14px' }}>
          {content.back}
        </button>
        <header style={{ borderBottom: '1px solid #222', paddingBottom: '30px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>{content.title}</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>{content.updated}</p>
        </header>
        <div style={{ fontSize: '15px', color: '#d4d4d8' }}>
          {content.sections.map((section) => (
            <section key={section.title} style={{ marginBottom: '35px' }}>
              <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>{section.title}</h2>
              {section.intro && <p>{section.intro}</p>}
              {section.paragraphs?.map(([lead, text], index) => (
                <p key={index} style={index > 0 ? { marginTop: '10px' } : undefined}>
                  {lead && <strong>{lead}</strong>}{text}
                </p>
              ))}
              {section.items && <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#a1a1aa' }}>
                {section.items.map(([lead, text], index) => <li key={index}>{lead && <strong>{lead}</strong>}{text}</li>)}
              </ul>}
            </section>
          ))}
          <section style={{ marginBottom: '35px', padding: '20px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px' }}>{content.securityTitle}</h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>{content.security}</p>
          </section>
        </div>
        <footer style={{ marginTop: '60px', paddingBottom: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '12px' }}>{content.footer}</footer>
      </div>
    </div>
  );
};

export default PrivacyPage;
