from pathlib import Path
import sys

# Run from the React project's root folder. Makes targeted, idempotent edits only.
path = Path('Pricing.jsx')
if not path.exists():
    print('ERREUR : Pricing.jsx introuvable. Lance ce script depuis le dossier qui contient Pricing.jsx.')
    sys.exit(1)
s = path.read_text(encoding='utf-8')
original = s

# Make the active locale available to number formatters. One declaration is enough
# when Pricing.jsx keeps its pricing UI inside a single React component.
needle = "const { t } = useTranslation();"
count = s.count(needle)
if count < 1:
    print(f'ERREUR : aucune déclaration exacte useTranslation trouvée ({count}). Aucun changement effectué.')
    sys.exit(2)
s = s.replace(needle, "const { t, i18n } = useTranslation();", 1)

# Translate pack names through i18next instead of hard-coding French labels.
repls = {
"{ name: 'Étincelle', qty: 1000, priceFull: 5.99, priceSub: 2.99 }": "{ name: t('diamond pack spark'), qty: 1000, priceFull: 5.99, priceSub: 2.99 }",
"{ name: 'Supernova', qty: 3000, priceFull: 14.99, priceSub: 7.99 }": "{ name: t('diamond pack supernova'), qty: 3000, priceFull: 14.99, priceSub: 7.99 }",
"{ name: 'Galaxie', qty: 6000, priceFull: 24.99, priceSub: 12.99, featured: true }": "{ name: t('diamond pack galaxy'), qty: 6000, priceFull: 24.99, priceSub: 12.99, featured: true }",
"{ name: 'Pulsar', qty: 15000, priceFull: 49.99, priceSub: 29.99 }": "{ name: t('diamond pack pulsar'), qty: 15000, priceFull: 49.99, priceSub: 29.99 }",
"{ name: 'Quasar', qty: 30000, priceFull: 89.99, priceSub: 54.99 }": "{ name: t('diamond pack quasar'), qty: 30000, priceFull: 89.99, priceSub: 54.99 }",
"{ name: 'Univers', qty: 60000, priceFull: 149.99, priceSub: 99.99, bestValue: true }": "{ name: t('diamond pack universe'), qty: 60000, priceFull: 149.99, priceSub: 99.99, bestValue: true }",
"{qty.toLocaleString()}": "{qty.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')}",
"{pack.qty.toLocaleString()}": "{pack.qty.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')}",
"{estimate.toLocaleString('fr-FR')}€": "{estimate.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')}€",
}
for old,new in repls.items():
    if old not in s:
        print('ERREUR : texte source non trouvé :', old)
        print('Aucun changement enregistré.')
        sys.exit(3)
    s=s.replace(old,new,1)
if s == original:
    print('Aucune modification nécessaire.')
else:
    backup = path.with_suffix('.jsx.before_i18n.bak')
    if not backup.exists():
        backup.write_text(original,encoding='utf-8')
    path.write_text(s,encoding='utf-8')
    print('Pricing.jsx mis à jour. Sauvegarde :', backup.name)
    print('Noms de packs localisés et formats numériques liés à la langue active.')
