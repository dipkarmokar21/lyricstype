// ═══════════════════════════════════════════════════════════════
// Phonetic Romanizer — High-Accuracy Banglish, Hinglish, Romaji, Hangul, etc.
// Converts non-English scripts into natural English-keyboard phonetics
// ═══════════════════════════════════════════════════════════════

// ── Bengali -> Banglish ───────────────────────────────────────
const BN_VOWELS = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u',
  'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
};

const BN_MATRAS = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri',
  'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
};

const BN_CONSONANTS = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
  'স': 's', 'হ': 'h', '\u09DC': 'r', '\u09DD': 'rh', '\u09DF': 'y',
  'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
};

const BN_NO_INHERENT = new Set(['ৎ', 'ং', 'ঃ', 'ঁ']);
const BN_HASANTA = '্';

// Curated high-frequency Bengali song words -> exact natural Banglish
const BN_WORDS = {
  'আমি': 'ami', 'আমার': 'amar', 'আমায়': 'amay', 'আমাকে': 'amake', 'আমরা': 'amra',
  'তুমি': 'tumi', 'তোমার': 'tomar', 'তোমায়': 'tomay', 'তোমাকে': 'tomake', 'তোমরা': 'tomra',
  'সে': 'she', 'তার': 'tar', 'তাকে': 'take', 'তারা': 'tara', 'তাদের': 'tader',
  'এই': 'ei', 'ওই': 'oi', 'সেই': 'shei', 'যে': 'je', 'যেন': 'jeno', 'কেন': 'keno', 'হেন': 'heno',
  'কি': 'ki', 'কী': 'ki', 'কে': 'ke', 'কার': 'kar', 'কাকে': 'kake', 'কোথায়': 'kothay',
  'এখন': 'ekhon', 'এখনো': 'ekhono', 'তখন': 'tokhon', 'তখনো': 'tokhono', 'কখনো': 'kokhono',
  'সব': 'sob', 'সবাই': 'sobai', 'সবটুকু': 'sobtuku', 'সবসময়': 'shobshomoy', 'সবকিছু': 'sobkichu',
  'কিছু': 'kichu', 'শুধু': 'shudhu', 'মতো': 'moto', 'মত': 'moto', 'হয়তো': 'hoyto',
  'ভালো': 'bhalo', 'ভাল': 'bhalo', 'ভালোবাসা': 'bhalobasha', 'ভালোবাসি': 'bhalobashi', 'ভালোবাসো': 'bhalobasho',
  'হৃদয়': 'hridoy', 'হৃদয়ে': 'hridoye', 'মন': 'mon', 'মনে': 'mone', 'মনের': 'moner',
  'জীবন': 'jibon', 'জীবনে': 'jibone', 'মরণ': 'moron', 'সময়': 'shomoy', 'পৃথিবী': 'prithibi',
  'কথা': 'kotha', 'ব্যথা': 'byatha', 'অপেক্ষা': 'opekkha', 'ভুল': 'bhul', 'ভুলে': 'bhule',
  'সুখ': 'shukh', 'সুখে': 'shukhe', 'দুঃখ': 'dukkho', 'বন্ধু': 'bondhu', 'প্রেম': 'prem',
  'আকাশ': 'akash', 'বাতাস': 'batash', 'বৃষ্টি': 'brishti', 'মেঘ': 'megh', 'তারা': 'tara',
  'চাঁদ': 'chad', 'সূর্য': 'shurjo', 'আলো': 'alo', 'অন্ধকার': 'ondhokar', 'ছায়া': 'chaya', 'মায়া': 'maya',
  'রাত': 'raat', 'রাতে': 'rate', 'দিন': 'din', 'সকাল': 'shokal', 'সন্ধ্যা': 'shondhya', 'বিকেল': 'bikel',
  'স্বপ্ন': 'shopno', 'স্বপ্নে': 'shopne', 'চোখ': 'chokh', 'চোখে': 'chokhe', 'অশ্রু': 'oshru',
  'হাসি': 'hashi', 'কান্না': 'kanna', 'গল্প': 'golpo', 'গান': 'gaan', 'সুর': 'shur',
  'নদী': 'nodi', 'সাগর': 'shagor', 'পাহাড়': 'pahar', 'ফুল': 'phul', 'পাখি': 'pakhi',
  'একলা': 'ekla', 'একা': 'eka', 'সাথে': 'shathe', 'পাশে': 'pashe', 'কাছে': 'kache', 'দূরে': 'dure',
  'আছে': 'ache', 'নেই': 'nei', 'নাই': 'nai', 'ছিল': 'chilo', 'হবে': 'hobe', 'হয়ে': 'hoye', 'হয়েছে': 'hoyeche',
  'করে': 'kore', 'করেছে': 'koreche', 'বলে': 'bole', 'বলেছে': 'boleche',
  'দিয়ে': 'diye', 'দিয়েছে': 'diyeche', 'নিয়ে': 'niye', 'নিয়েছে': 'niyeche',
  'গেছে': 'geche', 'এসেছে': 'esheche', 'থাকবে': 'thakbe', 'থাকি': 'thaki', 'থাকো': 'thako',
  'চাই': 'chai', 'চাও': 'chao', 'পাই': 'pai', 'পাও': 'pao', 'জানি': 'jani', 'জানো': 'jano',
  'বুঝি': 'bujhi', 'বুঝো': 'bujho', 'দেখি': 'dekhi', 'দেখো': 'dekho', 'শুনি': 'shuni', 'শোনো': 'shono',
  'ভাবি': 'bhabi', 'ভাবো': 'bhabo', 'লাগে': 'lage', 'লাগছে': 'lagche',
  'ফিরে': 'phire', 'চলে': 'chole', 'থেমে': 'theme', 'বসে': 'boshe',
  'কৃতজ্ঞতা': 'kritoggota', 'অপ্রাপ্তিটাই': 'opraptitai', 'পরিতৃপ্ত': 'poritripto',
  'উৎসর্গ': 'utshorgo', 'বিশ্বাস': 'bishas', 'নিঃশ্বাস': 'nishash', 'শ্বাস': 'shash',
  'জন্য': 'jonno', 'অন্য': 'onno', 'সত্য': 'shotto', 'মিথ্যা': 'mittha',
  'ধন্যবাদ': 'dhonnobad', 'অনুভূতি': 'onubhuti', 'অনুভূতির': 'onubhutir',
};

// ── Hindi / Devanagari -> Hinglish ────────────────────────────
const HI_VOWELS = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
};

const HI_MATRAS = {
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
};

const HI_CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h',
  'ड़': 'r', 'ढ़': 'rh', 'ज़': 'z', 'फ़': 'f', 'क़': 'q', 'ख़': 'kh', 'ग़': 'g',
};

const HI_HALANT = '्';

// ── Japanese Hiragana/Katakana -> Romaji ──────────────────────
const JP_KANA = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'ワ':'wa','ヲ':'wo','ン':'n',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  'ー':'', 'っ':'', 'ッ':'',
};

const KO_CHOSEONG = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const KO_JUNGSEONG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const KO_JONGSEONG = ['','k','k','ks','n','nj','nh','t','l','lk','lm','lb','ls','lt','lp','lh','m','p','ps','t','t','ng','t','t','k','t','p','t'];

const CYRILLIC = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y',
  'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
  'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
};

const ARABIC = {
  'ا':'a','أ':'a','إ':'i','آ':'aa','ب':'b','پ':'p','ت':'t','ٹ':'t','ث':'th','ج':'j','چ':'ch',
  'ح':'h','خ':'kh','د':'d','ڈ':'d','ذ':'dh','ر':'r','ڑ':'r','ز':'z','ژ':'zh','س':'s','ش':'sh',
  'ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ک':'k','ك':'k','گ':'g',
  'ل':'l','م':'m','ن':'n','ں':'n','و':'o','ہ':'h','ه':'h','ھ':'h','ء':'','ی':'y','ي':'y','ے':'e',
};

function precleanBengali(word) {
  return word
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Recompose Bengali nukta pairs (NFC leaves them decomposed due to Unicode Composition Exclusion)
    .replace(/\u09AF\u09BC/g, '\u09DF')
    .replace(/\u09A1\u09BC/g, '\u09DC')
    .replace(/\u09A2\u09BC/g, '\u09DD')
    .replace(/\u09BC/g, '')
    // Common natural Banglish conjuncts
    .replace(/ক্ষ/g, 'খ')
    .replace(/জ্ঞ/g, 'গ্গ')
    .replace(/ঙ্গ/g, 'ঙ')
    .replace(/ঙ্ক/g, 'ংক')
    .replace(/হ্ম/g, 'ম্ম');
}

function precleanHindi(word) {
  return word
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/क्ष/g, 'क्श')
    .replace(/ज्ञ/g, 'ग्य');
}

function romanizeIndicWord(word, vowels, matras, consonants, virama, inherentVowel, isBengali = false) {
  let out = '';
  const chars = [...word];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (vowels[ch]) {
      out += vowels[ch];
    } else if (consonants[ch]) {
      // Handle Bengali ya-phala (C + ্ + য)
      // Word-start (ব্যথা -> byatha): C + y; Mid-word (অন্য -> onno, সত্য -> shotto): doubles consonant
      if (isBengali && next === virama && chars[i + 2] === 'য') {
        if (i === 0) {
          out += consonants[ch] + 'y';
        } else {
          out += consonants[ch] + consonants[ch];
        }
        i += 2;
        const afterYa = chars[i + 1];
        if (matras[afterYa]) {
          out += matras[afterYa];
          i++;
        } else if (afterYa && (consonants[afterYa] || vowels[afterYa])) {
          out += inherentVowel;
        } else if (!afterYa) {
          out += inherentVowel;
        }
        continue;
      }

      // Handle Bengali ba-phala (C + ্ + ব)
      if (isBengali && next === virama && chars[i + 2] === 'ব') {
        if (ch === 'ম') {
          out += 'mb';
        } else if (i === 0) {
          out += ch === 'স' ? 'sh' : consonants[ch];
        } else {
          out += consonants[ch];
        }
        i += 2;
        const afterBa = chars[i + 1];
        if (matras[afterBa]) {
          out += matras[afterBa];
          i++;
        } else if (afterBa && (consonants[afterBa] || vowels[afterBa])) {
          out += inherentVowel;
        }
        continue;
      }

      out += consonants[ch];

      if (next === virama) {
        i++; // suppress inherent vowel
        // Trailing conjunct at end of Bengali word (e.g. স্বপ্ন -> shopno, আনন্দ -> anondo)
        if (isBengali && i + 1 === chars.length - 1 && consonants[chars[i + 1]]) {
          out += consonants[chars[i + 1]] + inherentVowel;
          i++;
        }
      } else if (matras[next]) {
        out += matras[next];
        i++;
      } else if (next && (consonants[next] || vowels[next]) && i < chars.length - 1 && !BN_NO_INHERENT.has(ch)) {
        const nextNext = chars[i + 2];
        const prevWasVirama = i > 0 && chars[i - 1] === virama;
        const prevHadInherentO = out.endsWith('o' + consonants[ch]);
        const nextHasMatra = nextNext && (matras[nextNext] || nextNext === virama);
        if (isBengali && !prevWasVirama && (prevHadInherentO || (i > 0 && nextHasMatra))) {
          // suppress schwa
        } else {
          out += inherentVowel;
        }
      }
    } else if (matras[ch]) {
      out += matras[ch];
    } else if (ch !== virama) {
      out += ch;
    }
  }
  return out;
}

export function hasNonAscii(text = '') {
  return /[^\x00-\x7F]/.test(text);
}

export function romanizeLine(line = '') {
  if (!line) return '';

  const cleaned = line
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  if (!hasNonAscii(cleaned)) return cleaned;

  return cleaned
    .split(/(\s+|[.,!?;:'"()\-–—।]+)/)
    .map((token) => {
      if (!token) return '';
      if (/^[\s.,!?;:'"()\-–—।]+$/.test(token)) {
        return token
          .replace(/।/g, '.')
          .replace(/[–—]/g, '-')
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"');
      }

      // Bengali block \u0980-\u09FF
      if (/[\u0980-\u09FF]/.test(token)) {
        const rawClean = token.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u09AF\u09BC/g, '\u09DF').replace(/\u09A1\u09BC/g, '\u09DC').replace(/\u09A2\u09BC/g, '\u09DD');
        if (BN_WORDS[rawClean]) return BN_WORDS[rawClean];
        const w = precleanBengali(rawClean);
        if (BN_WORDS[w]) return BN_WORDS[w];
        return romanizeIndicWord(w, BN_VOWELS, BN_MATRAS, BN_CONSONANTS, BN_HASANTA, 'o', true);
      }

      // Devanagari block \u0900-\u097F
      if (/[\u0900-\u097F]/.test(token)) {
        const w = precleanHindi(token);
        return romanizeIndicWord(w, HI_VOWELS, HI_MATRAS, HI_CONSONANTS, HI_HALANT, 'a', false);
      }

      let out = '';
      for (const ch of token) {
        const code = ch.charCodeAt(0);

        if (code >= 0xAC00 && code <= 0xD7A3) {
          const sIdx = code - 0xAC00;
          const cho = Math.floor(sIdx / 588);
          const jung = Math.floor((sIdx % 588) / 28);
          const jong = sIdx % 28;
          out += KO_CHOSEONG[cho] + KO_JUNGSEONG[jung] + KO_JONGSEONG[jong];
        } else if (JP_KANA[ch] !== undefined) {
          out += JP_KANA[ch];
        } else if (CYRILLIC[ch.toLowerCase()] !== undefined) {
          const mapped = CYRILLIC[ch.toLowerCase()];
          out += ch === ch.toUpperCase() ? mapped.toUpperCase() : mapped;
        } else if (ARABIC[ch] !== undefined) {
          out += ARABIC[ch];
        } else {
          out += ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
      }
      return out;
    })
    .join('')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function romanizeLines(lines = []) {
  return lines.map((l) => romanizeLine(l)).filter(Boolean);
}
