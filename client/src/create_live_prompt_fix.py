from pathlib import Path
import re, sys

# Run this script from the OVortex client/src directory.
ROOT = Path.cwd()
app_path = ROOT / 'App.jsx'
i18n_path = ROOT / 'i18n.js'
if not app_path.exists() or not i18n_path.exists():
    print('ERREUR : place ce script dans client/src, à côté de App.jsx et i18n.js.')
    sys.exit(1)

# Localized, concise versions of the 15 image prompts. The original French prompts are kept unchanged.
P = {
'en': [
'A futuristic Cyberpunk view of Central Park, neon lights, cinematic lighting, 8K, ultra-detailed.',
'A sniper in white snow camouflage lying in deep snow in high mountains; extreme realism, ground-level angle, sharp focus on the rifle, hostile winter atmosphere and harsh high-altitude light.',
'A crab on a rock watching the sunset over a beach; the beach is slightly out of focus.',
'Ultra-realistic scene: a blue-haired tactical woman lands in a ruined building, with an intense, focused gaze. Her jacket floats in the air as she aims at the viewer.',
'Cinematic anime illustration: a full-body female antagonist in a luxurious modern penthouse office at night, pointing a pistol at the camera. Dominant threatening pose, low-angle view, elegant black suit, red glowing eyes, pale skin, cold expression, glossy black marble, executive desk, leather chair, floor-to-ceiling windows overlooking a lit city, neo-noir atmosphere, cinematic shadows, volumetric lighting, 8K action-thriller quality.',
'Anime style: a young woman with long wavy blonde hair and golden-yellow eyes sits in the center of a green wooden park bench. She wears a bandage, an open green jacket over a dark uniform with gold buttons and a red-and-black scarf, and a red badge on her sleeve. Hands on her knees over a white pleated skirt; she looks directly at the viewer with a serious expression.',
'A beautiful traditional Asian temple with illuminated pagodas beside a still lake reflecting the scene, a huge golden full moon and its reflection, dramatic misty mountain cliffs, warm autumn forest, glowing lanterns, ornate curved roofs and carved wood, peaceful magical spiritual atmosphere, volumetric light, realistic reflections, symmetrical composition, photorealistic cinematic fantasy landscape, HDR, ray tracing, 8K.',
'A majestic rat sleeping like a king on a richly carved red-velvet royal throne with gold ornaments and lion statues, wearing a blue-and-gold jeweled crown and holding a royal scepter. The setting is a ruined Gothic cathedral with huge stone arches, columns and debris; powerful rays of light illuminate the rat and throne, with floating dust, detailed textures, realistic medieval fantasy, volumetric lighting, HDR, 8K.',
'A Japanese samurai warrior in profile on the right, determined gaze toward the horizon, tied-back black hair, light beard, richly textured dark kimono and visible katana. Behind him is a reversed spiritual double made entirely of crystal-clear water, facing the opposite direction, formed from waves, splashes, liquid strands and suspended droplets. Abstract blue, navy, gray and white ink-wash background, mystical mood, dramatic cinematic lighting, ultra-detailed photorealistic fantasy concept art, HDR, 8K.',
'A terrified woman running through a dense dark forest, thick fog around dead trees and broken branches, horror-thriller mood. She holds a flashlight whose beam cuts through the mist and reveals her panicked face and muddy, battle-worn body. Torn dirty clothing, oppressive damp atmosphere, detailed forest floor, leaves and branches, cinematic horror photography, ultra-realistic, HDR, 8K, high contrast.',
'A blonde woman confidently sitting on the hood of a cream-colored 1960s vintage car, dramatic low-angle view. She wears an elegant green jumpsuit and beige lace-up military boots; one leg extends toward the lens, emphasizing the sole. Serious expression and direct gaze, road with scattered palm trees, golden sunset, Californian atmosphere, realistic chrome reflections, cinematic depth of field, luxury fashion photography, 24 mm wide-angle lens, photorealistic 8K.',
'Edit the photo by adding a dark-gray coat and a long forest-green pleated skirt. She stands on a paved path, one hand in her coat pocket, elegant pose slightly turned toward the camera. Autumn Central Park surrounds her with orange and golden foliage and New York skyscrapers in the background. Fallen leaves and a few book pages create a poetic, melancholic mood. Add a small framed inset in the upper-left corner showing a close-up portrait of the same woman from another angle.',
'Ultra-realistic beauty portrait of a blonde woman with green eyes, intense direct gaze, natural freckles, glossy burgundy lips and high-end professional makeup. She holds a pink lipstick beside her face, with elegant red nails and gold earrings. Dramatic red lighting, luxury glamour, luminous realistic skin, premium cosmetics advertising, cinematic depth of field, extreme detail, fashion-magazine quality, professional studio, 8K.',
'An artistic watercolor portrait with delicate washes, soft pigments, visible paper texture, elegant composition, subtle colors and refined details; high-quality professional illustration.',
'A futuristic cyberpunk woman in a neon-lit city, cinematic lighting, detailed futuristic clothing, atmospheric reflections, dramatic composition, photorealistic 8K.'
],
'ko': [
'네온 조명과 영화 같은 빛, 8K 초고해상도 디테일로 표현한 미래적인 사이버펑크 센트럴 파크 풍경.',
'깊은 눈 속에 엎드린 흰색 설상 위장복의 저격수. 고산 지대, 극사실주의, 지면 높이의 시점, 소총에 선명한 초점, 혹독한 겨울 분위기와 강렬한 고산광.',
'바위 위의 게가 해변의 일몰을 바라본다. 해변의 초점은 약간 흐리다.',
'극사실적인 장면: 푸른 머리의 전술 여성이 폐허가 된 건물 바닥에 착지한다. 날카롭고 집중된 눈빛, 관객을 겨누는 동안 공중에 휘날리는 재킷.',
'영화 같은 애니메이션 일러스트. 밤의 고급 펜트하우스 사무실에 서서 카메라를 향해 권총을 겨누는 여성 악역의 전신. 위협적인 자세와 로우 앵글, 검은 정장, 빛나는 붉은 눈, 창백한 피부, 차가운 표정, 검은 대리석 바닥, 임원용 책상과 가죽 의자, 야경이 보이는 통유리창, 네오누아르 분위기, 영화 같은 그림자, 볼류메트릭 조명, 8K 액션 스릴러 품질.',
'애니메이션 스타일. 긴 웨이브 금발과 황금빛 눈을 가진 젊은 여성이 초록색 나무 공원 벤치 중앙에 앉아 있다. 붕대, 금색 단추가 달린 어두운 제복 위의 열린 초록색 재킷, 빨강과 검정 스카프, 소매의 빨간 배지. 흰색 주름치마 위 무릎에 손을 올리고 진지한 표정으로 관객을 바라본다.',
'불빛이 켜진 여러 전통 아시아 탑이 고요한 호숫가에 있는 아름다운 사원. 호수는 장면과 거대한 황금빛 보름달을 비춘다. 안개 낀 웅장한 산과 절벽, 따뜻한 가을 숲, 빛나는 등불, 곡선 지붕과 조각 목재, 평화롭고 신비로운 분위기, 볼류메트릭 조명, 사실적인 반사, 대칭 구도, 영화 같은 판타지 풍경, HDR, 레이트레이싱, 8K.',
'금색 장식과 사자 조각이 있는 붉은 벨벳 왕좌에서 왕처럼 잠든 위엄 있는 쥐. 파란색과 금색 보석 왕관을 쓰고 왕홀을 쥐고 있다. 거대한 석조 아치와 기둥, 잔해가 있는 폐허의 고딕 성당 안으로 빛줄기가 들어와 쥐와 왕좌를 비춘다. 떠다니는 먼지, 정교한 질감, 사실적인 중세 판타지, 볼류메트릭 조명, HDR, 8K.',
'화면 오른쪽에서 옆모습으로 보이는 일본 사무라이. 묶은 검은 머리, 짧은 수염, 질감이 풍부한 어두운 기모노와 허리의 카타나, 수평선을 향한 결연한 시선. 뒤에는 맑은 물로 이루어진 반전된 영적 분신이 반대 방향을 바라본다. 파도, 물보라, 액체 가닥과 공중의 물방울, 파랑·남색·회색·흰색의 추상 수묵 배경, 신비로운 분위기, 극적인 영화 조명, 초정밀 판타지 콘셉트 아트, HDR, 8K.',
'짙은 숲속을 달리는 공포에 질린 여성. 죽은 나무와 부러진 가지를 감싼 짙은 안개, 공포 스릴러 분위기. 손전등 빛이 안개를 가르며 패닉에 빠진 얼굴과 진흙투성이 몸을 비춘다. 찢어지고 더러워진 옷, 습하고 억압적인 분위기, 세밀한 숲 바닥과 나뭇잎, 영화 같은 공포 사진, 극사실주의, HDR, 8K, 강한 대비.',
'1960년대 크림색 빈티지 자동차 보닛에 자신감 있게 앉은 금발 여성. 극적인 로우 앵글, 우아한 초록색 점프수트와 베이지색 끈 달린 군화, 렌즈 쪽으로 뻗은 다리와 강조된 밑창. 진지한 표정과 카메라를 향한 시선, 야자수가 드문드문 있는 도로, 황금빛 석양과 캘리포니아 분위기, 크롬 반사, 영화 같은 심도, 고급 패션 사진, 24mm 광각, 극사실적인 8K.',
'사진에 짙은 회색 코트와 긴 숲색 주름치마를 추가한다. 여성은 포장된 길에 서서 한 손을 코트 주머니에 넣고 카메라 쪽으로 살짝 몸을 돌린 우아한 자세를 취한다. 주황색과 황금색 단풍의 센트럴 파크, 뒤편의 뉴욕 고층 건물, 낙엽과 책 페이지가 만드는 시적이고 우울한 분위기. 왼쪽 위에 같은 여성의 다른 각도 클로즈업을 작은 액자 형태로 추가한다.',
'초현실적인 뷰티 인물 사진. 초록 눈의 금발 여성, 강렬한 정면 시선, 자연스러운 주근깨, 윤기 나는 버건디 입술과 고급 메이크업. 얼굴 옆에 분홍색 립스틱을 들고 빨간 손톱과 금색 귀걸이를 착용한다. 극적인 붉은 조명, 럭셔리한 매력, 사실적인 빛나는 피부, 프리미엄 화장품 광고, 영화 같은 심도, 패션 잡지 품질, 전문 스튜디오, 8K.',
'섬세한 번짐과 부드러운 안료, 종이 질감, 우아한 구도, 은은한 색상과 정교한 디테일을 살린 예술적인 수채화 초상화. 고품질 전문 일러스트.',
'네온으로 빛나는 도시 속 미래적인 사이버펑크 여성. 영화 같은 조명, 세밀한 미래 의상, 분위기 있는 반사광, 극적인 구도, 극사실적인 8K.'
],
'ja': [
'ネオンと映画のような照明、8Kの超精細なディテールで描く、未来的なサイバーパンクのセントラルパーク。',
'深い雪に伏せる白い雪上迷彩服の狙撃手。高山地帯、極限のリアリズム、地面すれすれの視点、ライフルに鋭く合ったピント、過酷な冬の雰囲気と高地の強い光。',
'岩の上のカニが浜辺の夕日を眺めている。浜辺にはわずかにぼかしを入れる。',
'超リアルな場面。青い髪の戦術的な女性が廃墟の建物の床に着地する。鋭く集中した眼差しで、観客に狙いを定める間、ジャケットが宙になびく。',
'映画的なアニメイラスト。夜の豪華なペントハウスオフィスで、カメラに銃を向ける女性の敵役を全身で描く。威圧的なポーズ、ローアングル、黒いスーツ、光る赤い目、青白い肌、冷たい表情、黒い大理石の床、役員用デスクと革椅子、夜景を望む大窓、ネオノワールの雰囲気、映画的な影、ボリュームライト、8Kのアクションスリラー品質。',
'アニメ調。長いウェーブの金髪と黄金色の瞳の若い女性が、緑色の木製公園ベンチの中央に座る。包帯を巻き、金ボタン付きの暗色の制服の上に開いた緑のジャケット、赤黒のスカーフ、袖に赤いバッジ。白いプリーツスカートの上に手を置き、真剣な表情で見る人をまっすぐ見つめる。',
'静かな湖畔に複数の塔が輝く美しい伝統的なアジア寺院。湖面には景色と巨大な黄金の満月が映る。霧に包まれた雄大な山と断崖、暖色の秋の森、光る提灯、曲線屋根と彫刻木材、穏やかで神秘的な雰囲気、ボリューム照明、リアルな水面反射、左右対称の構図、映画的なファンタジー風景、HDR、レイトレーシング、8K。',
'金の装飾とライオン像が彫られた赤いベルベットの王座で、王のように眠る堂々としたネズミ。青と金の宝石の王冠をかぶり、王笏を持つ。巨大な石のアーチや柱、瓦礫のある廃墟のゴシック大聖堂に光が差し込み、ネズミと王座を照らす。舞う埃、精細な質感、リアルな中世ファンタジー、ボリューム照明、HDR、8K。',
'画面右側に横向きで立つ日本の侍。結んだ黒髪、薄いひげ、質感豊かな暗色の着物と腰の刀、地平線を見つめる決意の眼差し。背後には透明な水だけでできた反転した霊的な分身が逆方向を向く。波しぶき、液体の筋、宙に浮く水滴、青・紺・灰・白の抽象的な墨絵背景、神秘的な雰囲気、劇的な映画照明、超精細な写実的ファンタジーコンセプトアート、HDR、8K。',
'暗く密集した森を走る恐怖に震える女性。枯れ木や折れ枝を濃い霧が包み、ホラー・スリラーの雰囲気。懐中電灯の光が霧を切り裂き、パニックに陥った顔と泥にまみれた体を照らす。破れて汚れた服、湿った圧迫感、細かな森の地面や葉、映画的なホラー写真、超リアル、HDR、8K、高コントラスト。',
'1960年代のクリーム色のクラシックカーのボンネットに自信たっぷりに座る金髪女性。劇的なローアングル、上品な緑のジャンプスーツとベージュの編み上げブーツ、レンズに向けて伸ばした脚と強調された靴底。真剣な表情でカメラを見つめ、まばらなヤシの並ぶ道路、黄金色の夕日とカリフォルニアの雰囲気、クロームのリアルな反射、映画的な被写界深度、高級ファッション写真、24mm広角、写実的な8K。',
'写真に濃いグレーのコートと長いフォレストグリーンのプリーツスカートを追加する。女性は舗装路に立ち、片手をコートのポケットに入れ、カメラに少し体を向けた優雅なポーズ。オレンジと金色の紅葉に包まれた秋のセントラルパーク、背景にはニューヨークの高層ビル。落ち葉と数枚の本のページが詩的で物悲しい雰囲気を作る。左上に同じ女性を別角度から撮った顔の小さな額入り写真を追加。',
'緑の瞳の金髪女性の超リアルなビューティーポートレート。強いカメラ目線、自然なそばかす、艶のあるバーガンディの唇、高級プロメイク。顔の横にピンクの口紅を持ち、赤いネイルと金のイヤリングを着用。劇的な赤い照明、ラグジュアリーで華やかな雰囲気、リアルな輝く肌、高級コスメ広告、映画的な被写界深度、ファッション誌品質、プロスタジオ、8K。',
'繊細なにじみ、柔らかな顔料、紙の質感、優雅な構図、控えめな色彩と精巧なディテールを備えた芸術的な水彩肖像画。高品質なプロのイラスト。',
'ネオンに照らされた都市にいる未来的なサイバーパンクの女性。映画的な照明、細部まで作り込まれた未来の衣装、雰囲気のある反射、ドラマチックな構図、写実的な8K。'
],
'zh': [
'未来主义赛博朋克中央公园景观，霓虹灯、电影级灯光、8K 超精细细节。',
'身穿白色雪地迷彩服的狙击手趴在深雪中，身处高山环境；极致写实、贴地视角、步枪清晰对焦、严酷的冬日氛围与高海拔强光。',
'一只螃蟹站在岩石上眺望海滩日落，海滩略微虚焦。',
'超写实场景：蓝发战术女性落在废弃建筑的地面上，眼神锐利而专注；她瞄准观众时，夹克在空中飘动。',
'电影感动漫插画：夜晚豪华现代顶层公寓办公室中的女性反派全身像，直接用手枪指向镜头。姿态强势且具有威胁感，低角度视角，黑色西装、发光红眼、苍白皮肤、冷峻表情、黑色大理石地面、行政办公桌和皮椅、落地窗外的璀璨城市夜景、黑色电影氛围、电影级阴影、体积光，8K 动作惊悚片质感。',
'动漫风格：一位拥有长卷金发和金黄色眼睛的年轻女性坐在绿色木制公园长椅中央。她缠着绷带，穿着敞开的绿色夹克，内搭带金色纽扣的深色制服和红黑围巾，袖子上有红色徽章。双手放在白色百褶裙上的膝盖上，神情严肃地直视观众。',
'宁静湖畔的美丽传统亚洲寺庙，数座宝塔灯火通明，湖面倒映整个场景与巨大的金色满月。雄伟山崖笼罩在薄雾中，周围是暖色秋林和发光灯笼；精致的弯曲屋顶与雕刻木材营造神秘祥和的氛围。体积光、真实水面倒影、对称构图、电影感奇幻风景、HDR、光线追踪、8K。',
'一只威严的老鼠像国王般安睡在红色天鹅绒王座上，王座饰有金色雕刻和狮子雕像。它戴着蓝金宝石王冠，轻握王权手杖。场景位于废弃的哥特式大教堂，巨大的石拱、柱子与碎石间有强烈光束照亮老鼠和王座，尘埃漂浮，纹理精细，写实中世纪奇幻，体积光、HDR、8K。',
'画面右侧的日本武士侧身而立，黑发束起、略有胡须，穿着纹理丰富的深色和服，腰间可见武士刀，目光坚定地望向地平线。身后是完全由晶莹水体构成、朝相反方向凝望的倒置灵体分身，形态由波浪、水花、液态丝线和悬浮水滴组成。蓝、藏青、灰、白色抽象水墨背景，神秘氛围，戏剧化电影灯光，超精细写实奇幻概念艺术，HDR、8K。',
'一名惊恐的女性在阴暗茂密的森林中奔跑，浓雾笼罩枯树与断枝，营造恐怖惊悚氛围。她手持手电筒，光束穿透迷雾，照亮惊慌的脸和沾满泥土、满是挣扎痕迹的身体。衣物破损肮脏，环境潮湿压抑，森林地面、树叶与枝条细节丰富，电影级恐怖摄影，超写实、HDR、8K、高对比度。',
'一位金发女性自信地坐在奶油色 20 世纪 60 年代复古汽车的引擎盖上，戏剧性低角度拍摄。她穿优雅的绿色连身服和米色系带军靴，一条腿伸向镜头，突出鞋底。神情严肃并直视镜头，稀疏棕榈树沿路排列，金色夕阳与加州氛围，车身镀铬反光逼真，电影景深、高端时尚摄影、24mm 广角、写实 8K。',
'在照片中添加深灰色外套和一条森林绿色长百褶裙。她站在铺好的小路上，一只手插在外套口袋里，身体略微转向镜头，姿态优雅。背景是秋天的中央公园，橙金色树叶环绕视野，远处可见纽约摩天大楼。落叶和几页书营造诗意忧郁的气氛。左上角添加一个小型带框插图，展示同一女性从另一个角度拍摄的面部特写。',
'超写实美妆人像：绿眼睛的金发女性直视镜头，带有自然雀斑、亮泽酒红唇和高端专业妆容。她在脸旁拿着粉色口红，指甲涂红并佩戴金色耳环。戏剧性红色灯光、奢华迷人氛围、富有真实纹理的明亮肌肤、高端化妆品广告、电影景深、极致细节、时尚杂志品质、专业影棚、8K。',
'艺术水彩肖像，具有细腻的水彩晕染、柔和颜料、可见纸张纹理、优雅构图、含蓄色彩和精致细节；高品质专业插画。',
'霓虹城市中的未来赛博朋克女性，电影级灯光、精细的未来服装、富有氛围感的反射与戏剧化构图，写实 8K。'
]
}

# Patch i18n.js: add missing image prompt entries for each non-French locale.
i18n = i18n_path.read_text(encoding='utf-8')
locale_markers = {'en':'"en": {', 'ko':'"ko": {', 'ja':'"ja": {', 'zh':'"zh": {'}
for lang, marker in locale_markers.items():
    lang_start = i18n.find(marker)
    if lang_start < 0:
        raise RuntimeError(f'Locale {lang} introuvable dans i18n.js')
    next_locale = min([x for x in [i18n.find('"fr": {',lang_start+1), i18n.find('"en": {',lang_start+1), i18n.find('"ko": {',lang_start+1), i18n.find('"ja": {',lang_start+1), i18n.find('"zh": {',lang_start+1)] if x>=0] or [len(i18n)])
    # Find the locale's suggestions.image section.
    sug = i18n.find('"suggestions": {', lang_start, next_locale)
    if sug < 0: raise RuntimeError(f'suggestions introuvable pour {lang}')
    img = i18n.find('"image": {', sug, next_locale)
    if img < 0: raise RuntimeError(f'suggestions.image introuvable pour {lang}')
    img_end = i18n.find('"video": {', img, next_locale)
    if img_end < 0: raise RuntimeError(f'fin suggestions.image introuvable pour {lang}')
    seg = i18n[img:img_end]
    for n, prompt in enumerate(P[lang], 1):
        pat = re.compile(r'("'+str(n)+r'"\s*:\s*\{\s*"title"\s*:\s*"(?:\\.|[^"\\])*"\s*)(\})', re.S)
        m = pat.search(seg)
        if not m:
            # Already has another field or format; add prompt after title if missing.
            obj = re.search(r'("'+str(n)+r'"\s*:\s*\{.*?\n\s*\})', seg, re.S)
            if not obj: raise RuntimeError(f'Image suggestion {n} introuvable ({lang})')
            block=obj.group(1)
            if '"prompt"' not in block:
                block2=re.sub(r'("title"\s*:\s*"(?:\\.|[^"\\])*"\s*)', r'\1,\n            "prompt": '+repr(prompt).replace("'", '"'), block, count=1)
                seg=seg[:obj.start()]+block2+seg[obj.end():]
            continue
        # escape JSON-style string
        q=__import__('json').dumps(prompt, ensure_ascii=False)
        replacement=m.group(1)+',\n            "prompt": '+q+m.group(2)
        seg=seg[:m.start()]+replacement+seg[m.end():]
    i18n=i18n[:img]+seg+i18n[img_end:]

# Patch App.jsx so selected suggestion prompts refresh on language change but user edits are preserved.
app = app_path.read_text(encoding='utf-8')
old = '  const { t, i18n } = useTranslation();\n  const SUGGESTIONS = SUGGESTION_KEYS.map(({ titleKey, promptKey, ...item }) => ({ ...item, title: t(titleKey), prompt: t(promptKey) }));\n  const VIDEO_SUGGESTIONS = VIDEO_SUGGESTION_KEYS.map(({ titleKey, promptKey, typeStyleKey, ...item }) => ({ ...item, title: t(titleKey), prompt: t(promptKey), typeStyle: t(typeStyleKey) }));'
new = '''  const { t, i18n } = useTranslation();
  const selectedSuggestionRef = useRef(null);
  useEffect(() => {
    const selected = selectedSuggestionRef.current;
    if (!selected) return;
    const translatedPrompt = t(selected.promptKey);
    setPrompt(current => current === selected.lastText ? translatedPrompt : current);
    selected.lastText = translatedPrompt;
  }, [i18n.language]);
  const SUGGESTIONS = SUGGESTION_KEYS.map(({ titleKey, promptKey, ...item }) => ({ ...item, titleKey, promptKey, title: t(titleKey), prompt: t(promptKey) }));
  const VIDEO_SUGGESTIONS = VIDEO_SUGGESTION_KEYS.map(({ titleKey, promptKey, typeStyleKey, ...item }) => ({ ...item, titleKey, promptKey, typeStyleKey, title: t(titleKey), prompt: t(promptKey), typeStyle: t(typeStyleKey) }));'''
if old not in app:
    raise RuntimeError('Bloc SUGGESTIONS attendu introuvable dans App.jsx; aucun fichier local modifié.')
app=app.replace(old,new,1)
old_click='''    onClick={() => {
      setPrompt(item.prompt);
      setActiveItem({'''
new_click='''    onClick={() => {
      selectedSuggestionRef.current = item.promptKey ? { promptKey: item.promptKey, lastText: item.prompt } : null;
      setPrompt(item.prompt);
      setActiveItem({'''
if old_click not in app:
    raise RuntimeError('Gestionnaire de clic des miniatures introuvable dans App.jsx.')
app=app.replace(old_click,new_click,1)
old_change='''  onChange={(e) => setPrompt(e.target.value.slice(0, getPromptLimit(mode, (engines.find(model => model.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))))}'''
new_change='''  onChange={(e) => { selectedSuggestionRef.current = null; setPrompt(e.target.value.slice(0, getPromptLimit(mode, (engines.find(model => model.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))); }}'''
if old_change not in app:
    raise RuntimeError('Gestionnaire de saisie du prompt introuvable dans App.jsx.')
app=app.replace(old_change,new_change,1)

# Write backups and patched files only after all replacements succeeded.
for path in (app_path, i18n_path):
    backup=path.with_suffix(path.suffix+'.before_live_prompt_fix.bak')
    if not backup.exists(): backup.write_text(path.read_text(encoding='utf-8'),encoding='utf-8')
i18n_path.write_text(i18n,encoding='utf-8')
app_path.write_text(app,encoding='utf-8')
print('Correctif appliqué.')
print('Sauvegardes : App.jsx.before_live_prompt_fix.bak et i18n.js.before_live_prompt_fix.bak')
print('Ajout des prompts des 15 miniatures en anglais, coréen, japonais et chinois.')
print('Le prompt sélectionné suit le changement de langue tant qu’il n’a pas été modifié manuellement.')
