// Shared by every game. Tells a game which menu opened it and who's playing:
//   Grandkid Games:  game/index.html?player=Navy
//   Joe's Arcade:    game/index.html?hub=arcade&player=Joe
// No hub in the link means the grandkids' menu, so older links and saves keep working.
var GK_HUB = (function () { try { return new URLSearchParams(location.search).get('hub') === 'arcade' ? 'arcade' : 'kids'; } catch (e) { return 'kids'; } })();
var GK_ARCADE = GK_HUB === 'arcade';
var GK_PLAYER = (function () {
  try {
    var p = new URLSearchParams(location.search).get('player') || '';
    // Grandkid names are read exactly as before (their save keys depend on it).
    // Colons are dropped from arcade names because they separate the parts of a save key.
    return GK_ARCADE ? p.replace(/:/g, '').replace(/\s+/g, ' ').trim().slice(0, 20) : p.trim().slice(0, 14);
  } catch (e) { return ''; }
})();
// Save keys carry the hub, the player, and the game's own key, so nobody shares progress:
//   grandkids: gk:navy:fb_best       (unchanged)
//   arcade:    arcade:joe:fb_best
function gkKey(k) {
  if (GK_ARCADE) return 'arcade:' + (GK_PLAYER ? GK_PLAYER.toLowerCase() + ':' : '') + k;
  return GK_PLAYER ? 'gk:' + GK_PLAYER.toLowerCase() + ':' + k : k;
}
// A button back to the menu that opened the game. Only shown when a menu opened it.
function gkHomeLink(extraClass) {
  if (!GK_PLAYER) return null;
  var a = document.createElement('a');
  a.href = (GK_ARCADE ? '../arcade/index.html' : '../index.html') + '?player=' + encodeURIComponent(GK_PLAYER);
  a.className = 'gk-home' + (extraClass ? ' ' + extraClass : '');
  a.textContent = '\u{1F3E0} All games';
  return a;
}
