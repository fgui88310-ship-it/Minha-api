export const transformations = [
  {
    name: "Circled",
    map: c => c.replace(/[A-Za-z0-9]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → Ⓐ (U+24B6)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x24B6);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → ⓐ (U+24D0)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x24D0);
      } else if (/[0-9]/.test(ch)) {
        // 0 → ⓪ (U+24EA), 1 → ① (U+2460) ... 9 → ⑨ (U+2468)
        return ch === "0"
          ? String.fromCodePoint(0x24EA)
          : String.fromCodePoint(parseInt(ch) - 1 + 0x2460);
      }
      return ch;
    })
  },
  {
    name: "Fullwidth",
    map: c => c.replace(/[A-Za-z0-9]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) + 0xFF00 - 0x20)
    )
  },
  {
    name: "Math bold",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝐀 (U+1D400)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D400);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝐚 (U+1D41A)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D41A);
      }
      return ch;
    })
  },
  {
    name: "Math bold italic",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝑨 (U+1D434)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D434);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝑎 (U+1D44E)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D44E);
      }
      return ch;
    })
  },
  {
    name: "Small Caps",
    map: c => {
      const map = {
        a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
        i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
        q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
        y: "ʏ", z: "ᴢ"
      };
      return c.toLowerCase().split('').map(ch => map[ch] || ch).join('');
    }
  },
  {
    name: "Math Fraktur",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝔄 (U+1D504)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D504);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝔞 (U+1D51E)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D51E);
      }
      return ch;
    })
  },
  {
    name: "Bold Fraktur",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝕬 (U+1D56C)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D56C);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝖆 (U+1D586)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D586);
      }
      return ch;
    })
  },
  {
    name: "Double Struck",
    map: c => c.replace(/[A-Za-z0-9]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝔸 (U+1D538)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D538);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝕒 (U+1D552)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D552);
      } else if (/[0-9]/.test(ch)) {
        // 0=48 → 𝟘 (U+1D7D8)
        return String.fromCodePoint(ch.charCodeAt(0) - 48 + 0x1D7D8);
      }
      return ch;
    })
  },
  {
    name: "Math Script",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝒜 (U+1D49C)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D49C);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝒶 (U+1D4B6)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D4B6);
      }
      return ch;
    })
  },
  {
    name: "Bold Script",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝓐 (U+1D4D0)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D4D0);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝓪 (U+1D4EA)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D4EA);
      }
      return ch;
    })
  },
  {
  name: "Monospace",
  map: c => c.replace(/[A-Za-z0-9]/g, ch => {
    if (/[A-Z]/.test(ch)) {
      return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D670);
    } else if (/[a-z]/.test(ch)) {
      return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D68A);
    } else if (/[0-9]/.test(ch)) {
      return String.fromCodePoint(ch.charCodeAt(0) - 48 + 0x1D7F6);
    }
    return ch;
  })
}, 
  {
    name: "Superscript",
    map: c => {
      const map = {
        a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ",
        i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ",
        q: "q", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ",
        y: "ʸ", z: "ᶻ", A: "ᴬ", B: "ᴮ", C: "ᶜ", D: "ᴰ", E: "ᴱ", F: "ᶠ",
        G: "ᴳ", H: "ᴴ", I: "ᴵ", J: "ᴶ", K: "ᴷ", L: "ᴸ", M: "ᴹ", N: "ᴺ",
        O: "ᴼ", P: "ᴾ", Q: "Q", R: "ᴿ", S: "S", T: "ᵀ", U: "ᵁ", V: "V",
        W: "ᵂ", X: "X", Y: "Y", Z: "ᶻ", 0: "⁰", 1: "¹", 2: "²", 3: "³",
        4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹"
      };
      return c.split('').map(ch => map[ch] || ch).join('');
    }
  },
  {
    name: "Subscript",
    map: c => {
      const map = {
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ",
        x: "ₓ", 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆",
        7: "₇", 8: "₈", 9: "₉"
      };
      return c.split('').map(ch => map[ch] || ch).join('');
    }
  },
  {
    name: "Squared",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      const map = {
        A: "🄰", B: "🄱", C: "🄲", D: "🄳", E: "🄴", F: "🄵", G: "🄶",
        H: "🄷", I: "🄸", J: "🄹", K: "🄺", L: "🄻", M: "🄼", N: "🄽",
        O: "🄾", P: "🄿", Q: "🅀", R: "🅁", S: "🅂", T: "🅃", U: "🅄",
        V: "🅅", W: "🅆", X: "🅇", Y: "🅈", Z: "🅉",
        a: "🄰", b: "🄱", c: "🄲", d: "🄳", e: "🄴", f: "🄵", g: "🄶",
        h: "🄷", i: "🄸", j: "🄹", k: "🄺", l: "🄻", m: "🄼", n: "🄽",
        o: "🄾", p: "🄿", q: "🅀", r: "🅁", s: "🅂", t: "🅃", u: "🅄",
        v: "🅅", w: "🅆", x: "🅇", y: "🅈", z: "🅉"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Bubble Letters",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      const map = {
        A:"🅐", B:"🅑", C:"🅒", D:"🅓", E:"🅔", F:"🅕", G:"🅖", H:"🅗",
        I:"🅘", J:"🅙", K:"🅚", L:"🅛", M:"🅜", N:"🅝", O:"🅞", P:"🅟",
        Q:"🅠", R:"🅡", S:"🅢", T:"🅣", U:"🅤", V:"🅥", W:"🅦", X:"🅧",
        Y:"🅨", Z:"🅩", a:"🄰", b:"🄱", c:"🄲", d:"🄳", e:"🄴", f:"🄵",
        g:"🄶", h:"🄷", i:"🄸", j:"🄹", k:"🄺", l:"🄻", m:"🄼", n:"🄽",
        o:"🄾", p:"🄿", q:"🅀", r:"🅁", s:"🅂", t:"🅃", u:"🅄", v:"🅅",
        w:"🅆", x:"🅇", y:"🅈", z:"🅉"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Tiny Letters",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      const map = {
        a:"ᵃ", b:"ᵇ", c:"ᶜ", d:"ᵈ", e:"ᵉ", f:"ᶠ", g:"ᵍ", h:"ʰ", i:"ⁱ",
        j:"ʲ", k:"ᵏ", l:"ˡ", m:"ᵐ", n:"ⁿ", o:"ᵒ", p:"ᵖ", q:"ᑫ", r:"ʳ",
        s:"ˢ", t:"ᵗ", u:"ᵘ", v:"ᵛ", w:"ʷ", x:"ˣ", y:"ʸ", z:"ᶻ"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Zalgo Text",
    map: c => c.split('').map(ch => {
      if (ch.match(/\s/)) return ch;
      const zalgo_up = ['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓','̈́','͊','͋','͌'];
      const zalgo_down = ['̖','̗','̘','̙','̜','̝','̞','̟','̠','̤','̥','̦','̩','̪','̫','̬','̭','̮','̯','̰'];
      const up = zalgo_up[Math.floor(Math.random()*zalgo_up.length)];
      const down = zalgo_down[Math.floor(Math.random()*zalgo_down.length)];
      return ch + up + down;
    }).join('')
  },
  {
    name: "Framed",
    map: c => c.replace(/[A-Za-z0-9]/g, ch => {
      const map = {
        A:"🄰", B:"🄱", C:"🄲", D:"🄳", E:"🄴", F:"🄵", G:"🄶", H:"🄷",
        I:"🄸", J:"🄹", K:"🄺", L:"🄻", M:"🄼", N:"🄽", O:"🄾", P:"🄿",
        Q:"🅀", R:"🅁", S:"🅂", T:"🅃", U:"🅄", V:"🅅", W:"🅆", X:"🅇",
        Y:"🅈", Z:"🅉",
        a:"🄰", b:"🄱", c:"🄲", d:"🄳", e:"🄴", f:"🄵", g:"🄶", h:"🄷",
        i:"🄸", j:"🄹", k:"🄺", l:"🄻", m:"🄼", n:"🄽", o:"🄾", p:"🄿",
        q:"🅀", r:"🅁", s:"🅂", t:"🅃", u:"🅄", v:"🅅", w:"🅆", x:"🅇",
        y:"🅈", z:"🅉",
        0:"⓿",1:"①",2:"②",3:"③",4:"④",5:"⑤",6:"⑥",7:"⑦",8:"⑧",9:"⑨"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Parenthesized",
    map: c => c.replace(/[A-Za-z0-9]/g, ch => {
      const map = {
        A:"Ⓐ", B:"Ⓑ", C:"Ⓒ", D:"Ⓓ", E:"Ⓔ", F:"Ⓕ", G:"Ⓖ", H:"Ⓗ", I:"Ⓘ",
        J:"Ⓙ", K:"Ⓚ", L:"Ⓛ", M:"Ⓜ", N:"Ⓝ", O:"Ⓞ", P:"Ⓟ", Q:"Ⓠ", R:"Ⓡ",
        S:"Ⓢ", T:"Ⓣ", U:"Ⓤ", V:"Ⓥ", W:"Ⓦ", X:"Ⓧ", Y:"Ⓨ", Z:"Ⓩ",
        a:"ⓐ", b:"ⓑ", c:"ⓒ", d:"ⓓ", e:"ⓔ", f:"ⓕ", g:"ⓖ", h:"ⓗ", i:"ⓘ",
        j:"ⓙ", k:"ⓚ", l:"ⓛ", m:"ⓜ", n:"ⓝ", o:"ⓞ", p:"ⓟ", q:"ⓠ", r:"ⓡ",
        s:"ⓢ", t:"ⓣ", u:"ⓤ", v:"ⓥ", w:"ⓦ", x:"ⓧ", y:"ⓨ", z:"ⓩ",
        0:"⓪",1:"①",2:"②",3:"③",4:"④",5:"⑤",6:"⑥",7:"⑦",8:"⑧",9:"⑨"
      };
      return map[ch] || ch;
    })
  }, 
  {
    name: "Upside Down",
    map: c => {
      const map = {
        a:"ɐ", b:"q", c:"ɔ", d:"p", e:"ǝ", f:"ɟ", g:"ƃ", h:"ɥ",
        i:"ı", j:"ɾ", k:"ʞ", l:"ʃ", m:"ɯ", n:"u", o:"o", p:"d",
        q:"b", r:"ɹ", s:"s", t:"ʇ", u:"n", v:"ʌ", w:"ʍ", x:"x",
        y:"ʎ", z:"z", A:"∀", B:"𐐒", C:"Ɔ", D:"ᗡ", E:"Ǝ", F:"Ⅎ",
        G:"פ", H:"H", I:"I", J:"ſ", K:"ʞ", L:"˥", M:"W", N:"N",
        O:"O", P:"Ԁ", Q:"Ό", R:"ɹ", S:"S", T:"⊥", U:"∩", V:"Λ",
        W:"M", X:"X", Y:"⅄", Z:"Z", 0:"0", 1:"Ɩ", 2:"ᄅ", 3:"Ɛ",
        4:"ㄣ", 5:"ϛ", 6:"9", 7:"ㄥ", 8:"8", 9:"6"
      };
      return c.split('').map(ch => map[ch] || ch).reverse().join('');
    }
  },
  {
    name: "Strike Through",
    map: c => c.split('').map(ch => ch + '̶').join('')
  },
  {
    name: "Wavy",
    map: c => c.split('').map((ch,i) => i%2===0 ? ch.toUpperCase() : ch.toLowerCase()).join('')
  },
  {
    name: "Cursive Bold",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) return String.fromCodePoint(ch.charCodeAt(0)-65+0x1D4D0);
      if (/[a-z]/.test(ch)) return String.fromCodePoint(ch.charCodeAt(0)-97+0x1D4EA);
      return ch;
    })
  }, 
  {
    name: "Reverse Text",
    map: c => c.split('').reverse().join('')
  },
  {
    name: "Spaced Letters",
    map: c => c.split('').join(' ')
  },
  {
    name: "Underlined",
    map: c => c.split('').map(ch => ch + '̲').join('')
  },
  {
    name: "Double Underlined",
    map: c => c.split('').map(ch => ch + '̳').join('')
  },
  {
    name: "Overlined",
    map: c => c.split('').map(ch => ch + '̅').join('')
  },
  {
    name: "Dotted Letters",
    map: c => c.split('').map(ch => ch + '̇').join('')
  },
  {
    name: "Random Case",
    map: c => c.split('').map(ch => Math.random() > 0.5 ? ch.toUpperCase() : ch.toLowerCase()).join('')
  },
  {
    name: "Alternate Case",
    map: c => c.split('').map((ch, i) => i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()).join('')
  },
  {
    name: "Boxed Letters",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      const map = {
        A: "🅰", B: "🅱", C: "🅲", D: "🅳", E: "🅴", F: "🅵", G: "🅶",
        H: "🅷", I: "🅸", J: "🅹", K: "🅺", L: "🅻", M: "🅼", N: "🅽",
        O: "🅾", P: "🅿", Q: "🆀", R: "🆁", S: "🆂", T: "🆃", U: "🆄",
        V: "🆅", W: "🆆", X: "🆇", Y: "🆈", Z: "🆉",
        a: "🅰", b: "🅱", c: "🅲", d: "🅳", e: "🅴", f: "🅵", g: "🅶",
        h: "🅷", i: "🅸", j: "🅹", k: "🅺", l: "🅻", m: "🅼", n: "🅽",
        o: "🅾", p: "🅿", q: "🆀", r: "🆁", s: "🆂", t: "🆃", u: "🆄",
        v: "🆅", w: "🆆", x: "🆇", y: "🆈", z: "🆉"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Math Sans Serif",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝗔 (U+1D5A0)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D5A0);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝗮 (U+1D5BA)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D5BA);
      }
      return ch;
    })
  },
  {
    name: "Math Sans Serif Italic",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      if (/[A-Z]/.test(ch)) {
        // A=65 → 𝘈 (U+1D5D4)
        return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1D5D4);
      } else if (/[a-z]/.test(ch)) {
        // a=97 → 𝘢 (U+1D5EE)
        return String.fromCodePoint(ch.charCodeAt(0) - 97 + 0x1D5EE);
      }
      return ch;
    })
  },
  {
    name: "Greek Bold",
    map: c => c.replace(/[A-Za-z]/g, ch => {
      const map = {
        A: "𝚨", B: "𝚩", C: "𝚾", D: "𝚫", E: "𝚬", F: "𝚭", G: "𝚮",
        H: "𝚯", I: "𝚰", J: "𝚱", K: "𝚲", L: "𝚳", M: "𝚴", N: "𝚵",
        O: "𝚶", P: "𝚷", Q: "𝚸", R: "𝚹", S: "𝚺", T: "𝚻", U: "𝚼",
        V: "𝚽", W: "𝚾", X: "𝚿", Y: "𝚼", Z: "𝚭",
        a: "𝛂", b: "𝛃", c: "𝛄", d: "𝛅", e: "𝛆", f: "𝛇", g: "𝛈",
        h: "𝛉", i: "𝛊", j: "𝛋", k: "𝛌", l: "𝛍", m: "𝛎", n: "𝛏",
        o: "𝛐", p: "𝛑", q: "𝛒", r: "𝛓", s: "𝛔", t: "𝛕", u: "𝛖",
        v: "𝛗", w: "𝛘", x: "𝛙", y: "𝛚", z: "𝛛"
      };
      return map[ch] || ch;
    })
  },
  {
    name: "Mirror Text",
    map: c => {
      const map = {
        a: "ɒ", b: "d", c: "ɔ", d: "b", e: "ɘ", f: "Ꮈ", g: "ǫ",
        h: "ʜ", i: "i", j: "ꞁ", k: "ʞ", l: "l", m: "ɯ", n: "u",
        o: "o", p: "q", q: "p", r: "ɹ", s: "ꙅ", t: "ʇ", u: "n",
        v: "ʌ", w: "ʍ", x: "x", y: "ʏ", z: "z", A: "∀", B: "ᙠ",
        C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "ꟻ", G: "⅁", H: "H", I: "I",
        J: "ᒍ", K: "⋊", L: "⅂", M: "W", N: "И", O: "O", P: "ꟼ",
        Q: "Ό", R: "Я", S: "Ꙅ", T: "⊥", U: "∩", V: "Λ", W: "M",
        X: "X", Y: "⅄", Z: "Z"
      };
      return c.split('').map(ch => map[ch] || ch).join('');
    }
  }, 
  {
    name: "Vaporwave",
    map: c => c.replace(/[A-Za-z0-9]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) + 0xFEE0 - 0x20)
    )
  },
  {
  name: "Negative Circled",
  map: c => c.replace(/[A-Z0-9]/g, ch => {
    if (/[A-Z]/.test(ch)) {
      return String.fromCodePoint(ch.charCodeAt(0) - 65 + 0x1F170); // 🅰
    } else if (/[0-9]/.test(ch)) {
      // 0 = ⓿ (U+24FF), 1-9 = ❶–❾ (U+2776–U+277E)
      return ch === "0"
        ? String.fromCodePoint(0x24FF)
        : String.fromCodePoint(parseInt(ch) - 1 + 0x2776);
    }
    return ch;
  })
}
];
