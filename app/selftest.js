'use strict';
/* Self-test bot (?selftest=1): clicks through a full solo season. Zero deps. */
function selftest() {
  const m = /selftest=(\d+)/.exec(location.search);
  const stopAfter = m ? parseInt(m[1], 10) : 99;
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));
  try {
    for (let k = 0; k < 12; k++) {
      if (q('#startBtn')) break;
      const nx = q('#wizNext');
      if (!nx) throw new Error('no wizard advance');
      nx.click();
    }
    if (!q('#startBtn')) throw new Error('no setup');
    q('#startBtn').click();
    for (let w = 1; w <= 16 && !q('.rank'); w++) {
      if (q('.rank')) break;
      if (q('#roadBtn')) {
        q('#roadBtn').click();
        if (q('#payFix')) q('#payFix').click(); else if (q('#eatFix')) q('#eatFix').click();
      }
      if (q('.rank')) break;
      const offers = qa('[data-offer]');
      if (!offers.length) throw new Error('no offers w' + w);
      offers[0].click();
      const rd = qa('[data-shop]').find(b => b.getAttribute('data-shop') === 'roadie');
      if (rd && !rd.disabled) rd.click();
      if (!q('#rollBtn')) {
        if (q('.rank')) break;
        throw new Error('no roll w' + w + ' phase=' + qa('.badge').map(b => b.textContent).join('|'));
      }
      q('#rollBtn').click();
      const dice = qa('[data-die]');
      if (dice.length < 5) throw new Error('no dice w' + w);
      dice[0].click(); dice[1].click();
      const pb = q('#playBtn');
      if (!pb || pb.disabled) throw new Error('play blocked w' + w);
      pb.click();
      if (q('#songBtn')) q('#songBtn').click();
      for (let k = 0; k < 10; k++) {
        const rows = qa('[data-work]');
        if (!rows.length) break;
        (rows.find(b => b.getAttribute('data-work').endsWith('|job')) || rows[0]).click();
      }
      const fb = q('#flyerBtn');
      if (!fb || fb.disabled) throw new Error('flyer blocked w' + w);
      fb.click();
      if (!q('#flyerOverlay')) throw new Error('no flyer modal w' + w);
      if (w >= stopAfter) { document.title = 'SELFTEST:PAUSED wk' + w; return; }
      const ew = q('#endWeekBtn');
      if (!ew) throw new Error('end blocked w' + w);
      ew.click();
    }
    const rank = q('.rank');
    if (!rank) throw new Error('no results');
    document.title = 'SELFTEST:PASS rank=' + rank.textContent.trim().slice(0, 40);
  } catch (e) { document.title = 'SELFTEST:FAIL ' + e.message; }
}
selftest();
