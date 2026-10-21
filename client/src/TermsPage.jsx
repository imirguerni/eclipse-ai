import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './TermsPage.css';

const TERMS = {
  "en": {
    "back": "← Back to Studio",
    "title": "Terms and Conditions of Use",
    "updated": "Last updated: September 8, 2026 — Eclipse IA",
    "contactTitle": "Contact",
    "contactButton": "Contact support",
    "recaptcha": "This site is protected by reCAPTCHA and Google’s",
    "privacy": "Privacy Policy",
    "and": "and",
    "googleTerms": "Terms of Service",
    "applies": "apply.",
    "footer": "© 2026 Eclipse IA — Multimodal Creative Studio.",
    "warning": "Fraudulent or clearly abusive use may result in account suspension or termination.",
    "sections": [
      {
        "title": "1. Purpose and Service Publisher",
        "paragraphs": [
          "These Terms and Conditions of Use (“Terms”) govern use of the Eclipse IA platform, available through its website and associated interfaces.",
          "Eclipse IA is a multimodal creative studio that allows users to generate, transform and process text, images, audio and video using artificial intelligence technologies.",
          "Service publisher: Eclipse IA is operated by the publisher identified in the website’s Legal Notice. Complete legal information (registration details, contact information, hosting provider, etc.) is available on the “Legal Notice” page."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "2. Eligibility and Age Requirements",
        "paragraphs": [
          "Use of Eclipse IA is limited to people aged 13 or older, subject to the age rules applicable in their country of residence.",
          "Where applicable law requires a higher minimum age, that higher age applies.",
          "Minor users must obtain permission from their legal guardian where required by law.",
          "If you use Eclipse IA on behalf of a company, association or other organization, you warrant that you have the authority to act on its behalf."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "3. Account and Security",
        "paragraphs": [
          "Users are responsible for the accuracy of the information they provide when creating and using their account.",
          "Users are responsible for keeping their login credentials confidential and taking reasonable steps to prevent unauthorized access to their account.",
          "You must not:"
        ],
        "bullets": [
          "create multiple accounts to bypass service limits, restrictions or promotions;",
          "share, sell or rent account credentials;",
          "fraudulently use another person’s account or payment method;",
          "knowingly provide false or misleading information."
        ],
        "subsections": []
      },
      {
        "title": "4. Subscriptions, Lightning Credits and Diamonds",
        "paragraphs": [
          "Eclipse IA may offer paid subscriptions and usage units called “Lightning Credits” and “Diamonds”."
        ],
        "bullets": [],
        "subsections": [
          {
            "title": "4.1 Subscriptions",
            "paragraphs": [
              "Subscriptions are charged at the frequency and rate shown at sign-up.",
              "Unless stated otherwise, subscriptions renew automatically at each billing date."
            ]
          },
          {
            "title": "4.2 Cancellation",
            "paragraphs": [
              "Users may cancel their subscription through the account management interface where this feature is available.",
              "Cancellation prevents automatic renewal. Unless otherwise provided or access is suspended for a breach of these Terms, paid features remain available until the end of the period already paid for."
            ]
          },
          {
            "title": "4.3 Lightning Credits",
            "paragraphs": [
              "Lightning Credits are usage units included with certain subscriptions.",
              "Included Lightning Credits are subject to the validity rules shown at sign-up. Unless stated otherwise, credits allocated for a subscription period do not automatically roll over to the next period."
            ]
          },
          {
            "title": "4.4 Diamonds",
            "paragraphs": [
              "Diamonds are usage units that may be purchased separately or included in certain offers.",
              "Unless otherwise stated at purchase, purchased Diamonds remain valid for one year from the purchase date.",
              "Credits and usage units are not electronic money, bank deposits or financial instruments and cannot be converted into cash."
            ]
          }
        ]
      },
      {
        "title": "5. Payments, Generation Failures and Refunds",
        "paragraphs": [],
        "bullets": [],
        "subsections": [
          {
            "title": "5.1 Payment",
            "paragraphs": [
              "Payments are made using the payment methods offered at checkout and may be processed by third-party payment providers.",
              "Users warrant that they are authorized to use the selected payment method."
            ]
          },
          {
            "title": "5.2 Successful generation",
            "paragraphs": [
              "When a generation is successfully processed by the service, the corresponding usage units may be treated as consumed, even if the result does not meet the user’s artistic or subjective expectations."
            ]
          },
          {
            "title": "⚠️ Generative results",
            "paragraphs": [
              "Artificial intelligence technologies are probabilistic. Results may vary from one generation to another and are not guaranteed to match a previous request.",
              "Subjective dissatisfaction with the style, appearance, motion, artistic rendering or quality of a generated result does not, by itself, automatically entitle the user to a refund or credit restoration."
            ]
          },
          {
            "title": "5.3 Technical generation failure",
            "paragraphs": [
              "If a generation fails due to a technical error attributable to Eclipse IA and credits were deducted, Eclipse IA may automatically restore the consumed units.",
              "Errors involving an invalid file, prohibited content, incompatible settings, a third-party provider or a model-specific limitation may be reviewed before credits are restored."
            ]
          },
          {
            "title": "5.4 Refunds",
            "paragraphs": [
              "Credit and subscription purchases are not automatically refundable solely because a user changes their mind or dislikes a generated result, subject to mandatory rights under applicable law.",
              "This does not restrict consumer rights, including cases where a refund is legally required because of non-conformity, service failure or another situation covered by applicable regulations."
            ]
          },
          {
            "title": "5.5 Right of withdrawal",
            "paragraphs": [
              "Where applicable law grants consumers a right of withdrawal, the relevant terms are presented during checkout.",
              "Where immediate performance of digital content or a digital service legally results in loss of the withdrawal right, the required consent and information are obtained in accordance with applicable law."
            ]
          }
        ]
      },
      {
        "title": "6. How AI Technologies Work",
        "paragraphs": [
          "Eclipse IA uses generative artificial intelligence and may integrate different models or technical providers.",
          "Because these technologies are probabilistic, Eclipse IA does not guarantee that a result will match a previous generation, exactly satisfy a prompt, be free of visual, textual, audio, video or conceptual errors, or remain available with every model at all times.",
          "Providers may temporarily make models unavailable, modify them, replace them or discontinue them."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "7. User-Uploaded Content",
        "paragraphs": [
          "Users retain their rights to images, videos, audio files, text and other materials they upload to Eclipse IA.",
          "By uploading content, users warrant that they hold the rights, permissions and licenses needed for Eclipse IA and the technical providers required to process it for the requested generation.",
          "Users remain responsible for the content they submit and must not upload content whose processing would be unlawful or infringe third-party rights."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "8. Generated Content and Intellectual Property",
        "paragraphs": [
          "To the extent permitted by applicable law, users may use content generated through Eclipse IA in accordance with their plan and these Terms.",
          "Users are responsible for checking that their use of generated content does not infringe intellectual property, image, personality or other third-party rights.",
          "Similar or identical results may be generated for different users; Eclipse IA therefore does not guarantee that generated results are unique or exclusive.",
          "Users authorize Eclipse IA to host, temporarily store and process content necessary to provide the requested features."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "9. Third-Party Services and Models",
        "paragraphs": [
          "Eclipse IA may use infrastructure, APIs, AI models, storage or technical services supplied by third-party companies to provide certain features.",
          "These providers may process prompts, images, videos, audio files or other data needed to generate results.",
          "Availability, performance, limitations and features of these services may change independently of Eclipse IA.",
          "Eclipse IA may modify, replace, suspend or temporarily remove access to a model or provider when needed for service operation, security or development."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "10. Use Restrictions",
        "paragraphs": [
          "You must not use Eclipse IA to:"
        ],
        "bullets": [
          "generate or distribute illegal content;",
          "generate child sexual abuse material or sexual content involving minors;",
          "generate hateful content or content intended to encourage violence or unlawful discrimination;",
          "infringe intellectual property or third-party rights;",
          "impersonate someone or misuse their likeness;",
          "bypass security systems or technical service limits;",
          "conduct unauthorized scraping or automated extraction;",
          "reverse engineer or attempt to extract Eclipse IA’s proprietary models, systems or mechanisms;",
          "use bots, scripts or automated systems to evade limits or deliberately overload the infrastructure."
        ],
        "subsections": []
      },
      {
        "title": "11. Availability and Interruptions",
        "paragraphs": [
          "Eclipse IA strives to keep the service available but does not guarantee permanent or uninterrupted availability.",
          "The service may be temporarily unavailable due to maintenance, technical incidents, infrastructure outages, third-party provider issues, or service updates and changes."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "12. Warranties and Liability",
        "paragraphs": [
          "The service is provided to the extent permitted by applicable law and according to the features described when it is used.",
          "Eclipse IA is not responsible for how users use generated content.",
          "Users are solely responsible for checking that generated content is suitable for its intended use, particularly in commercial, advertising, professional or artistic contexts.",
          "Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "13. Suspension and Termination",
        "paragraphs": [
          "Eclipse IA may temporarily suspend or terminate an account where use presents a risk of fraud, security issues, clear abuse or breach of these Terms.",
          "Where circumstances allow, Eclipse IA may inform the user of the reason for suspension or termination.",
          "These measures do not deprive users of mandatory rights granted by law."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "14. Changes to These Terms",
        "paragraphs": [
          "Eclipse IA may update these Terms to reflect changes to the service, technologies, regulations or business practices.",
          "For material changes, Eclipse IA may notify users by appropriate means, including through the service or by email where necessary."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "15. User Responsibility and Indemnification",
        "paragraphs": [
          "Users are responsible for consequences arising from unlawful or abusive use of the service and from content they upload or generate.",
          "To the extent permitted by applicable law, users agree to indemnify Eclipse IA against claims directly resulting from a breach of these Terms or clearly unlawful use of the service."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "16. Complaints and Dispute Resolution",
        "paragraphs": [
          "If a problem arises, users are encouraged to contact Eclipse IA support first to seek an amicable solution.",
          "For complaints, contact our team using the button below or through your customer account. We will endeavor to handle your request as soon as reasonably possible.",
          "If no amicable solution is reached, or for disputes concerning interpretation or performance of these Terms, the competent courts will be determined under applicable law."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "17. Contact",
        "paragraphs": [
          "For questions about these Terms, your subscription, credits or use of the service, contact Eclipse IA support."
        ],
        "bullets": [],
        "subsections": []
      }
    ]
  },
  "ko": {
    "back": "← 스튜디오로 돌아가기",
    "title": "이용약관",
    "updated": "최종 업데이트: 2026년 9월 8일 — Eclipse IA",
    "contactTitle": "문의",
    "contactButton": "고객 지원 문의",
    "recaptcha": "이 사이트는 reCAPTCHA로 보호되며 Google의",
    "privacy": "개인정보처리방침",
    "and": "및",
    "googleTerms": "서비스 약관",
    "applies": "이 적용됩니다.",
    "footer": "© 2026 Eclipse IA — 멀티모달 크리에이티브 스튜디오.",
    "warning": "사기 또는 명백한 남용 행위가 확인되면 계정이 정지되거나 해지될 수 있습니다.",
    "sections": [
      {
        "title": "1. 서비스 목적 및 운영자",
        "paragraphs": [
          "본 이용약관(‘약관’)은 웹사이트 및 관련 인터페이스를 통해 제공되는 Eclipse IA 플랫폼의 이용을 규정합니다.",
          "Eclipse IA는 인공지능 기술을 사용하여 텍스트, 이미지, 오디오 및 비디오 콘텐츠를 생성·변환·처리할 수 있는 멀티모달 창작 스튜디오입니다.",
          "서비스 운영자: Eclipse IA는 웹사이트의 법적 고지에 명시된 운영자가 운영합니다. 등록 정보, 연락처, 호스팅 제공업체 등 전체 법적 정보는 ‘법적 고지’ 페이지에서 확인할 수 있습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "2. 이용 자격 및 연령 요건",
        "paragraphs": [
          "Eclipse IA는 거주 국가의 연령 규정을 전제로 만 13세 이상만 이용할 수 있습니다.",
          "관련 법률에서 더 높은 최소 연령을 정한 경우에는 해당 연령이 우선 적용됩니다.",
          "법률에서 요구하는 경우 미성년자는 법정대리인의 허락을 받아야 합니다.",
          "회사, 협회 또는 기타 조직을 대신하여 Eclipse IA를 사용하는 경우, 해당 조직을 대리할 권한이 있음을 보증합니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "3. 계정 및 보안",
        "paragraphs": [
          "사용자는 계정 생성 및 이용 시 제공한 정보의 정확성에 책임을 집니다.",
          "사용자는 로그인 정보를 비밀로 유지하고 계정에 대한 무단 접근을 방지하기 위한 조치를 취해야 합니다.",
          "다음 행위는 금지됩니다:"
        ],
        "bullets": [
          "서비스 한도, 제한 또는 프로모션을 우회하기 위해 여러 계정을 만드는 행위;",
          "계정 정보를 공유·판매·대여하는 행위;",
          "타인의 계정이나 결제 수단을 부정하게 사용하는 행위;",
          "고의로 허위 또는 오해를 유발하는 정보를 제공하는 행위."
        ],
        "subsections": []
      },
      {
        "title": "4. 구독, 번개 크레딧 및 다이아몬드",
        "paragraphs": [
          "Eclipse IA는 유료 구독과 ‘번개 크레딧’ 및 ‘다이아몬드’라는 사용 단위를 제공할 수 있습니다."
        ],
        "bullets": [],
        "subsections": [
          {
            "title": "4.1 구독",
            "paragraphs": [
              "구독은 가입 시 표시된 주기와 요금에 따라 청구됩니다.",
              "달리 명시되지 않는 한 구독은 각 결제일에 자동 갱신됩니다."
            ]
          },
          {
            "title": "4.2 해지",
            "paragraphs": [
              "해당 기능이 제공되는 경우 계정 관리 화면에서 구독을 해지할 수 있습니다.",
              "해지는 자동 갱신을 중단합니다. 별도 규정이 있거나 약관 위반으로 접근이 정지된 경우를 제외하면 이미 결제한 기간이 끝날 때까지 유료 기능을 이용할 수 있습니다."
            ]
          },
          {
            "title": "4.3 번개 크레딧",
            "paragraphs": [
              "번개 크레딧은 일부 구독에 포함되는 사용 단위입니다.",
              "포함된 크레딧에는 가입 시 표시된 유효기간 규칙이 적용됩니다. 별도 표시가 없으면 해당 구독 기간의 크레딧은 다음 기간으로 자동 이월되지 않습니다."
            ]
          },
          {
            "title": "4.4 다이아몬드",
            "paragraphs": [
              "다이아몬드는 별도로 구매하거나 일부 상품에 포함될 수 있는 사용 단위입니다.",
              "구매 시 달리 표시되지 않는 한 구매한 다이아몬드는 구매일로부터 1년간 유효합니다.",
              "크레딧과 사용 단위는 전자화폐, 은행 예금 또는 금융상품이 아니며 현금으로 환전할 수 없습니다."
            ]
          }
        ]
      },
      {
        "title": "5. 결제, 생성 실패 및 환불",
        "paragraphs": [],
        "bullets": [],
        "subsections": [
          {
            "title": "5.1 결제",
            "paragraphs": [
              "결제는 주문 시 제공되는 결제 수단으로 이루어지며 제3자 결제업체가 처리할 수 있습니다.",
              "사용자는 선택한 결제 수단을 사용할 권한이 있음을 보증합니다."
            ]
          },
          {
            "title": "5.2 생성 성공",
            "paragraphs": [
              "서비스가 생성을 정상적으로 완료하면 결과가 사용자의 예술적 또는 주관적 기대에 미치지 못하더라도 해당 사용 단위가 소비된 것으로 처리될 수 있습니다."
            ]
          },
          {
            "title": "⚠️ 생성 결과",
            "paragraphs": [
              "인공지능 기술은 확률적이므로 생성 결과는 매번 달라질 수 있으며 이전 요청과 동일하다고 보장되지 않습니다.",
              "스타일, 외관, 움직임, 예술적 표현 또는 품질에 대한 주관적 불만만으로 자동 환불이나 크레딧 복구가 보장되지는 않습니다."
            ]
          },
          {
            "title": "5.3 기술적 생성 실패",
            "paragraphs": [
              "Eclipse IA에 귀속되는 기술 오류로 생성이 실패하고 크레딧이 차감된 경우, Eclipse IA는 사용된 단위를 자동 복구할 수 있습니다.",
              "잘못된 파일, 금지된 콘텐츠, 호환되지 않는 설정, 제3자 제공업체 또는 모델별 제한으로 인한 오류는 복구 전에 검토될 수 있습니다."
            ]
          },
          {
            "title": "5.4 환불",
            "paragraphs": [
              "사용자가 마음을 바꾸거나 결과를 마음에 들어 하지 않는다는 이유만으로 크레딧 및 구독 구매가 자동 환불되는 것은 아니며, 관련 법률상 강행 규정은 적용됩니다.",
              "이 규정은 부적합, 서비스 장애 또는 관련 법규가 정한 사유로 법적으로 환불이 필요한 경우 등 소비자의 법적 권리를 제한하지 않습니다."
            ]
          },
          {
            "title": "5.5 철회권",
            "paragraphs": [
              "관련 법률이 소비자에게 철회권을 부여하는 경우, 해당 조건은 주문 과정에서 안내됩니다.",
              "디지털 콘텐츠 또는 서비스의 즉시 제공으로 법률상 철회권이 상실되는 경우, 관련 법적 요건에 따라 필요한 동의와 정보를 받습니다."
            ]
          }
        ]
      },
      {
        "title": "6. AI 기술의 작동 방식",
        "paragraphs": [
          "Eclipse IA는 생성형 인공지능 기술을 사용하며 다양한 모델 또는 기술 제공업체를 통합할 수 있습니다.",
          "이 기술은 확률적 특성을 가지므로 결과가 이전 생성물과 동일하거나 요청을 정확히 충족하거나 시각·텍스트·오디오·비디오·개념적 오류가 없거나 모든 모델에서 항상 제공된다고 보장하지 않습니다.",
          "제공업체는 일부 모델을 일시적으로 사용할 수 없게 하거나 변경·교체·중단할 수 있습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "7. 사용자가 업로드한 콘텐츠",
        "paragraphs": [
          "사용자는 Eclipse IA에 업로드한 이미지, 동영상, 오디오 파일, 텍스트 및 기타 자료에 대한 권리를 보유합니다.",
          "콘텐츠를 업로드함으로써 사용자는 요청한 생성 작업을 위해 Eclipse IA 및 필요한 기술 제공업체가 이를 처리할 수 있는 권리·허가·라이선스를 보유하고 있음을 보증합니다.",
          "사용자는 제출한 콘텐츠에 책임이 있으며, 불법 처리 대상이거나 제3자의 권리를 침해하는 콘텐츠를 업로드해서는 안 됩니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "8. 생성 콘텐츠 및 지식재산권",
        "paragraphs": [
          "관련 법률이 허용하는 범위에서 사용자는 자신의 요금제와 본 약관에 따라 Eclipse IA에서 생성한 콘텐츠를 사용할 수 있습니다.",
          "사용자는 생성 콘텐츠의 사용이 지식재산권, 초상권, 인격권 또는 제3자의 기타 권리를 침해하지 않는지 확인할 책임이 있습니다.",
          "여러 사용자에게 유사하거나 동일한 결과가 생성될 수 있으므로 Eclipse IA는 결과의 고유성이나 독점성을 보장하지 않습니다.",
          "사용자는 요청한 기능 제공에 필요한 콘텐츠를 Eclipse IA가 호스팅하고 일시 저장 및 처리하는 것을 허용합니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "9. 제3자 서비스 및 모델",
        "paragraphs": [
          "일부 기능을 제공하기 위해 Eclipse IA는 제3자 회사가 제공하는 인프라, API, AI 모델, 저장소 또는 기술 서비스를 이용할 수 있습니다.",
          "이러한 제공업체는 생성에 필요한 프롬프트, 이미지, 동영상, 오디오 파일 또는 기타 데이터를 처리할 수 있습니다.",
          "이러한 서비스의 가용성, 성능, 제한 및 기능은 Eclipse IA와 별개로 변경될 수 있습니다.",
          "Eclipse IA는 서비스 운영, 보안 또는 개선을 위해 모델이나 제공업체에 대한 접근을 변경·교체·중단하거나 일시적으로 제거할 수 있습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "10. 이용 제한",
        "paragraphs": [
          "Eclipse IA를 다음 목적으로 이용해서는 안 됩니다:"
        ],
        "bullets": [
          "불법 콘텐츠 생성 또는 배포;",
          "미성년자가 관련된 아동 성착취물 또는 성적 콘텐츠 생성;",
          "혐오 콘텐츠 또는 폭력·불법 차별을 조장하는 콘텐츠 생성;",
          "지식재산권 또는 제3자의 권리 침해;",
          "타인 사칭 또는 초상권의 부정한 사용;",
          "보안 시스템이나 기술적 제한 우회;",
          "허가받지 않은 스크래핑 또는 자동화된 데이터 추출;",
          "Eclipse IA의 독점 모델·시스템·메커니즘을 역설계하거나 추출하려는 행위;",
          "제한을 우회하거나 인프라를 의도적으로 과부하시키는 봇·스크립트·자동화 시스템 사용."
        ],
        "subsections": []
      },
      {
        "title": "11. 서비스 제공 및 중단",
        "paragraphs": [
          "Eclipse IA는 서비스의 지속적 또는 중단 없는 제공을 보장하지는 않지만 가용성을 유지하기 위해 노력합니다.",
          "유지보수, 기술적 사고, 인프라 장애, 제3자 제공업체 문제 또는 서비스 업데이트로 인해 서비스가 일시적으로 중단될 수 있습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "12. 보증 및 책임",
        "paragraphs": [
          "서비스는 관련 법률이 허용하는 범위에서 이용 시 안내된 기능에 따라 제공됩니다.",
          "Eclipse IA는 사용자가 생성 콘텐츠를 어떻게 이용하는지에 대해 책임지지 않습니다.",
          "특히 상업적, 광고, 전문적 또는 예술적 용도에서 생성 콘텐츠가 목적에 적합한지 확인할 책임은 사용자에게 있습니다.",
          "본 약관은 법적으로 배제하거나 제한할 수 없는 책임을 배제하거나 제한하지 않습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "13. 계정 정지 및 해지",
        "paragraphs": [
          "사기, 보안 위험, 명백한 남용 또는 본 약관 위반의 우려가 있는 경우 Eclipse IA는 계정을 일시 정지하거나 해지할 수 있습니다.",
          "상황이 허용되는 경우 Eclipse IA는 정지 또는 해지 사유를 사용자에게 알릴 수 있습니다.",
          "이러한 조치는 법률상 보장되는 사용자의 강행적 권리를 박탈하지 않습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "14. 약관 변경",
        "paragraphs": [
          "Eclipse IA는 서비스, 사용 기술, 규정 또는 사업 관행의 변화를 반영하기 위해 본 약관을 변경할 수 있습니다.",
          "중대한 변경이 있는 경우 Eclipse IA는 필요에 따라 서비스 내 공지 또는 이메일 등 적절한 방법으로 사용자에게 알릴 수 있습니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "15. 사용자 책임 및 배상",
        "paragraphs": [
          "사용자는 서비스의 불법적 또는 남용적 이용과 업로드하거나 생성한 콘텐츠로 인해 발생하는 결과에 책임을 집니다.",
          "관련 법률이 허용하는 범위에서 사용자는 본 약관 위반 또는 명백히 불법적인 서비스 이용으로 직접 발생한 청구에 대해 Eclipse IA를 배상하는 데 동의합니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "16. 불만 및 분쟁 해결",
        "paragraphs": [
          "문제가 발생하면 원만한 해결을 위해 먼저 Eclipse IA 고객 지원에 문의하시기 바랍니다.",
          "불만 사항은 아래 버튼 또는 고객 계정을 통해 접수할 수 있습니다. 가능한 한 신속하게 요청을 처리하도록 노력하겠습니다.",
          "합의가 이루어지지 않거나 본 약관의 해석 또는 이행에 관한 분쟁이 발생하면 관할 법원은 관련 법률에 따라 결정됩니다."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "17. 문의",
        "paragraphs": [
          "본 약관, 구독, 크레딧 또는 서비스 이용에 관한 문의는 Eclipse IA 고객 지원에 연락해 주십시오."
        ],
        "bullets": [],
        "subsections": []
      }
    ]
  },
  "ja": {
    "back": "← スタジオに戻る",
    "title": "利用規約",
    "updated": "最終更新日：2026年9月8日 — Eclipse IA",
    "contactTitle": "お問い合わせ",
    "contactButton": "サポートに連絡",
    "recaptcha": "このサイトは reCAPTCHA によって保護されており、Google の",
    "privacy": "プライバシー ポリシー",
    "and": "および",
    "googleTerms": "利用規約",
    "applies": "が適用されます。",
    "footer": "© 2026 Eclipse IA — マルチモーダル・クリエイティブスタジオ。",
    "warning": "不正または明らかな悪用があった場合、アカウントが一時停止または終了されることがあります。",
    "sections": [
      {
        "title": "1. サービスの目的と運営者",
        "paragraphs": [
          "本利用規約（以下「本規約」）は、ウェブサイトおよび関連インターフェースから利用できる Eclipse IA プラットフォームの利用を定めます。",
          "Eclipse IA は、人工知能技術を用いてテキスト、画像、音声、動画コンテンツを生成・変換・処理できるマルチモーダル創作スタジオです。",
          "サービス運営者：Eclipse IA は、サイトの法的表示に記載された運営者によって運営されます。登録情報、連絡先、ホスティング事業者などの詳細は「法的表示」ページで確認できます。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "2. 利用資格と年齢要件",
        "paragraphs": [
          "Eclipse IA は、居住国で適用される年齢規則に従い、13歳以上の方を対象としています。",
          "適用法令がより高い最低年齢を定めている場合は、その年齢が優先されます。",
          "法律で求められる場合、未成年者は法定代理人の許可を得る必要があります。",
          "企業、団体、その他の組織を代表して利用する場合、その組織を代表する権限があることを保証するものとします。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "3. アカウントとセキュリティ",
        "paragraphs": [
          "ユーザーは、アカウントの作成および利用時に提供する情報の正確性に責任を負います。",
          "ユーザーはログイン情報を秘密に保ち、不正アクセスを防ぐために必要な措置を講じる責任があります。",
          "次の行為は禁止されています："
        ],
        "bullets": [
          "サービスの制限、規則、キャンペーンを回避するために複数のアカウントを作成すること;",
          "ログイン情報を共有、販売、貸与すること;",
          "第三者のアカウントまたは支払い方法を不正に使用すること;",
          "故意に虚偽または誤解を招く情報を提供すること。"
        ],
        "subsections": []
      },
      {
        "title": "4. サブスクリプション、ライトニングクレジット、ダイヤモンド",
        "paragraphs": [
          "Eclipse IA は、有料サブスクリプションおよび「ライトニングクレジット」「ダイヤモンド」と呼ばれる利用単位を提供する場合があります。"
        ],
        "bullets": [],
        "subsections": [
          {
            "title": "4.1 サブスクリプション",
            "paragraphs": [
              "サブスクリプションは申込時に表示された周期と料金で請求されます。",
              "別段の表示がない限り、各請求日に自動更新されます。"
            ]
          },
          {
            "title": "4.2 解約",
            "paragraphs": [
              "機能が提供されている場合、アカウント管理画面から解約できます。",
              "解約すると自動更新が停止します。別段の定めまたは規約違反による停止がない限り、支払済み期間の終了まで有料機能を利用できます。"
            ]
          },
          {
            "title": "4.3 ライトニングクレジット",
            "paragraphs": [
              "ライトニングクレジットは一部のサブスクリプションに付与される利用単位です。",
              "付与されたクレジットには申込時に表示された有効期限ルールが適用されます。別段の表示がない限り、期間終了後に自動繰越されません。"
            ]
          },
          {
            "title": "4.4 ダイヤモンド",
            "paragraphs": [
              "ダイヤモンドは個別購入または一部プランで提供される利用単位です。",
              "購入時に別段の表示がない限り、購入したダイヤモンドの有効期間は購入日から1年間です。",
              "クレジット等は電子マネー、銀行預金、金融商品ではなく、現金に換金できません。"
            ]
          }
        ]
      },
      {
        "title": "5. 支払い、生成失敗、返金",
        "paragraphs": [],
        "bullets": [],
        "subsections": [
          {
            "title": "5.1 支払い",
            "paragraphs": [
              "支払いは注文時に提示される方法で行われ、第三者の決済事業者によって処理される場合があります。",
              "ユーザーは、選択した支払い方法を利用する権限があることを保証します。"
            ]
          },
          {
            "title": "5.2 生成成功",
            "paragraphs": [
              "生成処理が正常に完了した場合、結果がユーザーの芸術的または主観的な期待に沿わなくても、対応する利用単位は消費済みとして扱われる場合があります。"
            ]
          },
          {
            "title": "⚠️ 生成結果",
            "paragraphs": [
              "AI技術は確率的であるため、生成結果は毎回異なることがあり、以前の依頼と同一である保証はありません。",
              "スタイル、外観、動き、芸術的表現、品質に対する主観的な不満だけでは、自動的な返金やクレジット復元の理由にはなりません。"
            ]
          },
          {
            "title": "5.3 技術的な生成失敗",
            "paragraphs": [
              "Eclipse IA に起因する技術エラーで生成に失敗し、クレジットが差し引かれた場合、消費単位を自動復元することがあります。",
              "無効なファイル、禁止コンテンツ、互換性のない設定、第三者事業者、モデル固有の制限によるエラーは、復元前に確認される場合があります。"
            ]
          },
          {
            "title": "5.4 返金",
            "paragraphs": [
              "ユーザーの気変わりや生成結果への不満のみを理由に、クレジットやサブスクリプションが自動返金されることはありません。ただし適用法令上の強行的な権利は妨げられません。",
              "この規定は、不適合、サービス障害、その他の法令上返金が必要な場合など、消費者の法的権利を制限しません。"
            ]
          },
          {
            "title": "5.5 撤回権",
            "paragraphs": [
              "適用法令が消費者に撤回権を認める場合、その条件は注文手続き中に提示されます。",
              "デジタルコンテンツやサービスの即時提供によって法律上撤回権を失う場合、適用法令に従って必要な同意と情報を取得します。"
            ]
          }
        ]
      },
      {
        "title": "6. AI 技術の仕組み",
        "paragraphs": [
          "Eclipse IA は生成AI技術を利用し、さまざまなモデルや技術提供事業者を組み込む場合があります。",
          "技術の確率的な性質上、過去の生成結果との一致、依頼内容への完全な適合、視覚・文章・音声・動画・概念上の誤りがないこと、すべてのモデルが常時利用可能であることは保証されません。",
          "提供事業者はモデルを一時的に停止、変更、置換、または提供終了する場合があります。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "7. ユーザーがアップロードしたコンテンツ",
        "paragraphs": [
          "ユーザーは Eclipse IA にアップロードした画像、動画、音声ファイル、文章などの権利を保持します。",
          "コンテンツをアップロードすることで、ユーザーは依頼された生成処理のために Eclipse IA および必要な技術提供事業者が処理できる権利、許可、ライセンスを有することを保証します。",
          "ユーザーは提供するコンテンツに責任を負い、違法な処理にあたるものや第三者の権利を侵害するものをアップロードしてはなりません。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "8. 生成コンテンツと知的財産",
        "paragraphs": [
          "適用法令で認められる範囲で、ユーザーはプランおよび本規約に従って Eclipse IA で生成したコンテンツを利用できます。",
          "生成コンテンツの利用が知的財産権、肖像権、人格権その他第三者の権利を侵害しないか確認する責任はユーザーにあります。",
          "複数のユーザーに類似または同一の結果が生成される場合があるため、Eclipse IA は結果の独自性や独占性を保証しません。",
          "ユーザーは、依頼された機能の提供に必要なコンテンツを Eclipse IA がホスティング、一時保存、処理することを許可します。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "9. 第三者のサービスとモデル",
        "paragraphs": [
          "一部の機能を提供するため、Eclipse IA は第三者企業のインフラ、API、AIモデル、ストレージまたは技術サービスを利用する場合があります。",
          "これらの事業者は、生成に必要なプロンプト、画像、動画、音声ファイルその他のデータを処理する場合があります。",
          "サービスの可用性、性能、制限、機能は Eclipse IA とは独立して変更される場合があります。",
          "Eclipse IA は運営、安全性、サービス改善のため、モデルや提供事業者へのアクセスを変更、置換、一時停止、または一時的に削除する場合があります。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "10. 利用制限",
        "paragraphs": [
          "Eclipse IA を次の目的で利用してはなりません："
        ],
        "bullets": [
          "違法なコンテンツの生成または配布;",
          "未成年者が関わる児童性的虐待コンテンツまたは性的コンテンツの生成;",
          "憎悪的なコンテンツ、暴力や違法な差別を助長するコンテンツの生成;",
          "知的財産権または第三者の権利の侵害;",
          "他人へのなりすまし、または肖像の不正利用;",
          "セキュリティシステムや技術的制限の回避;",
          "許可されていないスクレイピングや自動抽出;",
          "Eclipse IA の独自モデル、システム、仕組みのリバースエンジニアリングや抽出の試み;",
          "制限回避や意図的な過負荷を目的とするボット、スクリプト、自動化システムの使用。"
        ],
        "subsections": []
      },
      {
        "title": "11. 提供状況と中断",
        "paragraphs": [
          "Eclipse IA はサービスの可用性維持に努めますが、常時または中断なく利用できることを保証しません。",
          "保守、技術的障害、インフラ停止、第三者事業者の問題、サービスの更新・変更などにより、一時的に利用できなくなる場合があります。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "12. 保証と責任",
        "paragraphs": [
          "サービスは適用法令で認められる範囲で、利用時に説明された機能に従って提供されます。",
          "Eclipse IA は、ユーザーによる生成コンテンツの利用について責任を負いません。",
          "特に商用、広告、業務、芸術目的で利用する場合、生成コンテンツが用途に適しているか確認する責任はユーザーにあります。",
          "本規約のいかなる規定も、法律上排除または制限できない責任を排除または制限するものではありません。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "13. アカウントの停止と終了",
        "paragraphs": [
          "不正行為、安全上のリスク、明白な濫用または本規約違反のおそれがある場合、Eclipse IA はアカウントを一時停止または終了できます。",
          "状況が許す場合、Eclipse IA は停止または終了の理由をユーザーに通知することがあります。",
          "これらの措置によって、法律上保障されるユーザーの強行的な権利が失われることはありません。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "14. 規約の変更",
        "paragraphs": [
          "Eclipse IA は、サービス、使用技術、規制または事業慣行の変化を反映するため、本規約を変更する場合があります。",
          "重要な変更については、必要に応じてサービス内の通知や電子メールなど適切な方法でユーザーに知らせる場合があります。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "15. ユーザーの責任と補償",
        "paragraphs": [
          "ユーザーは、サービスの違法または濫用的な利用、およびアップロードまたは生成したコンテンツから生じる結果に責任を負います。",
          "適用法令で認められる範囲で、ユーザーは本規約違反または明らかに違法なサービス利用から直接生じた請求について、Eclipse IA を補償することに同意します。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "16. 苦情と紛争解決",
        "paragraphs": [
          "問題が生じた場合は、友好的な解決を図るため、まず Eclipse IA サポートにお問い合わせください。",
          "苦情は下のボタンまたはお客様のアカウントからお寄せください。できる限り速やかに対応するよう努めます。",
          "友好的な解決に至らない場合、または本規約の解釈・履行に関する紛争については、適用法令に従って管轄裁判所が決定されます。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "17. お問い合わせ",
        "paragraphs": [
          "本規約、サブスクリプション、クレジット、サービスの利用に関するお問い合わせは、Eclipse IA サポートまでご連絡ください。"
        ],
        "bullets": [],
        "subsections": []
      }
    ]
  },
  "zh": {
    "back": "← 返回工作室",
    "title": "使用条款",
    "updated": "最后更新：2026年9月8日 — Eclipse IA",
    "contactTitle": "联系",
    "contactButton": "联系客户支持",
    "recaptcha": "本网站受 reCAPTCHA 保护，并适用 Google 的",
    "privacy": "隐私权政策",
    "and": "和",
    "googleTerms": "服务条款",
    "applies": "。",
    "footer": "© 2026 Eclipse IA — 多模态创作工作室。",
    "warning": "如发现欺诈或明显滥用行为，账户可能会被暂停或终止。",
    "sections": [
      {
        "title": "1. 服务目的与运营方",
        "paragraphs": [
          "本使用条款（以下简称“条款”）规范用户对 Eclipse IA 平台的使用，该平台可通过网站及相关界面访问。",
          "Eclipse IA 是一款多模态创作工作室，使用人工智能技术生成、转换和处理文本、图像、音频及视频内容。",
          "服务运营方：Eclipse IA 由网站法律声明中所列的运营方运营。完整法律信息（注册信息、联系方式、托管服务商等）可在“法律声明”页面查看。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "2. 使用资格与年龄要求",
        "paragraphs": [
          "Eclipse IA 仅向年满 13 周岁的用户开放，并须遵守用户居住国适用的年龄规定。",
          "如果适用法律规定了更高的最低年龄，则以该年龄为准。",
          "法律要求时，未成年人必须取得其法定监护人的许可。",
          "如果您代表公司、协会或其他组织使用 Eclipse IA，则保证自己拥有代表该实体行事的必要权限。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "3. 账户与安全",
        "paragraphs": [
          "用户须对创建和使用账户时所提供信息的准确性负责。",
          "用户须对登录凭据保密，并采取必要措施防止他人未经授权访问账户。",
          "禁止以下行为："
        ],
        "bullets": [
          "创建多个账户以绕过服务限制、规则或促销条件；",
          "分享、出售或出租账户凭据；",
          "欺诈性使用他人的账户或支付方式；",
          "故意提供虚假或误导性信息。"
        ],
        "subsections": []
      },
      {
        "title": "4. 订阅、闪电点数与钻石",
        "paragraphs": [
          "Eclipse IA 可能提供付费订阅，以及称为“闪电点数”和“钻石”的使用单位。"
        ],
        "bullets": [],
        "subsections": [
          {
            "title": "4.1 订阅",
            "paragraphs": [
              "订阅按注册时显示的周期和价格收费。",
              "除非另有说明，订阅将在每个计费日自动续订。"
            ]
          },
          {
            "title": "4.2 取消订阅",
            "paragraphs": [
              "如账户管理界面提供相关功能，用户可在其中取消订阅。",
              "取消后将停止自动续订。除非另有规定或因违反本条款而暂停访问，否则付费功能可继续使用至已付款周期结束。"
            ]
          },
          {
            "title": "4.3 闪电点数",
            "paragraphs": [
              "闪电点数是部分订阅中提供的使用单位。",
              "订阅所含点数适用注册时显示的有效期规则。除非另有说明，一个订阅周期内的点数不会自动结转到下一周期。"
            ]
          },
          {
            "title": "4.4 钻石",
            "paragraphs": [
              "钻石是可单独购买或包含在部分方案中的使用单位。",
              "购买时未另行说明的，已购钻石自购买之日起有效期为一年。",
              "点数和使用单位不属于电子货币、银行存款或金融工具，不能兑换现金。"
            ]
          }
        ]
      },
      {
        "title": "5. 付款、生成失败与退款",
        "paragraphs": [],
        "bullets": [],
        "subsections": [
          {
            "title": "5.1 付款",
            "paragraphs": [
              "付款通过下单时提供的支付方式完成，也可能由第三方支付服务商处理。",
              "用户保证自己有权使用所选支付方式。"
            ]
          },
          {
            "title": "5.2 生成成功",
            "paragraphs": [
              "如果服务成功完成生成，即使结果未达到用户的艺术或主观预期，相应使用单位也可能被视为已消耗。"
            ]
          },
          {
            "title": "⚠️ 生成结果",
            "paragraphs": [
              "人工智能技术具有概率性，因此每次生成的结果可能不同，也不保证与之前的请求一致。",
              "仅因对风格、外观、动作、艺术效果或质量存在主观不满，并不自动构成退款或返还点数的理由。"
            ]
          },
          {
            "title": "5.3 技术性生成失败",
            "paragraphs": [
              "如果生成因可归责于 Eclipse IA 的技术错误而失败且点数已扣除，Eclipse IA 可以自动返还所消耗的点数。",
              "无效文件、违规内容、不兼容设置、第三方服务商或模型本身的限制所导致的错误，可能需要在返还点数前进行核查。"
            ]
          },
          {
            "title": "5.4 退款",
            "paragraphs": [
              "用户仅因改变主意或不喜欢生成结果，并不自动享有点数或订阅退款；适用法律规定的强制性权利除外。",
              "本条款不限制消费者依法享有的权利，包括因不符合约定、服务故障或法规规定的其他情形而依法必须退款的权利。"
            ]
          },
          {
            "title": "5.5 撤回权",
            "paragraphs": [
              "如果适用法律赋予消费者撤回权，相关条件将在下单过程中说明。",
              "如果立即提供数字内容或数字服务依法导致撤回权丧失，则会按照适用法律取得必要的同意并提供相关信息。"
            ]
          }
        ]
      },
      {
        "title": "6. 人工智能技术的工作方式",
        "paragraphs": [
          "Eclipse IA 使用生成式人工智能技术，并可能集成不同的模型或技术服务商。",
          "由于此类技术具有概率性，Eclipse IA 不保证生成结果与之前完全相同、准确满足请求、没有图像、文本、音频、视频或概念方面的错误，也不保证每种模型始终可用。",
          "服务商可能暂时停用、修改、替换或停止提供某些模型。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "7. 用户上传的内容",
        "paragraphs": [
          "用户保留其上传到 Eclipse IA 的图像、视频、音频文件、文本及其他材料的权利。",
          "上传内容即表示用户保证拥有必要的权利、许可和授权，使 Eclipse IA 及完成所请求生成所需的技术服务商能够处理该内容。",
          "用户须对提交的内容负责，不得上传处理后会违法或侵犯第三方权利的内容。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "8. 生成内容与知识产权",
        "paragraphs": [
          "在适用法律允许的范围内，用户可按照所选方案及本条款使用通过 Eclipse IA 生成的内容。",
          "用户有责任确认对生成内容的使用不会侵犯知识产权、肖像权、人格权或第三方的其他权利。",
          "不同用户可能获得相似或相同的结果，因此 Eclipse IA 不保证生成结果具有独创性或排他性。",
          "用户授权 Eclipse IA 托管、临时存储和处理提供所请求功能所必需的内容。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "9. 第三方服务与模型",
        "paragraphs": [
          "为提供部分功能，Eclipse IA 可能使用第三方公司提供的基础设施、API、AI 模型、存储或技术服务。",
          "这些服务商可能处理生成所需的提示词、图像、视频、音频文件或其他数据。",
          "这些服务的可用性、性能、限制和功能可能独立于 Eclipse IA 发生变化。",
          "为保障服务运行、安全或升级，Eclipse IA 可能修改、替换、暂停或暂时移除对某个模型或服务商的访问。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "10. 使用限制",
        "paragraphs": [
          "禁止将 Eclipse IA 用于以下目的："
        ],
        "bullets": [
          "生成或传播非法内容；",
          "生成涉及未成年人的儿童性虐待材料或色情内容；",
          "生成仇恨内容或旨在煽动暴力、非法歧视的内容；",
          "侵犯知识产权或第三方权利；",
          "冒充他人或不当使用他人的肖像；",
          "绕过安全系统或服务的技术限制；",
          "未经授权进行网页抓取或自动化提取；",
          "对 Eclipse IA 的专有模型、系统或机制进行逆向工程或试图提取；",
          "使用机器人、脚本或自动化系统规避限制或故意使基础设施过载。"
        ],
        "subsections": []
      },
      {
        "title": "11. 服务可用性与中断",
        "paragraphs": [
          "Eclipse IA 会努力维持服务可用，但不保证服务永久可用或持续不中断。",
          "维护、技术故障、基础设施中断、第三方服务商问题或服务更新和变更都可能导致服务暂时不可用。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "12. 保证与责任",
        "paragraphs": [
          "服务将在适用法律允许的范围内，按照使用时说明的功能提供。",
          "Eclipse IA 不对用户如何使用生成内容承担责任。",
          "用户须自行确认生成内容是否适合预期用途，尤其是在商业、广告、专业或艺术场景中。",
          "本条款不排除或限制法律规定不得排除或限制的责任。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "13. 暂停与终止",
        "paragraphs": [
          "如果使用行为涉及欺诈、安全风险、明显滥用或违反本条款，Eclipse IA 可以暂时暂停或终止账户。",
          "在情况允许时，Eclipse IA 可以告知用户暂停或终止的原因。",
          "采取这些措施不会剥夺用户依法享有的强制性权利。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "14. 条款变更",
        "paragraphs": [
          "Eclipse IA 可以根据服务、所用技术、法规或商业实践的变化更新本条款。",
          "如有重大变更，Eclipse IA 可在必要时通过服务内通知、电子邮件或其他适当方式告知用户。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "15. 用户责任与赔偿",
        "paragraphs": [
          "用户须对因非法或滥用服务，以及上传或生成内容而产生的后果负责。",
          "在适用法律允许的范围内，用户同意就因违反本条款或明显非法使用服务而直接产生的索赔向 Eclipse IA 作出赔偿。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "16. 投诉与争议解决",
        "paragraphs": [
          "如遇问题，建议用户首先联系 Eclipse IA 客服，以寻求友好解决方案。",
          "如需投诉，可使用下方按钮或通过客户账户联系我们。我们将尽力尽快处理您的请求。",
          "如无法友好解决，或发生与本条款解释或履行有关的争议，则根据适用法律确定有管辖权的法院。"
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "17. 联系方式",
        "paragraphs": [
          "如对本条款、订阅、点数或服务使用有任何疑问，请联系 Eclipse IA 客服。"
        ],
        "bullets": [],
        "subsections": []
      }
    ]
  },
  "fr": {
    "back": "← Retour au Studio",
    "title": "Conditions Générales d’Utilisation",
    "updated": "Dernière mise à jour : 8 septembre 2026 — Eclipse IA",
    "sections": [
      {
        "title": "1. Objet et Éditeur du Service",
        "paragraphs": [
          "Les présentes Conditions Générales d’Utilisation (« CGU ») régissent l’utilisation de la plateforme Eclipse IA, accessible depuis son site internet et ses interfaces associées.",
          "Eclipse IA est un studio de création multimodale permettant notamment de générer, transformer et traiter des contenus textuels, visuels, audio et vidéo à l’aide de technologies d’intelligence artificielle.",
          "Éditeur du service : Eclipse IA est exploité par l’éditeur identifié dans les Mentions légales du site. Les informations légales complètes (identifiants, coordonnées, hébergeur, etc.) sont disponibles sur la page « Mentions légales »."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "2. Conditions d’Éligibilité et d’Âge",
        "paragraphs": [
          "L’utilisation d’Eclipse IA est réservée aux personnes âgées de 13 ans ou plus, sous réserve des règles d’âge applicables dans leur pays de résidence.",
          "Lorsque la législation applicable impose un âge minimum supérieur, cet âge minimum prévaut.",
          "Les utilisateurs mineurs doivent disposer, lorsque la loi l’exige, de l’autorisation de leur représentant légal.",
          "Si vous utilisez Eclipse IA au nom d’une entreprise, d’une association ou de toute autre organisation, vous garantissez disposer des pouvoirs nécessaires pour agir au nom de cette entité."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "3. Compte et Sécurité",
        "paragraphs": [
          "L’utilisateur est responsable de l’exactitude des informations fournies lors de la création et de l’utilisation de son compte.",
          "L’utilisateur est responsable de la confidentialité de ses identifiants et doit prendre les mesures nécessaires pour empêcher tout accès non autorisé à son compte.",
          "Il est interdit de :"
        ],
        "bullets": [
          "créer plusieurs comptes afin de contourner les limitations, restrictions ou promotions du service ;",
          "partager, vendre ou louer ses identifiants ;",
          "utiliser frauduleusement le compte ou les moyens de paiement d’un tiers ;",
          "fournir volontairement des informations fausses ou trompeuses."
        ],
        "subsections": []
      },
      {
        "title": "4. Abonnements, Éclairs et Diamants",
        "paragraphs": [
          "Eclipse IA peut proposer différents abonnements payants ainsi que des unités de consommation appelées « Éclairs » et « Diamants »."
        ],
        "bullets": [],
        "subsections": [
          {
            "title": "4.1 Abonnements",
            "paragraphs": [
              "Les abonnements sont facturés selon la périodicité et le tarif indiqués lors de la souscription.",
              "Sauf indication contraire, les abonnements sont renouvelés automatiquement à chaque échéance."
            ]
          },
          {
            "title": "4.2 Résiliation",
            "paragraphs": [
              "L’utilisateur peut résilier son abonnement depuis l’interface de gestion de son compte lorsque cette fonctionnalité est disponible.",
              "La résiliation empêche le renouvellement automatique. Sauf disposition contraire ou suspension pour violation des présentes conditions, l’accès aux fonctionnalités payantes reste disponible jusqu’à la fin de la période déjà payée."
            ]
          },
          {
            "title": "4.3 Éclairs",
            "paragraphs": [
              "Les Éclairs sont des unités de consommation attribuées dans le cadre de certains abonnements.",
              "Les Éclairs inclus dans un abonnement sont soumis aux règles de validité affichées au moment de la souscription. Sauf indication contraire, ils ne sont pas automatiquement reportés à la période suivante."
            ]
          },
          {
            "title": "4.4 Diamants",
            "paragraphs": [
              "Les Diamants sont des unités de consommation pouvant être achetées séparément ou proposées dans certaines offres.",
              "Sauf indication contraire affichée lors de l’achat, les Diamants achetés sont valables un an à compter de leur date d’achat.",
              "Les crédits et unités de consommation ne constituent pas de la monnaie électronique, un compte bancaire ou un instrument financier et ne peuvent être convertis en espèces."
            ]
          }
        ]
      },
      {
        "title": "5. Paiements, Échecs de Génération et Remboursements",
        "paragraphs": [],
        "bullets": [],
        "subsections": [
          {
            "title": "5.1 Paiement",
            "paragraphs": [
              "Les paiements sont effectués via les moyens proposés lors de la commande et peuvent être traités par des prestataires de paiement tiers.",
              "L’utilisateur garantit être autorisé à utiliser le moyen de paiement sélectionné."
            ]
          },
          {
            "title": "5.2 Génération réussie",
            "paragraphs": [
              "Lorsqu’une génération est correctement exécutée par le service, les unités correspondant à cette génération peuvent être considérées comme utilisées, même si le résultat ne correspond pas aux attentes artistiques ou subjectives de l’utilisateur."
            ]
          },
          {
            "title": "⚠️ Résultats génératifs",
            "paragraphs": [
              "Les technologies d’intelligence artificielle sont probabilistes. Les résultats peuvent varier d’une génération à l’autre et ne sont pas garantis comme identiques à une demande précédente.",
              "Une insatisfaction subjective concernant le style, l’apparence, le mouvement, le rendu artistique ou la qualité d’un résultat ne constitue pas, à elle seule, un motif automatique de remboursement ou de recrédit."
            ]
          },
          {
            "title": "5.3 Génération échouée techniquement",
            "paragraphs": [
              "Lorsqu’une génération échoue en raison d’une erreur technique imputable à Eclipse IA et que les crédits ont été débités, Eclipse IA peut procéder au recrédit automatique des unités consommées.",
              "Les erreurs provenant notamment d’un fichier invalide, d’un contenu interdit, d’un paramètre incompatible, d’un fournisseur tiers ou d’une limitation propre à un modèle peuvent faire l’objet d’une vérification avant tout recrédit."
            ]
          },
          {
            "title": "5.4 Remboursements",
            "paragraphs": [
              "Les achats de crédits et abonnements ne donnent pas automatiquement droit à un remboursement du seul fait que l’utilisateur change d’avis ou n’apprécie pas le résultat généré, sous réserve des droits impératifs prévus par la législation applicable.",
              "Cette disposition ne limite pas les droits légaux du consommateur, notamment lorsqu’un remboursement est obligatoire en raison d’un défaut de conformité, d’une défaillance du service ou d’une autre situation prévue par la réglementation applicable."
            ]
          },
          {
            "title": "5.5 Droit de rétractation",
            "paragraphs": [
              "Lorsque la législation applicable accorde au consommateur un droit de rétractation, les conditions relatives à ce droit sont présentées lors du processus de commande.",
              "Lorsque l’exécution immédiate d’un contenu ou service numérique entraîne légalement la perte du droit de rétractation, le consentement et les informations nécessaires sont recueillis conformément aux exigences légales applicables."
            ]
          }
        ]
      },
      {
        "title": "6. Fonctionnement des Technologies d’Intelligence Artificielle",
        "paragraphs": [
          "Eclipse IA utilise des technologies d’intelligence artificielle générative et peut intégrer différents modèles ou fournisseurs techniques.",
          "En raison de la nature probabiliste de ces technologies, Eclipse IA ne garantit pas qu’un résultat sera identique à une génération précédente, correspondra exactement à la demande, sera exempt d’erreurs visuelles, textuelles, audio, vidéo ou conceptuelles, ou sera disponible avec chaque modèle à tout moment.",
          "Certains modèles peuvent être temporairement indisponibles, modifiés, remplacés ou retirés par leurs fournisseurs."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "7. Contenus Importés par l’Utilisateur",
        "paragraphs": [
          "L’utilisateur conserve ses droits sur les images, vidéos, fichiers audio, textes et autres éléments qu’il importe dans Eclipse IA.",
          "En important un contenu, l’utilisateur garantit disposer des droits, autorisations et licences nécessaires pour permettre son traitement par Eclipse IA et les prestataires techniques nécessaires à l’exécution de la génération demandée.",
          "L’utilisateur reste responsable des contenus qu’il fournit au service et ne doit notamment pas importer de contenu dont le traitement serait contraire à la loi ou porterait atteinte aux droits de tiers."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "8. Contenus Générés et Propriété Intellectuelle",
        "paragraphs": [
          "Dans la mesure permise par la législation applicable, l’utilisateur peut utiliser les contenus générés via Eclipse IA conformément à son offre et aux présentes conditions.",
          "L’utilisateur demeure responsable de vérifier que l’utilisation d’un contenu généré ne porte pas atteinte aux droits de propriété intellectuelle, au droit à l’image, aux droits de la personnalité ou à tout autre droit d’un tiers.",
          "Des résultats similaires ou identiques peuvent être générés pour différents utilisateurs. Eclipse IA ne garantit donc pas l’exclusivité ou l’unicité d’un résultat généré.",
          "L’utilisateur autorise Eclipse IA à héberger, stocker temporairement et traiter les contenus nécessaires à l’exécution des fonctionnalités demandées."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "9. Services et Modèles de Fournisseurs Tiers",
        "paragraphs": [
          "Pour fournir certaines fonctionnalités, Eclipse IA peut utiliser des infrastructures, API, modèles d’intelligence artificielle, services de stockage ou services techniques fournis par des sociétés tierces.",
          "Ces fournisseurs peuvent intervenir dans le traitement des prompts, images, vidéos, fichiers audio ou autres données nécessaires à une génération.",
          "La disponibilité, les performances, les limitations et les caractéristiques de ces services peuvent évoluer indépendamment d’Eclipse IA.",
          "Eclipse IA peut modifier, remplacer, suspendre ou supprimer temporairement l’accès à un modèle ou à un fournisseur lorsque cela est nécessaire au fonctionnement, à la sécurité ou à l’évolution du service."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "10. Restrictions d’Utilisation",
        "paragraphs": [
          "Il est interdit d’utiliser Eclipse IA pour :"
        ],
        "bullets": [
          "générer ou diffuser du contenu illégal ;",
          "générer du contenu pédopornographique ou sexuel impliquant des mineurs ;",
          "générer du contenu haineux ou destiné à encourager la violence ou la discrimination illégale ;",
          "porter atteinte aux droits de propriété intellectuelle ou aux droits de tiers ;",
          "usurper l’identité d’une personne ou utiliser frauduleusement son image ;",
          "contourner les systèmes de sécurité ou les limites techniques du service ;",
          "effectuer du scraping ou de l’extraction automatisée non autorisée ;",
          "rétro-concevoir ou tenter d’extraire les modèles, systèmes ou mécanismes propriétaires d’Eclipse IA ;",
          "utiliser des bots, scripts ou systèmes automatisés pour contourner les limitations ou surcharger volontairement l’infrastructure."
        ],
        "subsections": []
      },
      {
        "title": "11. Disponibilité et Interruptions",
        "paragraphs": [
          "Eclipse IA s’efforce de maintenir le service disponible, mais ne garantit pas une disponibilité permanente ou ininterrompue.",
          "Le service peut être temporairement indisponible en raison de maintenances, d’incidents techniques, de pannes d’infrastructure, de problèmes affectant un fournisseur tiers ou de mises à jour et évolutions du service."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "12. Garanties et Responsabilité",
        "paragraphs": [
          "Le service est fourni dans la mesure permise par la loi applicable et selon les caractéristiques présentées lors de son utilisation.",
          "Eclipse IA ne saurait être tenue responsable de l’utilisation faite par l’utilisateur des contenus générés.",
          "L’utilisateur est seul responsable de vérifier l’adéquation d’un contenu généré à son usage prévu, notamment dans un contexte commercial, publicitaire, professionnel ou artistique.",
          "Aucune disposition des présentes conditions n’a pour objet d’exclure ou de limiter une responsabilité qui ne peut légalement être exclue ou limitée."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "13. Suspension et Résiliation",
        "paragraphs": [
          "Eclipse IA peut suspendre temporairement ou résilier un compte lorsqu’une utilisation présente un risque de fraude, de sécurité, d’abus manifeste ou de violation des présentes conditions.",
          "Lorsque les circonstances le permettent, Eclipse IA peut informer l’utilisateur du motif de la suspension ou de la résiliation.",
          "Les mesures prises ne privent pas l’utilisateur des droits impératifs qui lui sont accordés par la loi."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "14. Modification des Conditions",
        "paragraphs": [
          "Eclipse IA peut faire évoluer les présentes conditions afin de tenir compte de l’évolution du service, des technologies utilisées, de la réglementation ou de ses pratiques commerciales.",
          "En cas de modification substantielle, Eclipse IA peut en informer les utilisateurs par tout moyen approprié, notamment par l’intermédiaire du service ou par courrier électronique lorsque cela est nécessaire."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "15. Responsabilité de l’Utilisateur",
        "paragraphs": [
          "L’utilisateur est responsable des conséquences résultant de l’utilisation illégale ou abusive du service et des contenus qu’il importe ou génère.",
          "Lorsque la loi applicable le permet, l’utilisateur s’engage à indemniser Eclipse IA contre les réclamations résultant directement d’une violation des présentes conditions ou d’une utilisation manifestement illégale du service."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "16. Réclamations et Résolution des Litiges",
        "paragraphs": [
          "En cas de difficulté, l’utilisateur est invité à contacter en premier lieu le support Eclipse IA afin de rechercher une solution amiable.",
          "Pour toute réclamation, vous pouvez joindre notre équipe via le bouton de contact ci-dessous ou depuis votre espace client. Nous nous efforcerons de traiter votre demande dans les meilleurs délais.",
          "En l’absence de solution amiable ou pour tout litige relatif à l’interprétation ou à l’exécution des présentes conditions, les tribunaux compétents seront déterminés selon les règles légales applicables."
        ],
        "bullets": [],
        "subsections": []
      },
      {
        "title": "17. Contact",
        "paragraphs": [
          "Pour toute question concernant les présentes conditions, votre abonnement, vos crédits ou l’utilisation du service, contactez le support Eclipse IA."
        ],
        "bullets": [],
        "subsections": []
      }
    ],
    "contactTitle": "Contact",
    "contactButton": "Contacter le support",
    "recaptcha": "Ce site est protégé par reCAPTCHA et les",
    "privacy": "Règles de confidentialité",
    "and": "et",
    "googleTerms": "Conditions d’utilisation",
    "applies": "de Google s’appliquent.",
    "footer": "© 2026 Eclipse IA — Studio de Création Multimodale.",
    "warning": "Toute utilisation frauduleuse ou manifestement abusive peut entraîner la suspension ou la résiliation du compte."
  }
};

const getLanguage = (language) => {
  const code = String(language || 'fr').toLowerCase().split('-')[0];
  return TERMS[code] ? code : 'fr';
};

const TermsPage = ({ onBack, onContactClick }) => {
  const { i18n } = useTranslation();
  const lang = getLanguage(i18n.resolvedLanguage || i18n.language);
  const content = TERMS[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-wrapper">
      <div className="terms-container">
        <button onClick={onBack} className="btn-back">{content.back}</button>
        <header className="terms-header">
          <h1>{content.title}</h1>
          <p>{content.updated}</p>
        </header>
        <div className="terms-content">
          {content.sections.map((section, index) => (
            <section key={section.title} className={index === 3 || index === 4 ? 'section-critical' : 'terms-section'}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph, i) => (
                <p key={`p-${i}`}>{paragraph}</p>
              ))}
              {section.bullets?.length > 0 && (
                <ul>{section.bullets.map((item, i) => <li key={`li-${i}`}>{item}</li>)}</ul>
              )}
              {section.subsections?.map((sub, i) => (
                <div key={`sub-${i}`} className={sub.title.startsWith('⚠️') ? 'alert-box' : undefined}>
                  {sub.title.startsWith('⚠️') ? <p className="alert-title">{sub.title}</p> : <h3>{sub.title}</h3>}
                  {sub.paragraphs.map((paragraph, j) => <p key={`sub-p-${j}`}>{paragraph}</p>)}
                </div>
              ))}
              {index === 9 && <p style={{ marginTop: '10px', fontSize: '0.95em', color: '#ff6b6b' }}><em>{content.warning}</em></p>}
            </section>
          ))}
          <section className="contact-box">
            <h2>{content.contactTitle}</h2>
            <p>{lang === 'fr' ? TERMS.fr.sections[16].paragraphs[0] : content.sections[16].paragraphs[0]}</p>
            <button onClick={onContactClick} className="btn-contact-support" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{content.contactButton}</button>
          </section>
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '30px', padding: '0 20px' }}>
            {content.recaptcha}{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', marginLeft: '4px' }}>{content.privacy}</a>{' '}
            {content.and}{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', marginLeft: '4px' }}>{content.googleTerms}</a>{' '}
            {content.applies}
          </div>
        </div>
        <footer className="terms-footer">{content.footer}</footer>
      </div>
    </div>
  );
};

export default TermsPage;
