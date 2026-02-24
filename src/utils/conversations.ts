export interface DialogueChoice {
  label: string;
  response: { speaker: string; text: string };
}

export interface DialogueNode {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}

export interface ConversationPoint {
  id: string;
  position: [number, number, number];
  triggerRadius: number;
  dialogue: {
    bichon: DialogueNode[];
    sentinel: DialogueNode[];
  };
  color: string;
}

export const CONVERSATION_POINTS: ConversationPoint[] = [
  {
    id: "intersection-east",
    position: [30, 0, 0],
    triggerRadius: 6,
    color: "#00ffff",
    dialogue: {
      bichon: [
        { speaker: "光のかけら", text: "わぁ、もふもふだ！こんにちは！散歩中？この街、意外といい天気でしょ。" },
        { speaker: "光のかけら", text: "ねえねえ、きみはお散歩してる時、何を考えてるの？" },
        {
          speaker: "光のかけら",
          text: "正直に教えて？",
          choices: [
            {
              label: "おやつのことだけ！",
              response: { speaker: "光のかけら", text: "あはは！最高だね。今を楽しむ天才だよきみは。おやつは世界を平和にするよね！" },
            },
            {
              label: "風の匂いを楽しんでる",
              response: { speaker: "光のかけら", text: "素敵！きみは小さな詩人だね。風の中にある物語、人間にはなかなか気づけないんだよ。" },
            },
          ],
        },
      ],
      sentinel: [
        { speaker: "光のかけら", text: "おっ、かっこいいのが来た！その装備、ピカピカだね。お手入れしてるんだ。" },
        { speaker: "光のかけら", text: "こんな穏やかな街で戦士って、ちょっと贅沢じゃない？でも似合ってるよ。" },
        {
          speaker: "光のかけら",
          text: "休みの日は何するの？",
          choices: [
            {
              label: "ずっとパトロールしてる",
              response: { speaker: "光のかけら", text: "真面目か！でもそういう人がいるから、みんな安心して暮らせるんだよね。ありがとう！" },
            },
            {
              label: "実は猫カフェに行く",
              response: { speaker: "光のかけら", text: "ギャップ最高すぎる！強面の戦士が猫にデレデレ…想像しただけで幸せになった。" },
            },
          ],
        },
      ],
    },
  },
  {
    id: "intersection-northeast",
    position: [30, 0, -60],
    triggerRadius: 6,
    color: "#ff00ff",
    dialogue: {
      bichon: [
        { speaker: "星読み", text: "あらあら、かわいいお客さん。きみの毛並み、星空みたいにふわふわね。" },
        { speaker: "星読み", text: "この街の夜空は最高よ。ビルの隙間から見る星って、額縁に入った絵みたいで素敵なの。" },
        {
          speaker: "星読み",
          text: "きみが星になれるとしたら、どんな星がいい？",
          choices: [
            {
              label: "一番明るい星！",
              response: { speaker: "星読み", text: "もちろん！きみはもう十分みんなを照らしてるわよ。その笑顔がね。" },
            },
            {
              label: "誰かのそばで光る小さな星",
              response: { speaker: "星読み", text: "やさしいのね。一番大切な星は、一番近くにある星だって知ってるのね。" },
            },
          ],
        },
      ],
      sentinel: [
        { speaker: "星読み", text: "あら、頼もしい方。星の導きがきみをここへ連れてきたのかしら。" },
        { speaker: "星読み", text: "夜空を見上げたことある？戦いの後の星空って、特別きれいに見えるものよ。" },
        {
          speaker: "星読み",
          text: "きみの好きな時間帯は？",
          choices: [
            {
              label: "朝。新しい一日の始まり",
              response: { speaker: "星読み", text: "希望を信じる戦士ね。朝日を見るために戦うなんて、最高にロマンチックよ。" },
            },
            {
              label: "夕暮れ。一日を終える時",
              response: { speaker: "星読み", text: "今日も無事だったって安心する時間ね。きみの夕暮れが、いつも穏やかでありますように。" },
            },
          ],
        },
      ],
    },
  },
  {
    id: "street-south",
    position: [0, 0, 30],
    triggerRadius: 6,
    color: "#ffaa00",
    dialogue: {
      bichon: [
        { speaker: "旅の音楽家", text: "おっ、ちょうどいい！新曲のテストリスナー探してたんだ。きみ音楽わかる？" },
        { speaker: "旅の音楽家", text: "尻尾振ってくれるなら100点ってことにしよう。きみの審査、世界一やさしいよ。" },
        {
          speaker: "旅の音楽家",
          text: "どんな曲が聴きたい？",
          choices: [
            {
              label: "元気が出る曲！",
              response: { speaker: "旅の音楽家", text: "OK！♪ タッタカタッタ〜♪ …きみが走り出したくなる曲、完成！タイトルは「もふもふダッシュ」！" },
            },
            {
              label: "のんびりした曲",
              response: { speaker: "旅の音楽家", text: "いいね〜♪ ふわふわ〜ん ♪ …これは「昼寝のワルツ」。きみの寝顔を想像して作ったよ。" },
            },
          ],
        },
      ],
      sentinel: [
        { speaker: "旅の音楽家", text: "おお、すごい迫力！でも大丈夫、俺は武器じゃなくてギターで戦うタイプだから。" },
        { speaker: "旅の音楽家", text: "音楽ってさ、どんな鎧も貫通するんだよね。心に直接届くから。" },
        {
          speaker: "旅の音楽家",
          text: "きみのテーマソング作ってあげようか？",
          choices: [
            {
              label: "ヒーローっぽいやつ",
              response: { speaker: "旅の音楽家", text: "ジャジャジャーン！♪ 「鋼鉄のやさしさ」！かっこよくて、でもどこかあったかい曲。きみにぴったりだ！" },
            },
            {
              label: "静かなバラード",
              response: { speaker: "旅の音楽家", text: "♪ しんしん…♪ 「星を数える戦士」。戦いの後、空を見上げるきみの曲。泣けるぜこれ。" },
            },
          ],
        },
      ],
    },
  },
  {
    id: "robot-west",
    position: [-30, 0, 0],
    triggerRadius: 6,
    color: "#8040ff",
    dialogue: {
      bichon: [
        { speaker: "ロボ R-77", text: "ピピッ！もふもふ生命体を検知！かわいさレベル…計測不能！オーバーフロー！やばい！" },
        { speaker: "ロボ R-77", text: "ねえねえ、しっぽの回転数すごいね！毎分何回転？私のプロペラより速いかも！" },
        {
          speaker: "ロボ R-77",
          text: "ところでお願いがあるんだけど…なでさせてくれない？",
          choices: [
            {
              label: "いいよ！なでなで！",
              response: { speaker: "ロボ R-77", text: "わーーー！！もっふもふ！！センサー全部幸せで埋まった！今日は記念日にする！「もふもふ記念日」！" },
            },
            {
              label: "おやつくれたらね",
              response: { speaker: "ロボ R-77", text: "おやつ！？待って、腕のコンパートメントに…ボルトしかない！今度絶対おやつ持ってくるから予約させて！" },
            },
          ],
        },
      ],
      sentinel: [
        { speaker: "ロボ R-77", text: "おおっ！超カッコいいの来た！スキャン中…装備ピカピカ！鎧のツヤ、私のボディより上！メンテの秘訣教えて！" },
        { speaker: "ロボ R-77", text: "私はR-77！この街の元気担当ロボ！毎日ここで通行人にハイタッチしてるの。今日は3人目だよ、きみ！" },
        {
          speaker: "ロボ R-77",
          text: "ハイタッチしよ！どっちの手がいい？",
          choices: [
            {
              label: "右手！",
              response: { speaker: "ロボ R-77", text: "パァン！！いい音！！今日イチのハイタッチ！きみの手あったかいね。私のは金属だから冷たくてごめんね、えへへ。" },
            },
            {
              label: "両手でしよう",
              response: { speaker: "ロボ R-77", text: "ダブル！？贅沢！パパァン！！最高記録更新！きみ天才だよ！また来てね、待ってるから！" },
            },
          ],
        },
      ],
    },
  },
];

export function checkConversationProximity(
  playerX: number,
  playerZ: number,
  points: ConversationPoint[],
): string | null {
  for (const point of points) {
    const dx = playerX - point.position[0];
    const dz = playerZ - point.position[2];
    const distSq = dx * dx + dz * dz;
    if (distSq < point.triggerRadius * point.triggerRadius) {
      return point.id;
    }
  }
  return null;
}
