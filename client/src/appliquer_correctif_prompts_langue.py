from pathlib import Path
import json, re, shutil
APP=Path('App.jsx'); I18N=Path('i18n.js')
P={
'en':[
'Futuristic cyberpunk Central Park, neon lights, cinematic lighting, 8K, ultra-detailed.','Sniper in snow camouflage lying in deep snow in high mountains; extreme realism, ground-level angle, rifle in sharp focus, harsh winter mood.','A crab on a rock watching the sunset over a beach; the beach is slightly out of focus.','Ultra-realistic action scene: a blue-haired female tactical fighter lands in urban ruins, focused piercing gaze, jacket flowing in the air.','Cinematic anime illustration of a full-body female antagonist in a luxurious modern penthouse office at night, aiming a pistol toward the viewer; dramatic lighting and tense mood.','Anime-style young woman with long wavy blonde hair and golden eyes, sitting on a green wooden park bench; green jacket, bandage, soft natural light, detailed linework.','Traditional Asian temple with illuminated pagodas beside a still lake reflecting the scene, enormous full moon, mystical night, intricate architecture, cinematic lighting.','Monumental royal throne in red velvet and carved gold, heraldic motifs and lion statues; a majestic rat sleeps peacefully on it, detailed 3D render.','Japanese samurai in profile on the right, determined gaze toward the horizon, black topknot, light beard and kimono; cinematic underwater light and particles.','Terrified woman running through a dense dark forest, thick fog, dead trees and broken branches, horror-thriller mood, flashlight and cinematic shadows.','Blonde woman confidently sitting on a cream 1960s vintage car hood, dramatic low angle, elegant green jumpsuit, editorial fashion photography.','Add a dark charcoal coat and long forest-green pleated skirt to the photo. She stands on a paved path with one hand in the coat pocket; preserve identity and natural lighting.','Ultra-realistic beauty portrait of a blonde woman with green eyes, intense gaze, natural freckles, glossy burgundy lips and professional makeup; premium studio lighting.','High-quality watercolor logo of a powerful colorful fox head viewed from the front, monochrome background, vivid colors, refined illustration by Yukisakura.','Dystopian cyberpunk future: a petite young Korean woman with a fragile appearance walks through a small cyberpunk town; short hair, futuristic clothes, neon signs, rainy cinematic night.'],
'ko':[
'네온과 영화 같은 조명, 8K 초고해상도 디테일의 미래형 사이버펑크 센트럴 파크.','눈 위장복을 입은 저격수가 고산의 깊은 눈에 엎드려 있다. 극사실적 표현, 낮은 시점, 선명한 소총, 혹독한 겨울 분위기.','바위 위의 게가 해변 너머로 지는 해를 바라본다. 해변은 살짝 흐리게 처리한다.','초현실적으로 사실적인 액션 장면: 파란 머리의 여성 전술 요원이 도시 폐허에 착지하고 재킷이 바람에 휘날린다.','영화 같은 애니메이션 일러스트. 밤의 고급 펜트하우스 사무실에서 여성 악역이 관객을 향해 권총을 겨눈다. 극적인 조명과 긴장감.','긴 물결 금발과 황금빛 눈을 가진 젊은 여성이 초록색 공원 벤치에 앉아 있다. 초록 재킷, 붕대, 부드러운 자연광, 섬세한 선화.','잔잔한 호수에 비친 불탑이 빛나는 전통 아시아 사원, 거대한 보름달, 신비로운 밤, 정교한 건축과 영화 같은 조명.','붉은 벨벳과 금색 조각, 문장 무늬와 사자상으로 장식된 왕좌. 위엄 있는 쥐가 평화롭게 잠들어 있는 정교한 3D 렌더링.','화면 오른쪽의 일본 사무라이가 지평선을 결연하게 바라본다. 전통 상투, 검은 머리, 옅은 수염, 기모노, 영화 같은 수중 빛과 입자.','짙은 안개와 죽은 나무가 있는 어두운 숲에서 겁에 질린 여성이 달린다. 공포 스릴러 분위기, 손전등과 영화 같은 그림자.','1960년대 크림색 클래식 자동차 보닛에 앉은 금발 여성. 극적인 로우 앵글, 세련된 녹색 점프수트, 패션 화보 사진.','사진에 짙은 차콜색 코트와 긴 숲 녹색 플리츠스커트를 추가한다. 여성은 포장된 길에 서서 한 손을 주머니에 넣는다. 인물과 자연광을 유지한다.','초현실적인 뷰티 인물 사진. 초록 눈의 금발 여성, 강렬한 시선, 자연스러운 주근깨, 버건디색 입술, 전문 메이크업과 스튜디오 조명.','정면을 바라보는 강렬하고 다채로운 여우 머리의 고품질 수채화 로고, 단색 배경, 생생한 색상, Yukisakura 스타일.','디스토피아 사이버펑크 미래, 작고 연약한 젊은 한국 여성이 작은 사이버펑크 도시를 걷는다. 짧은 머리, 미래적 의상, 네온, 비 오는 밤.'],
'ja':[
'ネオンと映画的な照明、8Kの超精細描写による未来的なサイバーパンク版セントラルパーク。','雪迷彩の狙撃手が高山の深い雪に伏せている。極めてリアルな描写、低い視点、銃にシャープな焦点、厳しい冬の雰囲気。','岩の上のカニが浜辺の夕日を眺めている。浜辺は少しぼかして表現。','超リアルなアクション。青い髪の女性戦術隊員が都市の廃墟に着地し、ジャケットが風になびく。','映画的なアニメイラスト。夜の豪華なペントハウスのオフィスで、女性の敵役がこちらに拳銃を向ける。ドラマチックな照明と緊張感。','長いウェーブの金髪と黄金色の瞳の若い女性が緑の公園ベンチに座る。緑のジャケット、包帯、柔らかな自然光、繊細な線画。','静かな湖に映る、塔が輝く伝統的なアジア寺院。巨大な満月、神秘的な夜、精巧な建築と映画的な照明。','赤いベルベットと金の彫刻、紋章、ライオン像で飾られた王座。威厳あるネズミが眠る、精密な3Dレンダリング。','画面右側の日本の侍が決意に満ちて地平線を見つめる。伝統的な髷、黒髪、薄いひげ、着物、水中の粒子と映画的な光。','濃い霧と枯れ木のある暗い森を、恐怖におびえた女性が走る。ホラーの雰囲気、懐中電灯、映画的な影。','1960年代のクリーム色のクラシックカーのボンネットに座る金髪女性。ドラマチックなローアングル、緑のジャンプスーツ、ファッション写真。','写真に濃いチャコールグレーのコートと長いフォレストグリーンのプリーツスカートを追加。女性は舗装路に立ち、片手をポケットに入れる。人物と自然な光を維持。','超リアルなビューティーポートレート。緑の瞳の金髪女性、強い視線、自然なそばかす、艶のあるバーガンディの唇、プロのメイクとスタジオ照明。','正面を向いた力強くカラフルなキツネの頭の高品質な水彩ロゴ。単色背景、鮮やかな色、Yukisakura風の精緻なイラスト。','ディストピア的なサイバーパンクの未来。小柄でか弱い若い韓国人女性が小さな街を歩く。短い髪、未来的な服、ネオン、雨の夜。'],
'zh':[
'未来主义赛博朋克风格的中央公园，霓虹灯、电影感灯光、8K画质、超精细细节。','穿雪地迷彩服的狙击手俯卧在高山深雪中；极致写实、低角度视点、步枪清晰对焦、严酷冬日氛围。','一只螃蟹站在岩石上眺望海滩日落；海滩略微虚化。','超写实动作场景：蓝发女性战术人员降落在城市废墟中，夹克随风飘动。','电影感动漫插画：夜晚的豪华顶层公寓办公室里，一名女性反派朝观众举枪；戏剧化灯光与紧张氛围。','长卷金发、金黄色眼睛的年轻女性坐在绿色公园长椅上。绿色夹克、绷带、柔和自然光和细腻线条。','传统亚洲寺庙的宝塔灯火通明，倒映在平静湖面；巨大满月、神秘夜色、精致建筑和电影感灯光。','红色天鹅绒与金色雕刻、纹章和狮子像装饰的皇家宝座；一只威严的老鼠安静入睡，精细3D渲染。','画面右侧的日本武士侧身坚定地望向地平线。传统发髻、黑发、淡胡须、和服，水下粒子与电影感光线。','一名惊恐的女子在阴暗森林中奔跑，浓雾笼罩枯树，恐怖惊悚氛围，手电筒与电影感阴影。','金发女子自信地坐在奶油色1960年代复古汽车引擎盖上，低角度镜头、优雅绿色连身裤、时尚杂志摄影。','为照片添加深炭灰色外套和森林绿色长款百褶裙。女子站在铺好的小路上，一只手放在口袋里；保留人物身份和自然光。','超写实美妆肖像：绿眼睛金发女性直视镜头，自然雀斑、亮泽酒红色嘴唇、专业妆容、细腻皮肤和影棚灯光。','高品质水彩标志：正面呈现强有力、色彩鲜艳的狐狸头，单色背景、绚丽色彩、Yukisakura风格插画。','反乌托邦赛博朋克未来，一位娇小脆弱的年轻韩国女性走在小型赛博朋克城镇街道上。短发、未来感服装、霓虹和雨夜灯光。']}

LOCALES=('fr','en','ko','ja','zh')
def once(s,old,new,label):
 n=s.count(old)
 if n!=1: raise RuntimeError(f'{label}: ancrage attendu une fois, trouvé {n}. Aucun fichier modifié.')
 return s.replace(old,new,1)
def patch_app(s):
 s=once(s,'const SUGGESTIONS = SUGGESTION_KEYS.map(({ titleKey, promptKey, ...item }) => ({ ...item, title: t(titleKey), prompt: t(promptKey) }));','const SUGGESTIONS = SUGGESTION_KEYS.map(({ titleKey, promptKey, ...item }) => ({ ...item, promptKey, title: t(titleKey), prompt: t(promptKey) }));','SUGGESTIONS')
 s=once(s,'const VIDEO_SUGGESTIONS = VIDEO_SUGGESTION_KEYS.map(({ titleKey, promptKey, typeStyleKey, ...item }) => ({ ...item, title: t(titleKey), prompt: t(promptKey), typeStyle: t(typeStyleKey) }));','const VIDEO_SUGGESTIONS = VIDEO_SUGGESTION_KEYS.map(({ titleKey, promptKey, typeStyleKey, ...item }) => ({ ...item, promptKey, title: t(titleKey), prompt: t(promptKey), typeStyle: t(typeStyleKey) }));','VIDEO_SUGGESTIONS')
 s=once(s,'const [prompt, setPrompt] = useState("");','''const [prompt, setPrompt] = useState("");
  const selectedSuggestionPromptRef = useRef(null);
  useEffect(() => {
    const selected = selectedSuggestionPromptRef.current;
    if (!selected) return;
    if (prompt !== selected.lastText) { selectedSuggestionPromptRef.current = null; return; }
    const translatedPrompt = t(selected.promptKey);
    selectedSuggestionPromptRef.current = { ...selected, lastText: translatedPrompt };
    setPrompt(translatedPrompt);
    setActiveItem((current) => current && current.id === `inspi-${selected.id}` ? { ...current, prompt: translatedPrompt } : current);
  }, [i18n.language]);''','prompt state')
 old='onChange={(e) => setPrompt(e.target.value.slice(0, getPromptLimit(mode, (engines.find(model => model.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))))}'
 new='''onChange={(e) => {
    selectedSuggestionPromptRef.current = null;
    setPrompt(e.target.value.slice(0, getPromptLimit(mode, (engines.find(model => model.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))));
  }}'''
 s=once(s,old,new,'textarea')
 s=once(s,'    onClick={() => {\n      setPrompt(item.prompt);\n      setActiveItem({','''    onClick={() => {
      selectedSuggestionPromptRef.current = item.promptKey ? { id: item.id, promptKey: item.promptKey, lastText: item.prompt } : null;
      setPrompt(item.prompt);
      setActiveItem({''','suggestion click')
 return s
def matching_brace(s, opening):
 depth=0; quote=None; esc=False
 for i in range(opening,len(s)):
  c=s[i]
  if quote:
   if esc: esc=False
   elif c=='\\': esc=True
   elif c==quote: quote=None
   continue
  if c in ('"',"'",'`'): quote=c
  elif c=='{': depth+=1
  elif c=='}':
   depth-=1
   if depth==0: return i
 raise RuntimeError('Accolades non équilibrées dans i18n.js.')
def patch_locale(s,lang,ps):
 # Find locale by its top-level key, then stop at the next locale key.
 m=re.search(r'(?m)^\s*'+re.escape(json.dumps(lang))+r'\s*:\s*\{',s)
 if not m: raise RuntimeError('Locale absente: '+lang)
 locale_open=s.find('{',m.start()); locale_close=matching_brace(s,locale_open)
 section=s[m.start():locale_close+1]
 sm=re.search(r'"suggestions"\s*:\s*\{',section)
 if not sm: raise RuntimeError('Bloc suggestions absent: '+lang)
 sug_open=section.find('{',sm.start()); sug_close=matching_brace(section,sug_open)
 sug=section[sug_open:sug_close+1]
 im=re.search(r'"image"\s*:\s*\{',sug)
 if not im: raise RuntimeError('Bloc suggestions.image absent: '+lang)
 img_open=sug.find('{',im.start()); img_close=matching_brace(sug,img_open)
 block=sug[img_open:img_close+1]
 for n,prompt in enumerate(ps,1):
  km=re.search(r'(?m)^(\s*)"'+str(n)+r'"\s*:\s*\{',block)
  if not km: raise RuntimeError(f'Entrée image {n} absente pour {lang}; aucun fichier modifié.')
  obj_open=block.find('{',km.start()); obj_close=matching_brace(block,obj_open)
  obj=block[obj_open:obj_close+1]
  if re.search(r'"prompt"\s*:',obj): continue
  # Append the property before the object's closing brace, preserving indentation.
  prop_indent=' '*(len(km.group(1))+2)
  inner=obj[1:-1]
  stripped=inner.rstrip()
  comma='' if not stripped or stripped.endswith(',') else ','
  addition=comma+'\n'+prop_indent+'"prompt": '+json.dumps(prompt,ensure_ascii=False)+'\n'+km.group(1)
  obj_new='{'+stripped+addition+'}'
  block=block[:obj_open]+obj_new+block[obj_close+1:]
 # Replace image block, then reconstruct sections without touching other locales.
 sug_new=sug[:img_open]+block+sug[img_close+1:]
 section_new=section[:sug_open]+sug_new+section[sug_close+1:]
 return s[:m.start()]+section_new+s[locale_close+1:]
def main():
 if not APP.exists() or not I18N.exists(): raise SystemExit('Placez ce script dans le dossier contenant App.jsx et i18n.js.')
 app=APP.read_text(encoding='utf-8'); i18n=I18N.read_text(encoding='utf-8')
 newapp=patch_app(app); newi18n=i18n
 for lang,ps in P.items(): newi18n=patch_locale(newi18n,lang,ps)
 # Validate before writing; backups and writes happen only after all patches succeed.
 if newapp==app and newi18n==i18n: raise RuntimeError('Aucun changement détecté; vérifiez que les fichiers sont dans leur version attendue.')
 shutil.copy2(APP,APP.with_suffix(APP.suffix+'.bak')); shutil.copy2(I18N,I18N.with_suffix(I18N.suffix+'.bak'))
 APP.write_text(newapp,encoding='utf-8'); I18N.write_text(newi18n,encoding='utf-8')
 print('Correctif appliqué. Sauvegardes : App.jsx.bak et i18n.js.bak')
 print('Les prompts des 15 exemples d’images sont traduits en anglais, coréen, japonais et chinois; le prompt suit la langue tant que tu ne le modifies pas manuellement.')
if __name__=='__main__': main()
