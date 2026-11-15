<script setup lang="ts">
import { useId } from 'vue'
import type { ProfileConfig } from './profile'
defineProps<{ teams: ProfileConfig['teams']; winner?: string }>()
const id = useId()
</script>
<template>
  <!-- Original scenery and varied, back-facing silhouettes. These represent two clans,
       not individual participants or invented roles. Unique paint IDs support previews. -->
  <svg class="sky-monastery" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="`${id}-sky`" x2="0" y2="1"><stop stop-color="#071127"/><stop offset=".55" stop-color="#194257"/><stop offset="1" stop-color="#091c2c"/></linearGradient>
      <radialGradient :id="`${id}-light`"><stop stop-color="#cff9f1" stop-opacity=".4"/><stop offset=".6" stop-color="#77c9ca" stop-opacity=".12"/><stop offset="1" stop-color="#77c9ca" stop-opacity="0"/></radialGradient>
      <linearGradient :id="`${id}-stone`" x2="0" y2="1"><stop stop-color="#36606a"/><stop offset="1" stop-color="#071925"/></linearGradient>
    </defs>
    <path d="M0 0H1600V900H0Z" :fill="`url(#${id}-sky)`"/>
    <ellipse cx="800" cy="300" rx="760" ry="490" :fill="`url(#${id}-light)`" class="sky-awakening"/>
    <g fill="#f4e5b4" opacity=".5"><circle cx="87" cy="93" r="1.5"/><circle cx="1476" cy="178" r="2"/><circle cx="1365" cy="66" r="1.5"/><circle cx="202" cy="233" r="1"/><circle cx="1199" cy="120" r="1"/></g>
    <path d="M0 575 140 310 290 495 420 363 620 580 820 480 1010 550 1170 325 1320 465 1490 275 1600 520V900H0Z" fill="#234b5c"/>
    <path d="m0 674 177-215 170 175 170-94 143 166 161-152 182 115 186-202 176 141 235-150v442H0Z" fill="#143646"/>
    <path d="M0 664Q360 580 700 675T1600 620V750Q1190 700 800 735T0 744Z" fill="#87bdbd" opacity=".1"/>
    <!-- Three depths of monastery roofs, terrace and stairs. -->
    <g :fill="`url(#${id}-stone)`" stroke="#668b83" stroke-width="2">
      <path d="M590 680V594H1010V680Z"/><path d="M536 602Q607 581 628 545H972Q993 581 1064 602L1040 615H560Z" fill="#102d3a"/>
      <path d="M672 547V504H928V547Z"/><path d="M634 513Q698 493 715 465H885Q902 493 966 513L948 523H652Z" fill="#163b45"/>
      <path d="M744 501V462H856V501Z"/><path d="m709 470 91-75 91 75-24 9H733Z" fill="#12303f"/>
      <path d="M490 724V653H1110V724Z"/><path d="M475 653Q534 645 552 626H1048Q1066 645 1125 653Z" fill="#132f3b"/>
      <path d="M643 900 735 713H865L957 900Z" fill="#18343e"/>
      <path d="M724 738H876M714 759H886M704 781H896M692 806H908M679 832H921M666 860H934M651 891H949" stroke="#648381"/>
      <path d="M0 900 590 725H1010L1600 900Z" fill="#081c28" stroke="none"/>
      <path d="M643 900 735 713H865L957 900" fill="none"/>
      <path d="M724 738H876M714 759H886M704 781H896M692 806H908M679 832H921M666 860H934M651 891H949" stroke="#648381"/>
      <path d="M180 760V614H340V760ZM1260 750V609H1420V750Z"/>
      <path d="M138 623Q201 600 224 566H296Q319 600 382 623L360 637H160ZM1218 618Q1281 595 1304 561H1376Q1399 595 1462 618L1440 632H1240Z" fill="#102b37"/>
    </g>
    <g fill="#eac88b"><path d="M768 651h21v40h-21ZM811 651h21v40h-21Z"/><path d="M247 663h26v33h-26ZM1327 658h26v33h-26Z"/></g>
    <!-- Unequal branches, distant trees and foreground framing. -->
    <g fill="#071c28"><path d="m80 390-52 121h35L5 587h53L0 661h79v171h13V661h96l-68-74h51l-60-76h30ZM1515 365l-50 116h28l-65 91h44l-58 86h91v177h15V658h80l-58-86h45l-57-91h31Z"/><path d="M0 899V708l105 78 111-16 120 129ZM1600 899V704l-120 90-127-13-120 118Z"/></g>
    <path d="M0 755Q300 697 580 752T1160 749T1600 716" fill="none" stroke="#a2ccc3" stroke-width="28" opacity=".06"/>
    <!-- Each group contains different stances, heights and overlapping garments. -->
    <g v-for="(team,index) in teams" :key="team.id" :transform="index ? 'translate(1600 0) scale(-1 1)' : undefined" :style="{ '--clan-color': team.color || (index ? '#7eacba' : '#b7ad83') }" class="watching-clan" :class="{ 'celebrating-clan': team.id === winner }">
      <path d="M130 900 151 815 187 789 231 800 255 900Z" class="ninja-cloth"/><path d="m169 813-8-37 10-31 33-7 30 24-5 41-22 19Z" fill="#061520" stroke="#799c9a"/><path d="m160 778 37 11 32-13M183 824l10 76M157 844l67 17" fill="none" class="ninja-rim" stroke-width="5"/>
      <path d="m282 900-11-49 13-57 43-20 48 24 26 102Z" class="ninja-cloth"/><path d="m302 793-19-34 11-43 38-12 35 25-3 43-26 24Z" fill="#071a26" stroke="#7faba8"/><path d="m288 752 39 16 37-13M314 803l25 97M281 849l95-14" fill="none" class="ninja-rim" stroke-width="6"/><path d="m372 813 35-26 34-6 10 11-38 13-25 34" class="ninja-cloth"/>
      <path d="m423 900 8-57 31-32 40-7 40 41 13 55Z" class="ninja-cloth"/><path d="m458 816-17-26 8-32 31-15 30 20 3 30-23 27Z" fill="#071923" stroke="#789c9a"/><path d="m446 782 31 8 33-14M473 828l-7 72M439 863l83 14" fill="none" class="ninja-rim" stroke-width="4"/>
    </g>
    <path d="M0 900H1600" stroke="#020e18" stroke-width="18"/>
  </svg>
</template>
<style scoped>
.sky-monastery { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }.ninja-cloth { fill: color-mix(in srgb,var(--clan-color) 32%,#061522); stroke: color-mix(in srgb,var(--clan-color) 65%,#173646); stroke-width: 2; }.ninja-rim { stroke: var(--clan-color); opacity: .75; }.celebrating-clan .ninja-rim { stroke: var(--clan-color); filter: drop-shadow(0 0 6px var(--clan-color)); opacity: 1; }.sky-awakening { animation: sky-awaken 1s ease-out both; }@keyframes sky-awaken { from { opacity: .15; } to { opacity: 1; } }@media(prefers-reduced-motion:reduce) { .sky-awakening { animation: none; } }
</style>
