// 第一关小镇地图（原版绘本风格，含吊桥/气象塔/集市彩旗/村民/鸭子/萤火虫/暗角等 50+ 图层）
export const TOWN_SVG = `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8ECBDD"/><stop offset=".55" stop-color="#C5E8E6"/><stop offset="1" stop-color="#F3FAEC"/>
  </linearGradient>
  <radialGradient id="sung" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#FFF3C2" stop-opacity=".95"/><stop offset=".55" stop-color="#FFEAA0" stop-opacity=".4"/><stop offset="1" stop-color="#FFEAA0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="rvg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#79CFE2"/><stop offset="1" stop-color="#3E9CBE"/>
  </linearGradient>
  <linearGradient id="trk" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6E4527"/><stop offset=".45" stop-color="#8A5A38"/><stop offset=".8" stop-color="#A06F47"/><stop offset="1" stop-color="#8A5A38"/>
  </linearGradient>
  <linearGradient id="trkR" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#6E4527"/><stop offset=".45" stop-color="#8A5A38"/><stop offset=".8" stop-color="#A06F47"/><stop offset="1" stop-color="#8A5A38"/>
  </linearGradient>
  <radialGradient id="vig" cx=".5" cy=".42" r=".75">
    <stop offset=".62" stop-color="#173C42" stop-opacity="0"/><stop offset="1" stop-color="#173C42" stop-opacity=".22"/>
  </radialGradient>
</defs>

<!-- 天空 / 太阳 -->
<rect width="1000" height="560" fill="url(#skyg)"/>
<circle cx="828" cy="92" r="150" fill="url(#sung)"/>
<circle cx="828" cy="92" r="36" fill="#FFE27A"/><circle cx="828" cy="92" r="27" fill="#FFD23F"/>

<!-- 云（柔和无描边） -->
<g fill="#FFFFFF" opacity=".94">
  <ellipse cx="200" cy="86" rx="62" ry="20"/><circle cx="172" cy="72" r="20"/><circle cx="216" cy="64" r="26"/><circle cx="246" cy="78" r="17"/>
  <ellipse cx="206" cy="94" rx="56" ry="12" fill="#D8EEF2"/>
</g>
<g fill="#FFFFFF" opacity=".88">
  <ellipse cx="600" cy="60" rx="46" ry="15"/><circle cx="580" cy="48" r="15"/><circle cx="612" cy="42" r="19"/>
  <ellipse cx="604" cy="66" rx="40" ry="9" fill="#D8EEF2"/>
</g>
<g fill="#FFFFFF" opacity=".75">
  <ellipse cx="430" cy="130" rx="34" ry="11"/><circle cx="418" cy="122" r="11"/><circle cx="442" cy="118" r="13"/>
</g>

<!-- 远山三层（大气透视） -->
<path d="M-20 318 Q110 196 240 308 Q340 230 470 312 Q560 252 700 310 Q820 240 1020 314 L1020 360 L-20 360 Z" fill="#9DC6B4" opacity=".42"/>
<path d="M-20 330 Q140 232 300 326 Q430 262 580 328 Q720 268 880 326 Q950 296 1020 326 L1020 372 L-20 372 Z" fill="#8CBBA2" opacity=".6"/>
<rect x="0" y="300" width="1000" height="46" fill="#FFFFFF" opacity=".22"/>

<!-- 中景丘陵 -->
<path d="M-20 352 Q180 286 400 350 Q640 292 860 348 Q940 330 1020 348 L1020 420 L-20 420 Z" fill="#A8D584"/>
<path d="M-20 352 Q180 286 400 350 Q640 292 860 348 Q940 330 1020 348" fill="none" stroke="#7FBE63" stroke-width="5" opacity=".55"/>

<!-- 大坝小丘 + 水库 -->
<path d="M96 352 Q210 252 336 352 Z" fill="#90C972"/>
<path d="M120 340 Q210 268 312 340" fill="none" stroke="#7BB55C" stroke-width="6" opacity=".6"/>
<g>
  <rect x="158" y="252" width="98" height="100" rx="8" fill="#C9CDD6" stroke="#2A4A50" stroke-width="2.5"/>
  <rect x="158" y="252" width="98" height="16" rx="8" fill="#DDE1E8"/>
  <path d="M158 280h98M158 304h98M158 328h98" stroke="#A7ADBB" stroke-width="2.5"/>
  <path d="M183 280v24M232 280v24M207 304v24M183 328v24M232 328v24" stroke="#A7ADBB" stroke-width="2.5"/>
  <path d="M173 332q0-12 11-12t11 12v20h-22Z" fill="#3D7C9C" stroke="#2A4A50" stroke-width="2.5"/>
  <path d="M221 332q0-12 11-12t11 12v20h-22Z" fill="#3D7C9C" stroke="#2A4A50" stroke-width="2.5"/>
  <path d="M184 352 Q196 412 232 470" stroke="#A9E2F2" stroke-width="13" stroke-linecap="round" fill="none" opacity=".95"/>
  <path d="M232 352 Q236 408 258 468" stroke="#C7EEF8" stroke-width="9" stroke-linecap="round" fill="none" opacity=".9"/>
  <circle cx="236" cy="468" r="7" fill="#EAFBFF" opacity=".9"/><circle cx="256" cy="472" r="5" fill="#EAFBFF" opacity=".8"/>
  <rect x="186" y="222" width="44" height="20" rx="5" fill="#FFF6DF" stroke="#2A4A50" stroke-width="2.5"/>
  <text x="208" y="237" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2A4A50">水库</text>
  <line x1="208" y1="242" x2="208" y2="252" stroke="#2A4A50" stroke-width="2.5"/>
</g>

<!-- 高空吊桥（左树 → 气象塔 → 右树） -->
<g stroke="#5C3A20" fill="none">
  <path d="M96 168 Q250 218 352 196" stroke-width="7" stroke-linecap="round"/>
  <path d="M96 150 Q250 198 352 178" stroke-width="3.4"/>
  <path d="M128 156 v32 M168 165 v34 M210 172 v34 M252 176 v33 M294 176 v29 M330 172 v26" stroke-width="3"/>
  <path d="M468 196 Q650 248 904 212" stroke-width="7" stroke-linecap="round"/>
  <path d="M468 178 Q650 228 904 192" stroke-width="3.4"/>
  <path d="M510 188 v32 M560 196 v33 M612 202 v34 M664 206 v34 M716 207 v33 M768 204 v31 M820 199 v28 M866 193 v26" stroke-width="3"/>
</g>
<g fill="#C9935C" stroke="#2A4A50" stroke-width="2">
  <rect x="100" y="164" width="14" height="8" rx="2" transform="rotate(8 107 168)"/>
  <rect x="146" y="176" width="14" height="8" rx="2" transform="rotate(7 153 180)"/>
  <rect x="192" y="185" width="14" height="8" rx="2" transform="rotate(5 199 189)"/>
  <rect x="238" y="190" width="14" height="8" rx="2" transform="rotate(2 245 194)"/>
  <rect x="284" y="192" width="14" height="8" rx="2"/>
  <rect x="324" y="190" width="14" height="8" rx="2" transform="rotate(-3 331 194)"/>
  <rect x="492" y="196" width="15" height="8" rx="2" transform="rotate(6 499 200)"/>
  <rect x="546" y="206" width="15" height="8" rx="2" transform="rotate(5 553 210)"/>
  <rect x="600" y="214" width="15" height="8" rx="2" transform="rotate(3 607 218)"/>
  <rect x="654" y="218" width="15" height="8" rx="2"/>
  <rect x="708" y="219" width="15" height="8" rx="2" transform="rotate(-2 715 223)"/>
  <rect x="762" y="216" width="15" height="8" rx="2" transform="rotate(-3 769 220)"/>
  <rect x="816" y="210" width="15" height="8" rx="2" transform="rotate(-5 823 214)"/>
  <rect x="862" y="203" width="15" height="8" rx="2" transform="rotate(-6 869 207)"/>
</g>

<!-- 气象塔（黄铜仪器） -->
<g>
  <rect x="402" y="216" width="14" height="148" fill="url(#trk)" stroke="#2A4A50" stroke-width="2.5"/>
  <path d="M372 364 L406 300 M446 364 L412 300" stroke="#6E4527" stroke-width="6" stroke-linecap="round"/>
  <rect x="352" y="200" width="116" height="16" rx="8" fill="#C9935C" stroke="#2A4A50" stroke-width="2.5"/>
  <rect x="352" y="200" width="116" height="6" rx="3" fill="#E0B080"/>
  <rect x="380" y="112" width="58" height="90" rx="13" fill="#9AA6B4" stroke="#2A4A50" stroke-width="2.8"/>
  <rect x="384" y="116" width="14" height="82" rx="7" fill="#B7C2CE" opacity=".8"/>
  <circle cx="409" cy="142" r="25" fill="#C46A55" stroke="#2A4A50" stroke-width="2.8"/>
  <circle cx="409" cy="142" r="18" fill="#FFF6DF" stroke="#2A4A50" stroke-width="2.2"/>
  <line x1="409" y1="142" x2="409" y2="130" stroke="#2A4A50" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="409" y1="142" x2="417" y2="146" stroke="#2A4A50" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="409" cy="142" r="2.4" fill="#2A4A50"/>
  <circle cx="398" cy="182" r="9" fill="#FFF6DF" stroke="#2A4A50" stroke-width="2.2"/>
  <line x1="398" y1="182" x2="402" y2="176" stroke="#2A4A50" stroke-width="2"/>
  <rect x="421" y="172" width="11" height="18" rx="2.5" fill="#3E4A57" stroke="#2A4A50" stroke-width="1.8"/>
  <circle cx="426.5" cy="177" r="1.6" fill="#8FE3A0"/><circle cx="426.5" cy="183" r="1.6" fill="#FFCF3F"/>
  <path d="M388 112 v-22 q0-9 9-9 h10" fill="none" stroke="#7E8A99" stroke-width="9" stroke-linecap="round"/>
  <path d="M388 112 v-22 q0-9 9-9 h10" fill="none" stroke="#B7C2CE" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="413" cy="81" r="8" fill="#C46A55" stroke="#2A4A50" stroke-width="2.4"/>
  <rect x="409" y="70" width="8" height="8" rx="2" fill="#C46A55" stroke="#2A4A50" stroke-width="2"/>
  <rect x="362" y="138" width="14" height="44" rx="7" fill="#DDE6EE" stroke="#2A4A50" stroke-width="2.4"/>
  <rect x="365" y="146" width="8" height="22" rx="4" fill="#9FD9EC"/>
  <path d="M376 150 h4 M376 168 h4" stroke="#2A4A50" stroke-width="2.2"/>
  <path d="M438 132 h12 q7 0 7 8 v36" fill="none" stroke="#7E8A99" stroke-width="8" stroke-linecap="round"/>
</g>

<!-- 主草地 -->
<path d="M-20 364 Q240 336 500 360 Q760 384 1020 356 L1020 470 L-20 470 Z" fill="#9FD480"/>
<path d="M-20 364 Q240 336 500 360 Q760 384 1020 356" fill="none" stroke="#7FBE63" stroke-width="5" opacity=".7"/>
<ellipse cx="350" cy="402" rx="42" ry="8" fill="#8BC56B" opacity=".7"/>
<ellipse cx="700" cy="408" rx="48" ry="9" fill="#8BC56B" opacity=".7"/>
<ellipse cx="540" cy="430" rx="36" ry="7" fill="#8BC56B" opacity=".6"/>

<!-- 镇志馆 -->
<g>
  <ellipse cx="560" cy="352" rx="86" ry="9" fill="#7FBE63" opacity=".65"/>
  <rect x="496" y="266" width="128" height="86" rx="7" fill="#FFF3D8" stroke="#2A4A50" stroke-width="2.8"/>
  <rect x="496" y="266" width="128" height="10" fill="#F0DCB4"/>
  <path d="M478 270 Q560 192 642 270 L626 270 Q560 208 494 270 Z" fill="#D8564A" stroke="#2A4A50" stroke-width="2.8"/>
  <path d="M482 268 Q560 196 638 268" fill="none" stroke="#B23F36" stroke-width="7"/>
  <rect x="544" y="300" width="34" height="52" rx="4" fill="#8A5A38" stroke="#2A4A50" stroke-width="2.6"/>
  <path d="M548 304 q13 -8 26 0" fill="none" stroke="#6E4527" stroke-width="2"/>
  <circle cx="572" cy="328" r="2.4" fill="#FFCF3F"/>
  <rect x="508" y="288" width="26" height="22" rx="4" fill="#BCE6F2" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M508 299 h26 M521 288 v22" stroke="#2A4A50" stroke-width="1.8"/>
  <rect x="588" y="288" width="26" height="22" rx="4" fill="#BCE6F2" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M588 299 h26 M601 288 v22" stroke="#2A4A50" stroke-width="1.8"/>
  <line x1="630" y1="276" x2="630" y2="296" stroke="#2A4A50" stroke-width="2.2"/>
  <ellipse cx="630" cy="304" rx="7.5" ry="9" fill="#E2574C" stroke="#2A4A50" stroke-width="2.2"/>
  <path d="M630 313 v6" stroke="#FFCF3F" stroke-width="2.4"/>
  <rect x="528" y="246" width="64" height="19" rx="5" fill="#FFF6DF" stroke="#2A4A50" stroke-width="2.4"/>
  <text x="560" y="260" text-anchor="middle" font-size="13.5" font-weight="900" fill="#2A4A50">镇 志 馆</text>
</g>

<!-- 民居 -->
<g>
  <ellipse cx="724" cy="350" rx="56" ry="8" fill="#7FBE63" opacity=".6"/>
  <rect x="682" y="288" width="84" height="62" rx="6" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2.6"/>
  <path d="M670 292 L724 246 L778 292 L764 292 L724 258 L684 292 Z" fill="#F2A03D" stroke="#2A4A50" stroke-width="2.6"/>
  <rect x="712" y="314" width="24" height="36" rx="4" fill="#3D7C9C" stroke="#2A4A50" stroke-width="2.4"/>
  <rect x="690" y="300" width="18" height="16" rx="3" fill="#BCE6F2" stroke="#2A4A50" stroke-width="2"/>
</g>

<!-- 集市两摊 + 彩旗 -->
<path d="M300 296 Q368 318 436 300" fill="none" stroke="#6E4527" stroke-width="2.4"/>
<g>
  <path d="M306 308 l9 -5 v10 Z" fill="#FF7B6B"/><path d="M330 313 l9 -5 v10 Z" fill="#FFCF3F"/>
  <path d="M354 316 l9 -5 v10 Z" fill="#52C474"/><path d="M378 315 l9 -5 v10 Z" fill="#4FC3DC"/>
  <path d="M402 311 l9 -5 v10 Z" fill="#B388FF"/>
</g>
<g>
  <ellipse cx="318" cy="392" rx="58" ry="8" fill="#7FBE63" opacity=".6"/>
  <rect x="276" y="350" width="86" height="11" rx="5" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M272 350 h94 l-8 -24 h-78 Z" fill="#E2574C" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M276 350 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q4 7 8 0" fill="#E2574C" stroke="#2A4A50" stroke-width="2.2"/>
  <path d="M288 328 v22 M306 328 v22 M324 328 v22 M342 328 v22" stroke="#FFD6CE" stroke-width="6"/>
  <rect x="282" y="361" width="7" height="31" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
  <rect x="349" y="361" width="7" height="31" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
  <circle cx="300" cy="345" r="5" fill="#FF9F1C"/><circle cx="312" cy="345" r="5" fill="#FF9F1C"/><circle cx="306" cy="338" r="5" fill="#FFB94D"/>
  <circle cx="334" cy="345" r="5" fill="#E2574C"/><circle cx="344" cy="345" r="5" fill="#E2574C"/>
</g>
<g>
  <ellipse cx="438" cy="400" rx="56" ry="8" fill="#7FBE63" opacity=".6"/>
  <rect x="396" y="360" width="86" height="11" rx="5" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M392 360 h94 l-8 -24 h-78 Z" fill="#3FA56F" stroke="#2A4A50" stroke-width="2.4"/>
  <path d="M396 360 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q4 7 8 0" fill="#3FA56F" stroke="#2A4A50" stroke-width="2.2"/>
  <path d="M408 338 v22 M426 338 v22 M444 338 v22 M462 338 v22" stroke="#D9F5DF" stroke-width="6"/>
  <rect x="402" y="371" width="7" height="31" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
  <rect x="469" y="371" width="7" height="31" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
  <rect x="414" y="346" width="22" height="14" rx="2.5" fill="#C9935C" stroke="#2A4A50" stroke-width="2"/>
  <circle cx="450" cy="350" r="5.5" fill="#9BE08C"/><circle cx="461" cy="350" r="5.5" fill="#9BE08C"/>
</g>

<!-- 路牌 -->
<g>
  <ellipse cx="804" cy="360" rx="30" ry="6" fill="#7FBE63" opacity=".6"/>
  <rect x="800" y="300" width="8" height="58" fill="#8A5A38" stroke="#2A4A50" stroke-width="2.2"/>
  <rect x="768" y="286" width="72" height="32" rx="6" fill="#FFF3D8" stroke="#2A4A50" stroke-width="2.6"/>
  <path d="M776 308 l12 -10 8 6 10 -9" fill="none" stroke="#3FA56F" stroke-width="3" stroke-linecap="round"/>
  <circle cx="826" cy="296" r="3" fill="#E2574C"/>
</g>

<!-- 村民 -->
<g>
  <ellipse cx="872" cy="368" rx="22" ry="5" fill="#7FBE63" opacity=".6"/>
  <circle cx="872" cy="324" r="14" fill="#FFD9BF" stroke="#2A4A50" stroke-width="2.6"/>
  <path d="M858 322 q3 -12 14 -12 t14 12" fill="#5C3A20" stroke="#2A4A50" stroke-width="2.2"/>
  <path d="M859 340 q13 -9 26 0 l4 26 h-34 Z" fill="#4FC3DC" stroke="#2A4A50" stroke-width="2.6"/>
  <path d="M866 328 q6 5 12 0" stroke="#2A4A50" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="866" cy="322" r="1.8" fill="#2A4A50"/><circle cx="878" cy="322" r="1.8" fill="#2A4A50"/>
  <ellipse cx="861" cy="327" rx="2.6" ry="1.6" fill="#FFB3A0"/><ellipse cx="883" cy="327" rx="2.6" ry="1.6" fill="#FFB3A0"/>
</g>

<!-- 河 -->
<path d="M-20 470 Q250 452 520 466 Q780 478 1020 460 L1020 560 L-20 560 Z" fill="url(#rvg)"/>
<path d="M-20 470 Q250 452 520 466 Q780 478 1020 460" fill="none" stroke="#2A4A50" stroke-width="3" opacity=".5"/>
<ellipse cx="300" cy="500" rx="90" ry="7" fill="#A9E2F2" opacity=".5"/>
<ellipse cx="640" cy="516" rx="110" ry="8" fill="#A9E2F2" opacity=".4"/>
<ellipse cx="880" cy="496" rx="70" ry="6" fill="#A9E2F2" opacity=".45"/>
<g stroke="#E6FAFF" stroke-width="3.6" stroke-linecap="round" fill="none" opacity=".9">
  <path d="M120 498 q12 -7 24 0 q12 7 24 0"/><path d="M420 512 q12 -7 24 0 q12 7 24 0"/>
  <path d="M700 500 q12 -7 24 0 q12 7 24 0"/><path d="M900 520 q12 -7 24 0 q12 7 24 0"/>
</g>
<ellipse cx="560" cy="492" rx="13" ry="5" fill="#52A86C"/><circle cx="566" cy="487" r="4" fill="#FF8FB1"/>
<text x="476" y="506" font-size="24">🦆</text>
<text x="208" y="540" font-size="19">🐟</text>

<!-- 水位计立柱 -->
<g>
  <rect x="142" y="418" width="16" height="116" rx="4" fill="#FFCF3F" stroke="#2A4A50" stroke-width="2.6"/>
  <rect x="142" y="418" width="6" height="116" rx="3" fill="#FFE27A"/>
  <path d="M146 436h8M146 454h8M146 472h8M146 490h8M146 508h8" stroke="#2A4A50" stroke-width="2.2"/>
  <circle cx="150" cy="408" r="13" fill="#FFF6DF" stroke="#2A4A50" stroke-width="2.6"/>
  <line x1="150" y1="408" x2="150" y2="399" stroke="#C0392B" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="150" cy="408" r="2" fill="#2A4A50"/>
  <ellipse cx="150" cy="534" rx="26" ry="6" fill="#2E7E9E" opacity=".5"/>
</g>

<!-- 拱桥 -->
<g>
  <path d="M620 470 Q716 428 812 472" fill="none" stroke="#6E4527" stroke-width="13"/>
  <path d="M620 466 Q716 424 812 468" fill="none" stroke="#C9935C" stroke-width="7"/>
  <path d="M624 452 Q716 412 808 454" fill="none" stroke="#8A5A38" stroke-width="5"/>
  <path d="M646 446 v14 M686 434 v16 M726 430 v17 M766 436 v16 M798 446 v14" stroke="#8A5A38" stroke-width="4"/>
</g>

<!-- 左右巨树（框景） -->
<g>
  <path d="M-30 560 L-30 -20 L96 -20 Q78 90 88 200 Q96 320 78 440 Q72 510 84 560 Z" fill="url(#trk)" stroke="#2A4A50" stroke-width="3"/>
  <path d="M30 -10 Q22 120 32 260 Q40 400 28 545" stroke="#6E4527" stroke-width="7" fill="none" opacity=".55"/>
  <path d="M62 -10 Q56 140 66 300 Q72 430 60 552" stroke="#A06F47" stroke-width="5" fill="none" opacity=".6"/>
  <ellipse cx="92" cy="236" rx="34" ry="13" fill="#F2C98E" stroke="#2A4A50" stroke-width="2.6"/>
  <ellipse cx="92" cy="231" rx="34" ry="9" fill="#FBE3BC"/>
  <ellipse cx="86" cy="356" rx="28" ry="11" fill="#F2C98E" stroke="#2A4A50" stroke-width="2.6"/>
  <ellipse cx="86" cy="352" rx="28" ry="7.5" fill="#FBE3BC"/>
  <ellipse cx="94" cy="470" rx="24" ry="10" fill="#E8B27A" stroke="#2A4A50" stroke-width="2.4"/>
  <circle cx="58" cy="300" r="6" fill="#6E4527" opacity=".5"/><circle cx="44" cy="180" r="8" fill="#6E4527" opacity=".4"/>
</g>
<g>
  <path d="M1030 560 L1030 -20 L906 -20 Q922 100 914 220 Q906 340 922 450 Q928 510 918 560 Z" fill="url(#trkR)" stroke="#2A4A50" stroke-width="3"/>
  <path d="M972 -10 Q980 130 970 270 Q962 410 974 548" stroke="#6E4527" stroke-width="7" fill="none" opacity=".55"/>
  <path d="M940 -10 Q946 150 938 310 Q932 440 944 554" stroke="#A06F47" stroke-width="5" fill="none" opacity=".6"/>
  <ellipse cx="910" cy="260" rx="30" ry="12" fill="#F2C98E" stroke="#2A4A50" stroke-width="2.6"/>
  <ellipse cx="910" cy="255" rx="30" ry="8" fill="#FBE3BC"/>
  <ellipse cx="916" cy="404" rx="26" ry="10" fill="#E8B27A" stroke="#2A4A50" stroke-width="2.4"/>
  <circle cx="962" cy="220" r="7" fill="#6E4527" opacity=".45"/>
</g>
<!-- 树冠 -->
<g fill="#4E9E5F">
  <circle cx="30" cy="22" r="74"/><circle cx="120" cy="0" r="66"/><circle cx="86" cy="58" r="46"/>
  <circle cx="966" cy="14" r="76"/><circle cx="884" cy="-6" r="60"/><circle cx="918" cy="52" r="44"/>
</g>
<g fill="#63B574">
  <circle cx="16" cy="6" r="52"/><circle cx="108" cy="-16" r="46"/><circle cx="950" cy="-4" r="54"/>
</g>
<g fill="#8FD49B" opacity=".85">
  <circle cx="60" cy="14" r="20"/><circle cx="118" cy="22" r="15"/><circle cx="930" cy="26" r="18"/><circle cx="980" cy="40" r="13"/>
</g>

<!-- 前景草丛 / 石头 / 萤光 -->
<g fill="#5FA862">
  <path d="M-10 560 q14 -44 26 0 q12 -36 24 0 q12 -30 24 0 Z"/>
  <path d="M926 560 q12 -40 24 0 q12 -34 24 0 q12 -28 22 0 Z"/>
</g>
<ellipse cx="380" cy="556" rx="34" ry="11" fill="#8FA6AD"/><ellipse cx="372" cy="550" rx="20" ry="8" fill="#AEC2C8"/>
<g fill="#FFF2A8">
  <circle cx="250" cy="250" r="3.2"/><circle cx="660" cy="180" r="2.6"/>
  <circle cx="760" cy="330" r="3"/><circle cx="330" cy="170" r="2.4"/>
  <circle cx="540" cy="220" r="2.8"/><circle cx="120" cy="320" r="2.6"/>
</g>
<g stroke="#2A4A50" stroke-width="2.2" fill="none" opacity=".8">
  <path d="M560 120 q7 -7 14 0 q7 -7 14 0"/><path d="M620 96 q6 -6 12 0 q6 -6 12 0"/>
</g>
<rect width="1000" height="560" fill="url(#vig)" pointer-events="none"/>
</svg>`;

// 8 个数据点在地图上的锚点（百分比，按 viewBox 1000×560 推得）
export const GOOD_POS: Record<string, [number, number]> = {
  rain:   [40.9, 28],    // 雨量站 → 气象塔上方
  gauge:  [15,   73],    // 水位计立柱
  dam:    [20.7, 53.5],  // 水库
  map:    [80.4, 54],    // 路牌（地形）
  scroll: [56,   58]     // 镇志馆
};
export const DECOY_POS: [number, number][] = [
  [31.8, 61],   // 红摊
  [43.9, 63],   // 绿摊
  [87.2, 59]    // 村民
];
