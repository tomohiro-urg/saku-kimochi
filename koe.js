(function(){
  "use strict";

  /* =========================================================
     場面の一覧
     ========================================================= */
  var SCENES = [
    { name:"朝の散歩の前",        emo:"🌅" },
    { name:"朝ごはんの前",        emo:"🍚" },
    { name:"お昼寝から起きたとき", emo:"😴" },
    { name:"夕方の散歩の前",      emo:"🌇" },
    { name:"夕ご飯のあと",        emo:"🏠" },
    { name:"お客さんが来たとき",   emo:"🔔" },
    { name:"おるすばんのあと",     emo:"🚪" },
    { name:"おもちゃで遊ぶとき",   emo:"🧸" },
    { name:"ちいさい子が来た",     emo:"👧", noPrefix:true },  // あそびに きた 子に はなしかける 場面なので なまえを つけない
    { name:"なんでもないとき",     emo:"☁️" },
    { name:"あそびに来たよ",       emo:"👋" },
    { name:"いっしょにお出かけ",   emo:"🚶" }
  ];

  var LEVEL_NAMES = ["おだやか", "ふつう", "大こうふん"];
  var LEVEL_EMOJI = ["😌", "🐶", "🤩"];

  /* =========================================================
     セリフ (12場面 × 3だんかい × 8つ以上)
     [0]=おだやか [1]=ふつう [2]=大こうふん
     ========================================================= */
  var LINES = [

    /* 1. 朝の散歩の前 */
    [
      [
        "おはよう…ボク、まだ ちょっと ねむいわ。でも おさんぽ 行きたいがね",
        "そとの におい、きょうは やさしい においが しとるがね",
        "ゆっくりで ええよ。ボク、ここで まっとるでね",
        "あさの おさんぽ、ボクの いちばん すきな じかん だがね",
        "まだ おふとんの ぬくとさが のこっとるわ",
        "そとの ひかりが まぶしいなぁ。ボク、めを ほそめとるがね",
        "ボク、ゆっくり したく するで、まっとってちょう",
        "きょうは どんな いちにちに なるんだろ、たのしみ だわ",
        "{who}も いっしょに おさんぽ する？ ゆっくり あるこまい"
      ],
      [
        "なあなあ、そろそろ おさんぽの じかん だと おもうんだけどなぁ",
        "リード どこ？ ボク、しっぽ ふって まっとるよ",
        "きょうは どこまで 行く？ こうえんが ええなぁ、ボク",
        "くつ はいた？ ボク、じゅんび ばんたん だがね！",
        "しっぽが もう うずうず しとるがね",
        "はよ そとに でたいわ。げんかん あけてちょう",
        "きょうの おさんぽ、ちょっと ながめが ええなぁ",
        "ボク、じゅんびは できとるよ。あとは {who}だけだがね！",
        "{who}、おさんぽ いこまい！ ボク、まわりの みはり するでね"
      ],
      [
        "おさんぽ！おさんぽ！ はよ はよ！ ボク もう げんかんに おるがね！",
        "うれしすぎて しっぽが とまらんがね！ ぐるぐる ぐる〜！",
        "きょうこそ ねこさんに あいさつ するでね！ いこまい、いこまい！",
        "ボク、ロケットみたいに とんでいくでよ！ まっとってちょう！",
        "うれしくて くるくる まわってまうわ！ とまらんがね！",
        "げんかんの まえで ジャンプ してまうでよ！ はよ はよ！",
        "ボクの きぶん、もう でら さいこうちょう だがね！",
        "ボク、はなの さきまで げんき いっぱい だがや！",
        "{who}も はよ はよ！ ボクが さきに いくでよ！"
      ]
    ],

    /* 2. 朝ごはんの前 */
    [
      [
        "おなか、ちょっとだけ すいてきたかも…なんてな、ボク",
        "ごはんの おと、きこえた きが したがね",
        "まっとる あいだ、おすわり しとるわ。ボク おりこう だがね？",
        "きょうの ごはん、なんだろか。たのしみ だわ",
        "おなかの おと、きこえてまったかも…えへへ",
        "おさらを じっと みとるの。しずかに まっとるでね",
        "ごはんの まえに ちょっとだけ あくびが でてまった",
        "ボク、おとなしく まてる子 なんだわ",
        "{who}が おさらを もってきてくれるの、ボク まっとるがね"
      ],
      [
        "なあ、ボクの ごはん わすれとらんよね？ なあなあ",
        "おさらの まえで まっとるよ。はよ きてちょう",
        "においが する！ これは ボクの ごはんの においだがね！",
        "おすわりも おても するで、ごはん ちょーでゃあ",
        "なあ、そろそろ じゃにゃあ？ ボク、めが さめてきたがね",
        "スプーンの おと、きこえた きが するがね！",
        "おすわりで まっとるで、はよ ちょーでゃあ",
        "おなかが ぽこぽこ いっとるよ。ごはん まだかね？",
        "{who}、ボクの ごはん わすれとらん？ なあなあ"
      ],
      [
        "ごはん！ごはん！ ボク もう まてんがね！",
        "はよ はよ！ おなかが ぐぅーって ないとるがね！",
        "ボク、せかいで いちばん ごはんが すきなんだわ！",
        "おさら みとったら しっぽが ぶんぶんに なってまったわ！",
        "うわぁぁ ごはんだ！ ボク もう がまん できんがね！",
        "しっぽ ふりすぎて からだごと ゆれてまうでよ！",
        "ボクの おなか、げんきいっぱいに なってまったわ！",
        "はよ はよ！ よだれ でてまいそうだがね！",
        "{who}！ ごはん！ ごはん！ ボク もう まてんでよ！"
      ]
    ],

    /* 3. お昼寝から起きたとき */
    [
      [
        "ふぁ〜あ…よう ねたわ。ボク、ええ ゆめ みとったがね",
        "まだ ちょっとだけ ねむいんだわ…もう すこし…",
        "おきたよ。だれか あそんで くれん？",
        "ひなたが ぬくとくて、しあわせ だったがね",
        "まぶた、まだ はんぶん とじとるかも…",
        "ゆめのなか、うみゃあ おやつ たべとったがね",
        "ボク、のびのび したら げんきに なってきたわ",
        "しずかな じかん、すきなんだわ",
        "{who}の ひざの うえで ねとったの。ぬくとかったがね"
      ],
      [
        "ねぼけとらんがね！ ボク、ちゃんと おきとるがね！",
        "おひるね あけの ボクは、げんきが まんたん だがや",
        "ねとる あいだに、なんか たのしいこと あった？",
        "せのび しよ。うーん、きもちええがね",
        "め、ぱっちり さめたよ。さあ なに しよまいか？",
        "からだ ぶるぶるって したら すっきり したがね",
        "ねとるあいだの こと、おしえてちょう",
        "ボク、げんきに ふっかつ したがね！",
        "{who}、ボク ねとる あいだ そばに おってくれた？"
      ],
      [
        "おきたー！ さぁ あそぶでよ！ ボク げんき １００ばい！",
        "ねとった ぶん、いまから ようけ はしるでね！",
        "みんな どこ〜？ ボク、さみしかったがね！",
        "おひるね パワー ぜんかい！ うおぉーん、たのしいがね！",
        "おきたら げんきが あふれてまったわ！ あそぼまい！",
        "ぴょんぴょん はねたく なってまう きもち だがね！",
        "ボク、じゅうでんかんりょう！ もう はしれるでよ！",
        "ねとったぶん いっきに とりもどすでね！ うおー！",
        "{who}！ おきたよ！ あそぼまい あそぼまい！"
      ]
    ],

    /* 4. 夕方の散歩の前 */
    [
      [
        "ゆうがたの かぜ、すずしくて きもちええがね",
        "そらが オレンジいろ。ボク、この いろが すきなんだわ",
        "きょうは のんびり あるきたい きぶん だわ",
        "おさんぽ、いこまい？ むり せんで ええでね",
        "そとの おと、やわらかく なってきたなぁ",
        "ちょっと つめたい かぜが きもちええがね",
        "ボク、のんびり あるくのも すきなんだわ",
        "きょう いちにち、おつかれさま だったなも"
      ],
      [
        "ゆうがたの おさんぽ、そろそろ じゃにゃあ？ なあ",
        "あさとは ちがう においが するがね。たのしみ",
        "きょうは どっちの みち いく？ ボク、かわの ほうが すきだわ",
        "リードの おと きこえた！ ボク、いま いくでよ",
        "そろそろ かなぁ？ ボク、げんかんの ほう みとるがね",
        "くさの におい、かいでみたいなぁ",
        "リード もってきてちょう。ボク まっとるでね",
        "ゆうがたの さんぽ、たのしみに しとったがね"
      ],
      [
        "よるの まえの おさんぽ、いちばん わくわく するがね！",
        "はよ いこまい！ ともだちの わんこに あえるかも しれんでよ！",
        "ボク、げんきが ありあまっとるがね！ はしりたいわ！",
        "まって まって、ボクが せんとうを あるくでね！",
        "いくでよぉ！ ボク もう とびだしてまいそう だがね！",
        "はしるでよー！ げんきが とまらんがね！",
        "ボク、ゆうやけより はよ はしれるがね！",
        "おさんぽ さいこう！ しっぽが ちぎれてまう くらい ふるでよ！"
      ]
    ],

    /* 5. 夕ご飯のあと・家族だんらん */
    [
      [
        "おなか いっぱい。みんな いっしょで しあわせ だがね",
        "ここに ころんと しとっても ええ？ ボク、そばに おりたいんだわ",
        "みんなの こえ きいとると、ねむく なってまうわ",
        "なでてくれると、ボク とけてまいそうだがね",
        "みんなの こえ、ここちええ おんがく みたいだわ",
        "おなかも ぬくといし、こころも ぬくといがね",
        "ボク、このじかんが いちばん すきかも しれんわ",
        "そっと よりそっとっても ええ？",
        "{who}の となりが、ボク いちばん ほっと するがね"
      ],
      [
        "なあ、ボクの はなし きいとる？ きいてちょう",
        "ひざの うえ、あいとる？ ボク のっても ええ？",
        "テレビより ボクを みてちょう、なんてな",
        "きょうも ええ ひ だったなぁって、ボク おもっとるがね",
        "なあ、きょう あったこと はなしても ええ？",
        "ソファの すみ、あけといてちょう",
        "なでなで、もう すこし つづけてちょう",
        "ボクも なかまに いれてちょう",
        "{who}、おはなし きかせてちょう。ボクも きいとるでね"
      ],
      [
        "まだ ねんよね？ ボク まっと あそびたいがね！",
        "みんな そろっとる！ うれしくて ぐるぐる まわってまうわ！",
        "ボクの じまんの げい、みて みて！ みてちょう！",
        "たのしい きもちが おおきすぎて、こえが でてまったがね！",
        "みんな あつまっとる！ うれしくて じっとしとれんがね！",
        "げいを みせるで、みんな みとってちょう！ それ！",
        "ボク、こうふんで はなが ひくひく してまうわ！",
        "たのしい きもちが とまらんがね！ わふ わふ！",
        "{who}！ ボクの げい、みてみて！ すごいがね！"
      ]
    ],

    /* 6. お客さんが来たとき(インターホン) */
    [
      [
        "だれか きたみたい…ボク、そっと みてくるでね",
        "しっとる においだで、こわくないがね",
        "おきゃくさん、やさしい ひと かなぁ",
        "ボク、しずかに おでむかえ するでね",
        "そっと かおを だして ようすを みとるの",
        "だいじょうぶな ひとか、においで しらべとるがね",
        "ボク、しずかに ばんけん しとるよ",
        "おきゃくさん、ゆっくり きてくれると あんしん だわ",
        "{who}の あしおと かもしれん。ボク、しずかに まっとるわ"
      ],
      [
        "ピンポン なった！ ボクが おしえて あげるがね！",
        "だれ？ だれ？ ボクの おうちに ようが あるんかね？",
        "おきゃくさん、ボクのこと なでて くれるかなぁ",
        "げんかんまで ついてくでね。ボクも かぞく だがね",
        "だれか きた！ ボクが いちばんに きづいたがね！",
        "ちょっと どきどき するけど、たのしみでも あるんだわ",
        "おきゃくさんの くつ、においを チェック しとるがね",
        "ボクの おしごと、しっかり するでね",
        "{who}が きたの？ ボクが いちばんに おでむかえ するでね"
      ],
      [
        "わんわん！ ボクが まもるでね！ でも こわくないでよ！",
        "おきゃくさん だー！ うれしくて とびはねてまうわ！",
        "ボクの おでむかえ、せかいいち はりきっとるがね！",
        "なあ なあ、ボクにも あいさつ してちょう！",
        "だれ だれ だれー！ こうふんで とまらんがね！",
        "げんかんまで ダッシュ してまうでよ！",
        "ボク、おおごえで おしらせ してまうわ！ わんわん！",
        "しっぽが プロペラみたいに なってまうがね！",
        "{who}だー！ ボク、うれしくて ぐるぐる してまうでよ！"
      ]
    ],

    /* 7. お留守番から帰ってきたとき */
    [
      [
        "おかえり…ボク、ずっと まっとったがね",
        "さみしかったけど、ええ子で まっとったよ",
        "においを かがせてちょう。うん、いつもの においで あんしん だわ",
        "そばに おってくれる だけで、ボク うれしいがね",
        "しずかに まっとったよ。でも ちょっと さみしかったがね",
        "おかえりの こえ、きくと ほっと するわ",
        "ボク、ええ子で るすばん できたがね",
        "そばに すわらせてちょう。それだけで じゅうぶん だわ",
        "{who}、おかえり。ボク、おとなしく まっとったがね"
      ],
      [
        "おかえりなさい！ ボク、げんかんで まっとったがね！",
        "どこ いっとったの？ ボクも つれてって ほしかったわ",
        "ただいまって、もう いっぺん いってちょう",
        "ボク、るすばん がんばったよ。ほめてちょう",
        "やっと かえってきた！ まっとったがね！",
        "どこに いっとったか、においで あててまうでよ",
        "なでなで してちょう。るすばん がんばったでね",
        "ボク、げんかんで ずっと みみを たてとったがね",
        "{who}、どこ いっとったの？ ボク、おみやげの においを さがすでね"
      ],
      [
        "おかえりー！ うれしすぎて ぐるぐる まわってまうがね！",
        "もう どこにも いったら いかんでよ！ ずっと いっしょ だがね！",
        "しっぽが ちぎれそうな くらい うれしいがね！",
        "ボクの きもち、こえに ぜんぶ のせたでよ！ わかった？",
        "おかえりおかえりおかえり！ でら うれしいがね！",
        "ジャンプが とまらんでよ！ たかく たかく！",
        "ボクの あいじょう、ぜんぶ ぶつけてまうでよ！",
        "こえが おおきく なってまう！ それくらい うれしいんだわ！",
        "{who}、おかえりー！ ボク、まっとったよ！ だいすき だがね！"
      ]
    ],

    /* 8. おもちゃで遊んでいるとき */
    [
      [
        "この おもちゃ、ボクの たからもの だがね",
        "そっと かんで あそぶのが すきなんだわ",
        "いっしょに あそぶ？ むりには さそわんでね",
        "きゅっきゅって おと、きもちええがね",
        "この おもちゃ、すこし ふるく なったけど すきなんだわ",
        "そっと くわえて、ひとりの じかんも すきだわ",
        "ボク、のんびり あそぶのも たのしいがね",
        "みとって くれるだけで うれしいがね",
        "{who}が みとってくれると、ボク あんしんして あそべるがね"
      ],
      [
        "なげて なげて！ ボク、とりに いくでね！",
        "これ、ボクの だよ？ とったら いかんでね",
        "ひっぱりっこ しよまい！ ボク、けっこう つよいでよ",
        "まっと あそぼまい。まだ つかれとらんがね",
        "なあ、いっしょに あそぼまい。さそっとるがね",
        "これ とってきたよ！ ほめて ほめて！ ほめてちょう！",
        "もう いっぺん なげてちょう。ボク とりに いくで",
        "ボクの おきにいり、みつけたがね",
        "{who}、いっしょに ひっぱりっこ しよまい。ボク けっこう つよいでよ"
      ],
      [
        "たのしい！ たのしい！ ボク、とまれんがね！",
        "ぶんぶん ふりまわすの、でら たのしいがね！",
        "ボクの ぜんりょく、みせたるでよ！ それー！",
        "もう いっぺん！ もう いっぺん！ まだまだ いけるがね！",
        "たのしくて ぐるぐる はしってまうがね！",
        "ぶんぶん ふりまわして、だいこうふん だがや！",
        "ボク、まっと あそびたい！ まっと まっと！",
        "きゅんきゅん こえが でてまう くらい たのしいがね！",
        "{who}、なげて なげて！ ボク ぜんぶ とってくるでね！"
      ]
    ],

    /* 9. 姪っ子ちゃんが来たとき */
    [
      [
        "きたね。ボク、そっと よこに すわっとるがね",
        "やさしく なでてくれて、ありがとさん",
        "ちいさい てが ぬくといがね",
        "ボク、ええ子に しとるで いっしょに おろまい",
        "そっと そばに いくでね。びっくり させんように するわ",
        "ちいさい こえで あいさつ するでね",
        "ボク、やさしく してもらえると うれしいがね",
        "いっしょに すわろまい"
      ],
      [
        "あそんで くれるの？ ボク、まっとったがね！",
        "なまえ よんでちょう。サクって！",
        "おいかけっこ しよまい！ ボク、はやいでよ",
        "そばに いっても ええ？ ボク、だいすき だがね",
        "あそんでくれる？ ボク たのしみに しとったがね",
        "おひざの うえ、すこしだけ ええ？",
        "サクって よんでちょう。ボクの なまえ だがね",
        "いっしょに おさんぽも しよまい"
      ],
      [
        "きたー！ うれしすぎて とびついてまいそう だがね！",
        "あそぼまい あそぼまい！ きょうは ようけ あそぶでね！",
        "ボク、じまんの ジャンプ みせたるでよ！",
        "だいすき だいすき！ こえが おおきく なってまったわ！",
        "きたきたー！ うれしくて とびはねてまうがね！",
        "だいすき だがね！ ぐるぐる まわってまうでよ！",
        "ボクの げんきパワー、ぜんぶ みせたるでよ！",
        "ぺろぺろ してまう くらい うれしいがね！"
      ]
    ],

    /* 10. なんでもないとき */
    [
      [
        "べつに ようは にゃあの。ただ よんでみた だけだがね",
        "そこに おる？ うん、それだけで あんしん だわ",
        "ひなたぼっこ、いっしょに しよまい",
        "なんとなく、しあわせな きぶん なんだわ",
        "ただ ここに おるだけで、しあわせ だがね",
        "そよかぜ きもちええなぁって おもっとったの",
        "ボク、のんびり するのも すきなんだわ",
        "べつに なんでも にゃあけど、こえに してみたがね",
        "{who}、そこに おるよね？ ボク、よんでみただけだがね"
      ],
      [
        "なあなあ、ちょっとだけ こっち むいてちょう",
        "ひまだわ。ボクと なんか しよまい",
        "ボクの こと、わすれとらんよね？",
        "なでなで １かいぶん、もらっても ええ？",
        "なあ、ちょっと かまってちょう",
        "ひま だで なんか しよまい",
        "ボクの こと、みとってちょう",
        "とくに ようじは にゃあけど、よんでみただけだがね",
        "{who}、ちょっとだけ なでなで してちょう。ボク まっとるでね"
      ],
      [
        "なんにも にゃあけど げんき だがね！ わーい！",
        "きゅうに はしりたく なってまったわ！ みとってちょう！",
        "うれしい きもちが あふれて こえが でてまったがね！",
        "ボクは いつでも げんき １２０パーセント だがね！",
        "なんとなく げんきに なってまったがね！",
        "きゅうに はしりたい きぶん だわ！ みとってちょう！",
        "ボク、りゆうも なく たのしいがね！",
        "うれしい きもちが あふれて とまらんでよ！",
        "{who}ー！ なんにも にゃあけど げんき だがね！ わーい！"
      ]
    ],

    /* 11. 会いに来てくれたとき */
    [
      [
        "{who}、きたね。ボク、そっと よこに すわるでね",
        "{who}の におい、ボク だいすき。ほっと するがね",
        "{who}の こえ、おちつくなぁ。ボク、ねむく なってまうわ",
        "ゆっくり してってちょう、{who}。ボク、ここに おるでね",
        "{who}の てって、ぬくとくて だいすき だがね",
        "{who}、おちゃ のんで ええよ。ボク、まっとるでね",
        "ボク、{who}の となりが いちばん すきなんだわ",
        "しずかに そばに おるだけで、しあわせ だがね"
      ],
      [
        "{who}、いりゃあせ！ ボク、まっとったがね",
        "{who}、おみやげ ある？ ボク、においで わかるでよ",
        "ひざの うえ、のっても ええ？ ボク、{who}が すき だがね",
        "なでなで してちょう。{who}の てが いちばん きもちええがね",
        "{who}、ボクの なまえ よんでちょう。サクって！",
        "{who}、きょうは ながく おってくれる？ なあなあ",
        "おすわり できるよ！ {who}、みとってちょう。ほめてほしいがね",
        "{who}と あそぶの、ボク たのしみに しとったがね"
      ],
      [
        "{who}だー！ ボク、うれしくて とびついてまいそうだがね！",
        "{who}！ {who}！ ぐるぐる ぐる〜！ とまらんでよ！",
        "ボク、{who}が だいすきすぎて、こえが でてまうがね！",
        "{who}、きてくれて ありがとさん！ しっぽが ちぎれそうだがね！",
        "{who}に ぺろぺろ したいでよ！ うれしいがね！",
        "{who}、ボクの げい みてちょう！ ジャンプも できるでよ！",
        "{who}が きたら、おうち ぜんぶ ぴかぴか するみたいだがね！",
        "ボクの げんきパワー、{who}に ぜんぶ あげるでよ！"
      ]
    ],

    /* 12. いっしょにお出かけ */
    [
      [
        "{who}と ゆっくり あるくの、ボク すきなんだわ",
        "{who}の ペースで ええよ。ボク、あわせて あるくでね",
        "{who}の となりを あるくと、あんしん だがね",
        "ちょっと やすもまい、{who}。ボクも ひとやすみ するわ",
        "おひさま ぽかぽか。{who}と さんぽ、しあわせだがね",
        "{who}の くつの おと、ボク ききながら あるくでね",
        "ボク、{who}の よこに ぴったり くっついて あるくでよ",
        "のんびり あるくと、いろんな においが するがね"
      ],
      [
        "{who}、きょうは どこまで いく？ ボク、こうえんが ええなぁ",
        "{who}と おでかけ！ ボク、ちゃんと リード ひっぱらんでね",
        "{who}、あっちの みち いってみたいなぁ。ええ？",
        "{who}、えらくない？ ボク、ちょっと まっとったるでね",
        "ボク、{who}の まえを あるいて あんない するでね",
        "くさの におい、かいでも ええ？ {who}、ちょっとだけだで",
        "{who}と いっしょなら、どこでも たのしいがね",
        "かえったら、{who} なでなで してちょう。やくそく だがね"
      ],
      [
        "{who}と おでかけ！ ボク、うれしくて はしってまいそうだがね！",
        "{who}、はよ はよ！ ボクが せんとうを あるくでよ！",
        "{who}と さんぽ、ボクの いちばんの たのしみ だがね！",
        "ボク、{who}を まもる ボディガード だがね！ わん！",
        "{who}と いっしょで うれしくて しっぽが とまらんがね！",
        "あっち いこまい！ こっち いこまい！ {who}と ぜんぶ いきたいがね！",
        "{who}、みて みて！ ボク、ちょうちょ みつけたでよ！",
        "ボク、{who}と さんぽ できて でら さいこうの きぶん だがね！"
      ]
    ]
  ];

  /* =========================================================
     画面パーツ
     ========================================================= */
  var sceneList   = document.getElementById("sceneList");
  var toRecordBtn = document.getElementById("toRecordBtn");
  var cancelBtn   = document.getElementById("cancelBtn");
  var againBtn    = document.getElementById("againBtn");
  var meterBar    = document.getElementById("meterBar");
  var countText   = document.getElementById("countText");
  var recHint     = document.getElementById("recHint");
  var errorArea   = document.getElementById("errorArea");
  var stopBtn     = document.getElementById("stopBtn");
  var resultText  = document.getElementById("resultText");
  var moodText    = document.getElementById("moodText");
  var resultDog   = document.getElementById("resultDog");
  var recSceneTag = document.getElementById("recSceneTag");
  var resSceneTag = document.getElementById("resSceneTag");

  var screens = {
    who    : document.getElementById("screenWho"),
    select : document.getElementById("screenSelect"),
    record : document.getElementById("screenRecord"),
    loading: document.getElementById("screenLoading"),
    result : document.getElementById("screenResult")
  };

  var selectedScene = 0;
  var lastPick = {};          // おなじセリフの れんぞくを ふせぐ
  var audioCtx = null;
  var stream = null;
  var rafId = null;
  var timers = [];

  /* =========================================================
     だれが つかうか
     call = サクが よぶ なまえ / prefix = ときどき セリフの あたまに つける
     ========================================================= */
  var WHO = [
    { name:"じいちゃん", emo:"👨‍🦳", call:"じいちゃん", prefix:true  },
    { name:"とうちゃん", emo:"👨", call:"とうちゃん", prefix:true  },
    { name:"かあちゃん", emo:"👩", call:"かあちゃん", prefix:true  },
    { name:"なお",       emo:"👧", call:"なお", prefix:true  },
    { name:"ゆめ",       emo:"👧", call:"ゆめ", prefix:true  },
    { name:"その他の人", emo:"🐷", img:"buta-face.png", call:"きみ", prefix:false }
  ];
  var WHO_KEY = "saku-who";
  var whoList      = document.getElementById("whoList");
  var whoLabel     = document.getElementById("whoLabel");
  var whoChangeBtn = document.getElementById("whoChangeBtn");
  var selectedWho  = -1;      // まだ だれも えらんでいない ときは -1
  try{
    var saved = parseInt(localStorage.getItem(WHO_KEY), 10);
    if(saved >= 0 && saved < WHO.length){ selectedWho = saved; }
  }catch(e){}

  /* アイコン。img が あれば 絵を、なければ 絵文字を だす */
  function iconHtml(item, cls){
    if(item.img){
      return '<img class="' + cls + ' emo-img" src="' + item.img + '" alt="" aria-hidden="true">';
    }
    return '<span class="' + cls + '" aria-hidden="true">' + item.emo + '</span>';
  }

  /* えらぶ ボタンを ならべる(人えらび と 場面えらびで おなじ つくり) */
  function buildButtons(container, items, onPick){
    items.forEach(function(item, i){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "scene-btn";
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = iconHtml(item, "emo") + '<span>' + item.name + '</span>';
      b.addEventListener("click", function(){ onPick(i); });
      container.appendChild(b);
    });
  }
  function setPressed(container, index){
    var btns = container.querySelectorAll(".scene-btn");
    for(var k = 0; k < btns.length; k++){
      btns[k].setAttribute("aria-pressed", k === index ? "true" : "false");
    }
  }

  buildButtons(whoList, WHO, chooseWho);

  function currentWho(){
    return WHO[selectedWho] || WHO[WHO.length - 1];
  }
  function markWho(){
    setPressed(whoList, selectedWho);
    if(selectedWho < 0){
      whoLabel.textContent = "";
    }else{
      whoLabel.innerHTML = iconHtml(WHO[selectedWho], "who-icon") + " " + WHO[selectedWho].name + " だね！";
    }
  }
  function chooseWho(i){
    selectedWho = i;
    try{ localStorage.setItem(WHO_KEY, String(i)); }catch(e){}
    markWho();
    show("select");
    refreshDefaultScene();
  }
  markWho();
  whoChangeBtn.addEventListener("click", function(){ show("who"); });

  /* =========================================================
     場面ボタンを つくる
     ========================================================= */
  buildButtons(sceneList, SCENES, selectScene);

  function selectScene(i){
    selectedScene = i;
    setPressed(sceneList, i);
  }

  /* いまの じかんに あう 場面を さいしょから えらんでおく */
  function defaultSceneByTime(){
    var h = new Date().getHours();
    if(h >= 5  && h < 8)  return 0;   // 朝の散歩の前
    if(h >= 8  && h < 10) return 1;   // 朝ごはんの前
    if(h >= 10 && h < 15) return 2;   // お昼寝から起きたとき
    if(h >= 15 && h < 18) return 3;   // 夕方の散歩の前
    if(h >= 18 && h < 22) return 4;   // 夕ご飯のあと
    return 9;                          // なんでもないとき
  }
  var lastAutoScene = defaultSceneByTime();
  selectScene(lastAutoScene);

  /* アプリを ひらいたまま じかんたいが かわったら、おすすめの 場面を えらびなおす。
     じかんたいが おなじ あいだは、じぶんで えらんだ 場面を そのままに する */
  function refreshDefaultScene(){
    if(!screens.who.classList.contains("active") && !screens.select.classList.contains("active")){ return; }
    var d = defaultSceneByTime();
    if(d !== lastAutoScene){
      lastAutoScene = d;
      selectScene(d);
    }
  }

  /* =========================================================
     画面きりかえ
     ========================================================= */
  function show(name){
    for(var key in screens){
      screens[key].classList.toggle("active", key === name);
    }
    window.scrollTo(0, 0);
  }

  function clearTimers(){
    timers.forEach(function(t){ clearTimeout(t); });
    timers = [];
  }
  function later(fn, ms){
    timers.push(setTimeout(fn, ms));
  }

  /* =========================================================
     ろくおん + 音の おおきさ しらべ
     ========================================================= */
  var REC_MS = 10000;         // １０びょう
  var SILENCE = 0.012;        // これより 小さいと「きこえない」
  var VOICE_MIN = 0.02;       // 「ないている」とみなす おおきさ
  var FULL_SEC = 3;           // これだけ ないたら 「いっぱい ないた」と みなす
  var LOUD_FULL = 0.25;       // これだけ 大きければ 「とても 大きい こえ」と みなす
  var HEARD_MIN_SEC = 0.1;    // これより みじかい 音は 「ものおと」と みなして きこえない あつかい
  var SMOOTH_SEC = 0.08;      // 大きさを ならす ながさ(いっしゅんの ものおとに だまされない ため)
  var stopEarly = false;      // とちゅうで おわりボタンが おされたか
  var recSession = 0;         // ろくおんの ばんごうふだ(やめた あとの ろくおんを ふせぐ)
  var pendingMic = false;     // マイクの きょかを まっている とちゅうか

  function startRecording(){
    errorArea.innerHTML = "";
    meterBar.style.width = "0%";
    stopEarly = false;
    // 「これで おわり」は ろくおんが ほんとうに はじまるまで かくしておく
    stopBtn.style.display = "none";
    countText.textContent = String(Math.round(REC_MS / 1000));
    recHint.textContent = "マイクに ちかづけて…";
    recSceneTag.textContent = sceneLabel();
    show("record");

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      if(window.isSecureContext === false){
        // http:// など あんぜんでない ひらきかただと、ブラウザが マイクを つかわせて くれない
        showError("この ひらきかたでは マイクが つかえません。<br>「https://」で はじまる アドレスで ひらいてね。");
      }else{
        showError("このブラウザでは マイクが つかえないみたい。<br>Safari か Chrome で ひらいてみてね。");
      }
      return;
    }

    // 音を しらべる しくみは、ボタンを おした その しゅんかんに うごかしておく。
    // (iPhone は、おした あと すこし たってから うごかすと とまったままに なることがある)
    stopMic();
    try{
      var Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
      resumeAudio();
    }catch(e){
      audioCtx = null;
      showError("このブラウザでは 音を しらべられないみたい。<br>Safari か Chrome で ひらいてみてね。");
      return;
    }

    // ばんごうふだを 1まい すすめて、じぶんの ばんごうを おぼえておく
    var mySession = ++recSession;
    pendingMic = true;

    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    }).then(function(s){
      pendingMic = false;
      if(mySession !== recSession){
        // きょかを まってる あいだに「やめる」などが おされていたら、
        // うけとった マイクは つかわずに すぐ とめる
        s.getTracks().forEach(function(t){ t.stop(); });
        return;
      }
      stream = s;
      analyze();
    }).catch(function(err){
      pendingMic = false;
      if(mySession !== recSession){ return; }
      // じゅんびの とちゅうで しっぱいした ときも、マイクを つけっぱなしに しない
      stopMic();
      stopBtn.style.display = "none";
      var msg = "マイクが つかえませんでした。";
      if(err && (err.name === "NotAllowedError" || err.name === "SecurityError")){
        msg = "マイクの きょかが もらえませんでした。<br>ブラウザの ひょうじで「きょかする」を えらんでね。";
      }else if(err && err.name === "NotFoundError"){
        msg = "マイクが みつかりませんでした。";
      }
      showError(msg);
    });
  }

  function showError(html){
    errorArea.innerHTML =
      '<div class="error-box">' + html +
      '<button class="big-btn" id="retryBtn" style="margin-top:14px">もう一回 ためす</button></div>';
    countText.textContent = "…";
    recHint.textContent = "";
    var r = document.getElementById("retryBtn");
    if(r){ r.addEventListener("click", startRecording); }
  }

  function resumeAudio(){
    if(audioCtx && audioCtx.state === "suspended" && audioCtx.resume){
      var p = audioCtx.resume();
      if(p && p.catch){ p.catch(function(){}); }
    }
  }

  function analyze(){
    resumeAudio();

    var source = audioCtx.createMediaStreamSource(stream);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    var buf = new Float32Array(analyser.fftSize);
    var byteBuf = analyser.getFloatTimeDomainData ? null : new Uint8Array(analyser.fftSize);  // ふるい ブラウザよう
    var levels = [];       // 1かい ごとの 音の おおきさ(おわってから まとめて しらべる)
    var startAt = performance.now();

    // ここから ろくおん。きょかを まっている あいだに おされた ぶんは なかった ことに する
    stopEarly = false;
    stopBtn.style.display = "block";

    (function loop(){
      var now = performance.now();
      var passed = now - startAt;

      if(!byteBuf){
        analyser.getFloatTimeDomainData(buf);
      }else{
        analyser.getByteTimeDomainData(byteBuf);
        for(var j = 0; j < byteBuf.length; j++){ buf[j] = (byteBuf[j] - 128) / 128; }
      }

      var sum = 0;
      for(var i = 0; i < buf.length; i++){ sum += buf[i] * buf[i]; }
      var rms = Math.sqrt(sum / buf.length);

      levels.push(rms);

      meterBar.style.width = Math.min(100, Math.round(rms * 420)) + "%";

      var rest = Math.ceil((REC_MS - passed) / 1000);
      countText.textContent = rest > 0 ? String(rest) : "0";
      if(passed > 900 && passed < REC_MS){
        recHint.textContent = "サク、なにか はなして〜(おわったら「これで おわり」)";
      }

      if(passed < REC_MS && !stopEarly){
        rafId = requestAnimationFrame(loop);
      }else{
        stopMic();
        stopBtn.style.display = "none";
        finish(measure(levels, passed / 1000));
      }
    })();
  }

  /* ろくおんした 音の おおきさの ならびから、
     loud  = ならした あとの いちばん 大きい 音
     voiced= 「ないていた」ながさ(びょう)
     heard = なにか きこえていた ながさ(びょう)  を もとめる */
  function measure(levels, sec){
    var n = levels.length;
    var fps = sec > 0 ? n / sec : 0;
    // ろくおんが とても みじかくても、あつまった ぶんだけで ならす
    var win = Math.max(1, Math.min(n, Math.round(fps * SMOOTH_SEC)));
    var loud = 0, voiced = 0, heard = 0, sum = 0;
    for(var i = 0; i < n; i++){
      if(levels[i] > VOICE_MIN){ voiced++; }
      if(levels[i] > SILENCE){ heard++; }
      // win かいぶんの へいきんを とって、いっしゅんだけの 音を ならす
      sum += levels[i];
      if(i >= win){ sum -= levels[i - win]; }
      if(i >= win - 1 && sum / win > loud){ loud = sum / win; }
    }
    return {
      loud  : loud,
      voiced: fps > 0 ? voiced / fps : 0,
      heard : fps > 0 ? heard / fps : 0
    };
  }

  function stopMic(){
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
    if(stream){
      stream.getTracks().forEach(function(t){ t.stop(); });
      stream = null;
    }
    if(audioCtx){
      var c = audioCtx;
      audioCtx = null;
      try{
        var p = c.close();
        if(p && p.catch){ p.catch(function(){}); }   // しっぱいしても きにしない
      }catch(e){}
    }
  }

  /* 音の おおきさ と ないていた ながさ から 3だんかいに わける。
     ながさ だけでは 「大こうふん」に とどかない(さいだい 0.4)ように してある。
     小さい 音は ながく つづいても あまり かぞえない(テレビや はなしごえ たいさく) */
  function judgeLevel(loud, voicedSec){
    var l = Math.min(1, loud / LOUD_FULL);
    var d = Math.min(1, voicedSec / FULL_SEC) * Math.min(1, l / 0.3);
    var score = l * 0.6 + d * 0.4;
    if(score < 0.25) return 0;  // おだやか
    if(score < 0.6)  return 1;  // ふつう
    return 2;                   // 大こうふん
  }

  function finish(m){
    show("loading");
    later(function(){
      if(m.loud < SILENCE || m.heard < HEARD_MIN_SEC){
        showResult(null, null);
      }else{
        var lv = judgeLevel(m.loud, m.voiced);
        showResult(lv, pickLine(selectedScene, lv));
      }
    }, 2000);
  }

  /* おなじセリフが つづかないように ランダムで えらぶ */
  function pickLine(scene, level){
    var arr = LINES[scene][level];
    var key = scene + "-" + level;
    var i = Math.floor(Math.random() * arr.length);
    if(arr.length > 1 && lastPick[key] === i){
      i = (i + 1 + Math.floor(Math.random() * (arr.length - 1))) % arr.length;
    }
    lastPick[key] = i;
    return withWho(arr[i]);
  }

  /* {who} を よびかたに かえる。ない セリフは ときどき なまえを あたまに つける */
  function withWho(line){
    var w = currentWho();
    if(line.indexOf("{who}") !== -1){
      return line.split("{who}").join(w.call);
    }
    if(w.prefix && !SCENES[selectedScene].noPrefix && Math.random() < 0.3){
      return w.call + "、" + line;
    }
    return line;
  }

  function sceneLabel(){
    return SCENES[selectedScene].emo + " " + SCENES[selectedScene].name;
  }

  function showResult(level, line){
    resSceneTag.textContent = sceneLabel();
    if(level === null){
      resultDog.textContent = "🐕‍🦺";
      resultText.textContent = "ごめんなぁ、こえが 小さくて きこえんかったがね…\nもう いっぺん たのむわ！";
      moodText.innerHTML = "";
    }else{
      resultDog.textContent = LEVEL_EMOJI[level];
      resultText.textContent = "「" + line + "」";
      moodText.innerHTML = "いまの きもち<span class=\"badge\">" + LEVEL_NAMES[level] + "</span>";
    }
    show("result");
  }

  /* =========================================================
     ボタンの うごき
     ========================================================= */
  toRecordBtn.addEventListener("click", startRecording);

  // とちゅうで ろくおんを おわらせて、そのまま ほんやくする
  stopBtn.addEventListener("click", function(){
    stopEarly = true;
  });

  cancelBtn.addEventListener("click", function(){
    clearTimers();
    stopEarly = true;
    recSession++;            // ばんごうふだを かえて、まちの ろくおんを むこうに する
    stopMic();
    stopBtn.style.display = "block";
    show("select");
  });

  againBtn.addEventListener("click", function(){
    clearTimers();
    show("select");
    refreshDefaultScene();
  });

  // 画面を とじたり ほかのアプリに いったら マイクを かならず とめる。
  // ろくおんの とちゅうだった ときは、もどってきたときに こまらないよう
  // さいしょの 画面(場面えらび)に もどしておく
  function stopAndReset(){
    // ろくおん中 だけでなく、マイクの きょかを まっている あいだも ふくめる
    var wasRecording = (rafId !== null || stream !== null || pendingMic);
    recSession++;            // まちの ろくおんを むこうに する
    stopMic();
    if(wasRecording){
      clearTimers();
      stopEarly = true;
      stopBtn.style.display = "block";
      show("select");
    }
  }
  document.addEventListener("visibilitychange", function(){
    if(document.hidden){ stopAndReset(); }
    else{ refreshDefaultScene(); }
  });
  window.addEventListener("pagehide", stopAndReset);

})();
