/* Prépa TPC — La Martinière Diderot
   Comportements communs à toutes les pages. Rien à modifier ici :
   les contenus éditables (témoignages, vidéos, écoles) sont en haut de chaque page. */
(function () {
  // Menu sur téléphone
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Sorties (page La vie en TPC) : construites avant le chargement des photos ci-dessous
  var sbox = document.getElementById('sorties');
  if (sbox && window.SORTIES) {
    var e2 = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    sbox.innerHTML = window.SORTIES.map(function (s) {
      return '<article class="sortie"><figure class="photo" data-src="' + e2(s.photo) + '" data-alt="' + e2(s.titre) + '"></figure>' +
        '<div class="sortie-texte">' + (s.date ? '<span class="date">' + e2(s.date) + '</span>' : '') +
        '<h3>' + e2(s.titre) + '</h3>' + (s.legende ? '<p>' + e2(s.legende) + '</p>' : '') + '</div></article>';
    }).join('');
  }

  // Carte des deux sites (page La vie en TPC) : Leaflet, chargé depuis lib/
  var carte = document.getElementById('carte');
  if (carte && window.SITES) {
    if (!window.L) {
      carte.classList.add('sans-carte');
      carte.textContent = 'La carte n’a pas pu se charger. Les adresses des deux sites sont indiquées ci-contre.';
    } else {
      var css = getComputedStyle(document.body);
      var teinte = { cours: css.getPropertyValue('--nuit').trim() || '#14213D', tp: css.getPropertyValue('--accent').trim() || '#3A3AD0' };
      var mobile = window.matchMedia('(pointer: coarse)').matches;
      var map = L.map(carte, { scrollWheelZoom: false, dragging: !mobile, tap: false, zoomControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">les contributeurs d’OpenStreetMap</a>'
      }).addTo(map);
      var pts = window.SITES.map(function (s) {
        var c = teinte[s.type] || teinte.cours;
        L.circleMarker([s.lat, s.lon], { radius: 10, color: '#fff', weight: 3, fillColor: c, fillOpacity: 1 })
          .addTo(map)
          .bindTooltip('<b>' + esc(s.nom) + '</b><br>' + esc(s.role), { permanent: true, direction: s.type === 'tp' ? 'bottom' : 'top', offset: [0, s.type === 'tp' ? 12 : -12], className: 'etiquette-site' });
        return [s.lat, s.lon];
      });
      map.fitBounds(pts, { padding: [85, 80], maxZoom: 16 });
    }
  }

  // Photos : on charge img/xxx.jpg ; si le fichier n'existe pas encore, un emplacement indique quoi fournir.
  document.querySelectorAll('figure.photo[data-src]').forEach(function (fig) {
    var img = new Image();
    img.alt = fig.getAttribute('data-alt') || '';
    img.onload = function () { fig.classList.remove('manque'); fig.insertBefore(img, fig.firstChild); };
    img.onerror = function () {
      fig.classList.add('manque');
      var e = document.createElement('div');
      e.className = 'etiquette';
      e.innerHTML = '<b>Photo à ajouter</b>' + (fig.getAttribute('data-alt') || '') +
        '<br><small>Fichier attendu : ' + fig.getAttribute('data-src') + '</small>';
      fig.insertBefore(e, fig.firstChild);
    };
    img.src = fig.getAttribute('data-src');
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Vidéos (page Témoignages) : la vidéo YouTube ne se charge qu'au clic.
  var vbox = document.getElementById('videos');
  if (vbox && window.VIDEOS) {
    vbox.innerHTML = window.VIDEOS.map(function (v, i) {
      var ecran = v.youtube
        ? '<div class="ecran"><button type="button" data-i="' + i + '" aria-label="Lire la vidéo : ' + esc(v.titre) + '">' +
          '<img src="https://i.ytimg.com/vi/' + esc(v.youtube) + '/hqdefault.jpg" alt=""><span class="lecture"></span></button></div>'
        : '<div class="ecran manque">Vidéo à ajouter : renseigner son identifiant YouTube dans la liste VIDEOS.</div>';
      return '<figure class="video">' + ecran + '<figcaption><b>' + esc(v.titre) + '</b><span>' + esc(v.legende) + '</span></figcaption></figure>';
    }).join('');
    vbox.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var v = window.VIDEOS[+b.getAttribute('data-i')];
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtube) + '?autoplay=1&rel=0';
      f.title = v.titre;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      b.parentNode.replaceChild(f, b);
    });
  }

  // Témoignages écrits
  var pbox = document.getElementById('paroles');
  if (pbox && window.TEMOIGNAGES) {
    pbox.innerHTML = window.TEMOIGNAGES.map(function (t) {
      var av = t.photo ? '<img class="avatar" src="' + esc(t.photo) + '" alt="">' : '';
      return '<figure class="parole"><blockquote>' + esc(t.texte) + '</blockquote><figcaption>' + av +
        '<div><b>' + esc(t.prenom) + '</b><span>' + esc(t.parcours) + '</span></div></figcaption></figure>';
    }).join('');
  }

  // L'équipe (page d'accueil) : photo ronde, ou initiales si la photo n'existe pas encore
  var ebox = document.getElementById('equipe');
  if (ebox && window.EQUIPE) {
    ebox.innerHTML = window.EQUIPE.map(function (m) {
      var init = m.nom.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
      return '<figure class="membre"><div class="visage" data-init="' + esc(init) + '">' +
        (m.photo ? '<img src="' + esc(m.photo) + '" alt="">' : esc(init)) + '</div>' +
        '<figcaption><b>' + esc(m.nom) + '</b><span>' + esc(m.matiere) + '</span>' + (m.mot ? '<q>' + esc(m.mot) + '</q>' : '') + '</figcaption></figure>';
    }).join('');
    ebox.querySelectorAll('.visage img').forEach(function (img) {
      img.addEventListener('error', function () { var v = img.parentNode; v.textContent = v.getAttribute('data-init'); });
    });
  }

  // Formulaire « Nous contacter » : envoi vers le formulaire Google configuré en bas de contact.html
  var cf = document.getElementById('contact-form');
  if (cf && window.GOOGLE_FORM) {
    var G = window.GOOGLE_FORM, st = document.getElementById('contact-statut'), bt = cf.querySelector('button[type="submit"]');
    var pret = G.action.indexOf('A_REMPLACER') < 0;
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var champs = ['nom', 'email', 'objet', 'message'], manque = [];
      champs.forEach(function (n) {
        var el = cf.elements[n], vide = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.classList.toggle('invalide', vide);
        if (vide) manque.push(el);
      });
      if (manque.length) { st.className = 'statut ko'; st.textContent = 'Merci de compléter les champs indiqués en rouge.'; manque[0].focus(); return; }
      if (cf.elements.site.value) return;              // robot : on ne fait rien
      if (!pret) { st.className = 'statut ko'; st.textContent = 'Le formulaire n’est pas encore relié. Appelez le standard du lycée en attendant.'; return; }
      var data = new URLSearchParams();
      ['nom', 'email', 'lycee', 'objet', 'message'].forEach(function (n) { data.append(G[n], cf.elements[n].value.trim()); });
      bt.disabled = true; st.className = 'statut'; st.textContent = 'Envoi…';
      fetch(G.action, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () { st.className = 'statut ok'; st.textContent = '✓ Message envoyé. Nous vous répondrons rapidement à ' + cf.elements.email.value.trim() + '.'; cf.reset(); })
        .catch(function () { st.className = 'statut ko'; st.textContent = 'Échec de l’envoi : vérifiez votre connexion et réessayez.'; })
        .then(function () { bt.disabled = false; });
    });
  }

  // Volumes horaires (page La prépa) : une ligne par matière, un carré par heure
  var hbox = document.getElementById('heures');
  if (hbox && window.HORAIRES) {
    var ICONES = {
      maths: '<path d="M15 4.2c-1.6-1.3-3.9-.7-4.2 1.7L9.2 18.1c-.3 2.4-2.6 3-4.2 1.7"/>',
      physique: '<path d="M2 12c1.7-5.3 3.3-5.3 5 0s3.3 5.3 5 0 3.3-5.3 5 0 3.3 5.3 5 0"/>',
      chimie: '<path d="M12 3.5l7.4 4.25v8.5L12 20.5l-7.4-4.25v-8.5z"/><circle cx="12" cy="12" r="3.6"/>',
      lettres: '<path d="M3 6.2c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0zM21 6.2c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z"/>',
      anglais: '<path d="M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 3.8v-3.8h-2A1.5 1.5 0 0 1 3 15V6a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M8.6 8.2h-2v5h2M6.6 10.7h1.6M10.8 13.2v-5l2.8 5v-5" stroke-width="1.4"/>',
      info: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/>',
      tipe: '<path d="M9.2 17.5h5.6M10 20.5h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1 1.2 1 2v1.2h5.2v-1.2c0-.8.3-1.5 1-2A6 6 0 0 0 12 3z"/>',
      eps: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5v17M6 6c2.2 1.6 3.5 3.7 3.5 6S8.2 16.4 6 18M18 6c-2.2 1.6-3.5 3.7-3.5 6s1.3 4.4 3.5 6"/>'
    };
    var H = window.HORAIRES, tot = 0, sci = 0;
    H.forEach(function (m) { tot += m.heures; if (m.sciences) sci += m.heures; });
    var fmt = function (h) { return String(h).replace('.', ',') + ' h'; };
    var lignes = H.map(function (m) {
      var plein = Math.floor(m.heures), reste = m.heures - plein, cases = '';
      for (var n = 0; n < plein; n++) cases += '<i></i>';
      if (reste > 0) cases += '<i style="width:calc(var(--case) * ' + reste.toFixed(2) + ')"></i>';
      var ico = ICONES[m.icone] ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONES[m.icone] + '</svg>' : '';
      return '<li class="' + (m.sciences ? 'sci' : 'autre') + '"><span class="ico">' + ico + '</span>' +
        '<span class="nom">' + esc(m.matiere) + '</span><span class="cases" aria-hidden="true">' + cases + '</span>' +
        '<b class="nb">' + fmt(m.heures) + '</b></li>';
    }).join('');
    hbox.innerHTML = '<div class="heures-tete"><p class="heures-total"><b>' + fmt(tot) + '</b> de cours par semaine, dont <b>' + fmt(sci) + '</b> de sciences</p>' +
      '<p class="heures-cle"><span class="cle sci"></span> sciences <span class="cle autre"></span> autres&nbsp;matières · un&nbsp;carré&nbsp;=&nbsp;une&nbsp;heure</p></div>' +
      '<ul class="heures-liste">' + lignes + '</ul>';
  }

  // Écoles (page Après la prépa) : filtre par domaine
  var tb = document.getElementById('ecoles-corps');
  if (tb && window.ECOLES) {
    var D = window.DOMAINES, actif = 'tout';
    var filtres = document.getElementById('filtres');
    var doms = ['tout'].concat(Object.keys(D).filter(function (k) { return window.ECOLES.some(function (s) { return s.domaines.indexOf(k) >= 0; }); }));
    filtres.innerHTML = doms.map(function (k) {
      return '<button type="button" data-d="' + k + '" aria-pressed="' + (k === actif) + '">' + (k === 'tout' ? 'Toutes' : D[k]) + '</button>';
    }).join('');
    function rendu() {
      var rows = window.ECOLES.filter(function (s) { return actif === 'tout' || s.domaines.indexOf(actif) >= 0; });
      tb.innerHTML = rows.map(function (s) {
        return '<tr><td><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.nom) + '</a>' +
          (s.remarque ? '<span class="rq">' + esc(s.remarque) + '</span>' : '') + '</td>' +
          '<td class="col-ville">' + esc(s.ville) + '</td>' +
          '<td class="dom">' + s.domaines.map(function (d) { return D[d]; }).join(', ') + '</td>' +
          '<td class="num">' + (s.places ? s.places + (s.partage ? '*' : '') : '—') + '</td></tr>';
      }).join('');
    }
    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-d]'); if (!b) return;
      actif = b.getAttribute('data-d');
      filtres.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      rendu();
    });
    rendu();
  }

  // Écoles sur dossier
  var tb2 = document.getElementById('dossier-corps');
  if (tb2 && window.ECOLES_DOSSIER) {
    tb2.innerHTML = window.ECOLES_DOSSIER.map(function (s) {
      return '<tr><td><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.nom) + '</a><span class="rq">' + esc(s.remarque) + '</span></td>' +
        '<td class="col-ville">' + esc(s.ville) + '</td><td class="dom">' + esc(s.specialites) + '</td></tr>';
    }).join('');
  }

  // Anciens
  var abox = document.getElementById('anciens-corps');
  if (abox && window.ANCIENS) {
    abox.innerHTML = window.ANCIENS.length ? window.ANCIENS.map(function (a) {
      return '<tr><td>' + esc(a.annee) + '</td><td>' + esc(a.ecole) + '</td><td class="num">' + esc(a.nombre) + '</td></tr>';
    }).join('') : '<tr><td colspan="3"><span class="a-completer">À compléter : ajouter une ligne par école et par année dans la liste ANCIENS.</span></td></tr>';
  }
})();
