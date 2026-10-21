from pathlib import Path
import re, json, shutil, sys
ROOT = Path(__file__).resolve().parent
I18N = ROOT / "i18n.js"
COMPONENT = ROOT / "ContactModal.jsx"
LANGS = {
  "fr": {"successTitle":"Message envoyé !","successMessage":"Merci {{name}}, nous avons bien reçu votre demande.","replySoon":"Nous vous répondrons bientôt.","title":"Nous contacter","subjectLabel":"Objet de votre demande","subjectInfo":"Renseignement","subjectProblem":"Signaler un problème","subjectQuote":"Demande de devis","messageLabel":"Votre message","messagePlaceholder":"Comment pouvons-nous vous aider ?","back":"Retour","sending":"Envoi...","send":"Envoyer","sendError":"L’envoi a échoué. Veuillez réessayer."},
  "en": {"successTitle":"Message sent!","successMessage":"Thank you {{name}}, we have received your request.","replySoon":"We will get back to you soon.","title":"Contact us","subjectLabel":"Subject of your request","subjectInfo":"General inquiry","subjectProblem":"Report a problem","subjectQuote":"Request a quote","messageLabel":"Your message","messagePlaceholder":"How can we help you?","back":"Back","sending":"Sending...","send":"Send","sendError":"Sending failed. Please try again."},
  "ko": {"successTitle":"메시지가 전송되었습니다!","successMessage":"{{name}}님, 문의가 접수되었습니다. 감사합니다.","replySoon":"빠른 시일 내에 답변드리겠습니다.","title":"문의하기","subjectLabel":"문의 유형","subjectInfo":"일반 문의","subjectProblem":"문제 신고","subjectQuote":"견적 요청","messageLabel":"메시지","messagePlaceholder":"무엇을 도와드릴까요?","back":"뒤로","sending":"전송 중...","send":"보내기","sendError":"전송에 실패했습니다. 다시 시도해 주세요."},
  "ja": {"successTitle":"メッセージを送信しました！","successMessage":"{{name}}様、お問い合わせを受け付けました。","replySoon":"近日中にご返信いたします。","title":"お問い合わせ","subjectLabel":"お問い合わせの種類","subjectInfo":"一般的なお問い合わせ","subjectProblem":"問題を報告する","subjectQuote":"見積もりを依頼する","messageLabel":"メッセージ","messagePlaceholder":"どのようなご用件でしょうか？","back":"戻る","sending":"送信中...","send":"送信","sendError":"送信に失敗しました。もう一度お試しください。"},
  "zh": {"successTitle":"消息已发送！","successMessage":"感谢您，{{name}}，我们已收到您的请求。","replySoon":"我们会尽快回复您。","title":"联系我们","subjectLabel":"咨询主题","subjectInfo":"一般咨询","subjectProblem":"报告问题","subjectQuote":"申请报价","messageLabel":"您的消息","messagePlaceholder":"我们能为您提供什么帮助？","back":"返回","sending":"发送中...","send":"发送","sendError":"发送失败，请重试。"}
}
def main():
    if not I18N.exists() or not COMPONENT.exists():
        raise SystemExit("ERREUR : placez ce script à côté de i18n.js et ContactModal.jsx (dossier client/src).")
    original = I18N.read_text(encoding="utf-8")
    updated = original
    # Locate locale sections by their top-level locale declarations.
    locale_names = ["fr", "en", "ko", "ja", "zh"]
    starts = {}
    for lang in locale_names:
        m = re.search(r'(?m)^\s{2}"' + lang + r'"\s*:\s*\{', updated)
        if not m:
            raise SystemExit(f"ERREUR : bloc de langue {lang} introuvable; aucun fichier modifié.")
        starts[lang] = m.start()
    for i, lang in enumerate(locale_names):
        start = starts[lang]
        end = starts[locale_names[i+1]] if i+1 < len(locale_names) else len(updated)
        block = updated[start:end]
        if re.search(r'"contact"\s*:', block):
            raise SystemExit(f'ERREUR : un objet "contact" existe déjà dans {lang}. Fusionnez les clés manuellement; aucun fichier modifié.')
        # Insert into translation object before its first top-level key "tools" or "hero prompt 1".
        marker = re.search(r'(?m)^(\s{6})"(?:tools|hero prompt 1)"\s*:', block)
        if not marker:
            raise SystemExit(f'ERREUR : point d’insertion introuvable pour {lang}; aucun fichier modifié.')
        indent = marker.group(1)
        obj = indent + '"contact": {\n'
        entries = list(LANGS[lang].items())
        for j, (key, value) in enumerate(entries):
            comma = ',' if j < len(entries)-1 else ''
            obj += indent + '  ' + json.dumps(key, ensure_ascii=False) + ': ' + json.dumps(value, ensure_ascii=False) + comma + '\n'
        obj += indent + '},\n'
        block = block[:marker.start()] + obj + block[marker.start():]
        # update later offsets are avoided by rebuilding subsequent blocks below
        updated = updated[:start] + block + updated[end:]
        # Recompute all starts after this insertion
        starts = {}
        for l in locale_names:
            mm = re.search(r'(?m)^\s{2}"' + l + r'"\s*:\s*\{', updated)
            starts[l] = mm.start() if mm else -1
    if updated == original:
        raise SystemExit("Aucune modification nécessaire.")
    backup = I18N.with_suffix(".js.bak_contact_translation")
    if backup.exists():
        backup = I18N.with_name("i18n.js.bak_contact_translation_2")
    shutil.copy2(I18N, backup)
    I18N.write_text(updated, encoding="utf-8")
    print(f"Traductions ajoutées dans i18n.js. Sauvegarde : {backup.name}")
    print("ContactModal.jsx est prêt; vérifiez-le puis testez les cinq langues.")
if __name__ == "__main__":
    main()
