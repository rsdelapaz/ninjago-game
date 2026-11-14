<template>
  <!-- Original vector scenery, drawn for this project; no third-party artwork. -->
  <svg class="landscape" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#080e1c"/><stop offset=".65" stop-color="#263c46"/><stop offset="1" stop-color="#091219"/></linearGradient>
      <radialGradient id="moonlight"><stop stop-color="#cfdfce" stop-opacity=".32"/><stop offset="1" stop-color="#99cad2" stop-opacity="0"/></radialGradient>
      <linearGradient id="stone" x2="0" y2="1"><stop stop-color="#3c494b"/><stop offset="1" stop-color="#101a20"/></linearGradient>
      <linearGradient id="roof" x2="0" y2="1"><stop stop-color="#344044"/><stop offset="1" stop-color="#0c171c"/></linearGradient>
      <radialGradient id="lantern"><stop stop-color="#fff0b2"/><stop offset=".12" stop-color="#efb751" stop-opacity=".9"/><stop offset="1" stop-color="#ffab36" stop-opacity="0"/></radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>
      <g id="tower">
        <path d="M-130 0H130L100-160H-100Z" fill="url(#stone)"/>
        <path d="M-160-160Q-105-172-85-213L0-251 85-213Q105-172 160-160L150-149H-150Z" fill="url(#roof)" stroke="#8f8460" stroke-width="3"/>
        <path d="M-86-210H86M-68-222H68M0-250V-281" fill="none" stroke="#63706b" stroke-width="4"/>
        <path d="M-78-145V-12M78-145V-12" stroke="#715b42" stroke-width="11"/>
        <path d="M-40 0V-101Q0-134 40-101V0" fill="#0b151a" stroke="#8b6d45" stroke-width="4"/>
        <path d="M-100-12H100M-105 0H105" stroke="#64706a" stroke-width="6"/>
      </g>
      <g id="light"><circle r="100" fill="url(#lantern)"/><path d="M-9-15H9L12 14H-12Z" fill="#e6b65f"/><path d="M-12-15H12M-13 14H13M0-23V-15M0 14V26" stroke="#413521" stroke-width="4"/></g>
    </defs>
    <path fill="url(#sky)" d="M0 0H1920V1080H0Z"/>
    <ellipse cx="1260" cy="225" rx="490" ry="380" fill="url(#moonlight)"/>
    <circle cx="1295" cy="176" r="43" fill="#c6d3c5" opacity=".65"/>
    <path d="M0 540 160 274 250 365 419 135 600 422 730 269 895 513 1100 317 1260 484 1442 210 1575 396 1740 142 1920 433V1080H0Z" fill="#23343f"/>
    <path d="m335 276 84-141 91 149-84-41-34 41-15-29Z M1645 290l95-148 96 157-88-58-37 41-19-22Z" fill="#62727a" opacity=".34"/>
    <path d="M0 740 207 462 405 707 614 404 840 765 1104 512 1250 663 1510 390 1700 683 1920 501V1080H0Z" fill="#15272f"/>
    <g opacity=".25" filter="url(#blur)" fill="#91a4a2"><ellipse cx="360" cy="675" rx="550" ry="40"/><ellipse cx="1530" cy="600" rx="500" ry="36"/></g>
    <path d="M337 965 476 766 694 714 1230 714 1453 782 1636 1080H280Z" fill="#101b20"/>
    <path d="m820 1080 70-330h140l78 330Z" fill="#5c6155" opacity=".35"/>
    <path d="M874 810h172M862 850h194M850 899h218M837 958h246M822 1025h276" stroke="#b3a88b" stroke-opacity=".2" stroke-width="4"/>
    <g transform="translate(960 760)">
      <path d="M-325 0V-160H325V0" fill="url(#stone)"/>
      <path d="M-390-153Q-315-170-277-221H277Q315-170 390-153L370-140H-370Z" fill="url(#roof)" stroke="#a28a58" stroke-width="3"/>
      <path d="M-180-214V-299H180V-214" fill="url(#stone)"/>
      <path d="M-240-292Q-159-315-139-349L0-411 139-349Q159-315 240-292L225-280H-225Z" fill="url(#roof)" stroke="#a28a58" stroke-width="3"/>
      <path d="M0-410V-451M-137-348H137M-172-325H172" stroke="#92947b" stroke-width="4"/>
      <path d="M-100-218V-271H100V-218" fill="#ad9051" opacity=".5"/>
      <path d="M-70-269V-219M0-269V-219M70-269V-219" stroke="#132126" stroke-width="8"/>
      <path d="M-65 0V-111Q0-147 65-111V0" fill="#c3a064" opacity=".65"/>
      <path d="M0-126V0M-265-135V0M265-135V0M-159-135V0M159-135V0" stroke="#69573d" stroke-width="14"/>
      <path d="M-330 0H330M-345 16H345" stroke="#778078" stroke-width="7"/>
    </g>
    <use href="#tower" transform="translate(450 865) scale(.9)"/><use href="#tower" transform="translate(1470 865) scale(.9)"/>
    <use href="#light" transform="translate(715 734)"/><use href="#light" transform="translate(1205 734)"/>
    <use href="#light" transform="translate(450 801) scale(.65)"/><use href="#light" transform="translate(1470 801) scale(.65)"/>
    <g class="mist" fill="#9bb7b6" opacity=".16" filter="url(#blur)"><ellipse cx="540" cy="895" rx="650" ry="45"/><ellipse cx="1550" cy="955" rx="700" ry="56"/></g>
    <path d="M0 0H130L95 500 163 1080H0ZM1920 0H1800L1824 420 1765 1080H1920Z" fill="#070e12"/>
    <path d="m0 181 270 147-208-58L0 255ZM1920 148l-243 167 193-71 50-29Z" fill="#070e12"/>
  </svg>
</template>
