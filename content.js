/* Contenu pédagogique : modules de chant et de parole, sujets, défis réels.
   Chaque module : t (titre), why (pourquoi), x (explication), ok (réussi quand), deep (approfondir), ex (exercices), n (séances). */

window.CHANT = [
  { t: "Le souffle", n: 3,
    why: "Toute la voix repose sur l'air. Un souffle stable donne une note stable, une voix qui ne tremble pas, et la liberté de jouer avec le volume.",
    x: "Quand tu chantes, l'air doit sortir de façon régulière, comme d'un robinet bien réglé. Ce n'est pas une question de quantité d'air, mais de contrôle. À l'inspiration, le ventre et les côtes basses s'ouvrent. À l'expiration, tu freines la sortie de l'air en gardant les côtes ouvertes le plus longtemps possible. C'est ce que les chanteurs appellent l'appui. Sans lui, la gorge compense en serrant.",
    ok: "Ton « sss » dépasse 20 secondes sans à-coups, et ta note tenue reste dans la zone verte du début à la fin.",
    deep: ["Pose les mains sur les côtes basses : elles s'écartent à l'inspiration et restent ouvertes au début de l'expiration.", "Ne gonfle pas la poitrine, ne lève pas les épaules.", "Si la note baisse en fin de souffle, l'appui lâche : arrête-toi avant d'être à bout d'air."],
    ex: [
      { k: "breath" },
      { k: "stable", t: "Note tenue, 8 secondes", how: "Sur « a », volume moyen. Garde la note immobile jusqu'au bout, surtout à la fin.", rel: [0, 2], sec: 8, tol: 20 },
      { k: "stable", t: "Note tenue, 10 secondes", how: "Même exercice, plus long. Respire profondément avant chaque note.", rel: [-1, 3], sec: 10, tol: 20 }
    ] },

  { t: "L'attaque", n: 3,
    why: "Le début de chaque note décide de sa qualité. Une attaque propre rend la voix nette et précise, et protège les cordes vocales.",
    x: "Il y a trois façons de démarrer un son. L'attaque dure : les cordes vocales sont serrées puis lâchent d'un coup, on entend un petit choc. L'attaque soufflée : l'air passe avant le son, comme un « h ». L'attaque équilibrée : l'air et la vibration commencent ensemble. C'est elle qu'on cherche : un son qui naît net, sans choc ni souffle, directement sur la bonne note.",
    ok: "Tes attaques arrivent sur la note en moins de 150 millisecondes, sans glisser depuis le dessous.",
    deep: ["Pour sentir la différence : fais exprès un choc (« ʔa »), puis un souffle (« ha »), puis cherche le milieu.", "Imagine que le son commence comme un soupir très léger, sans air audible.", "Entends la note dans ta tête avant d'ouvrir la bouche : la précision vient de là."],
    ex: [
      { k: "onset", t: "Attaques sur « a »", how: "Écoute la note, puis chante 5 « a » courts (une seconde chacun) séparés par un silence. Vise la note directement.", rel: 0, n: 5 },
      { k: "onset", t: "Attaques plus haut", how: "Même exercice, plus haut. L'attaque doit rester douce et précise.", rel: 4, n: 5 }
    ] },

  { t: "Les registres", n: 3,
    why: "Ta voix a deux mécanismes principaux. Les maîtriser donne accès à toute ta tessiture sans cassure ni forçage.",
    x: "Dans le grave, les cordes vocales vibrent épaisses : c'est la voix de poitrine, pleine, proche de la voix parlée. Dans l'aigu, elles s'affinent : c'est la voix de tête, plus légère. Entre les deux, il y a le passage, la zone où la voix a tendance à casser ou à forcer. Le travail consiste à rendre ce passage progressif, en allégeant la voix en montant au lieu de pousser.",
    ok: "Ta sirène monte et descend sans saut visible sur la courbe.",
    deep: ["Les sons « ng » (comme dans parking), « ou » et les trilles de lèvres facilitent le passage : ils réduisent la pression sur les cordes.", "Travaille toujours le passage à volume faible. Le volume viendra ensuite.", "Une cassure n'est pas un échec : c'est l'information qui te dit où travailler."],
    ex: [
      { k: "siren", t: "Sirène et passage", how: "Sur « ou » ou en trilles de lèvres, glisse lentement du grave à l'aigu, puis redescends. Plusieurs fois. L'appli repère où ta voix saute.", sec: 60 },
      { k: "seq", t: "Gamme autour du passage", how: "Sur « ng » puis « mum », volume faible. Allège en montant.", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], base: "passage" }
    ] },

  { t: "La résonance", n: 3,
    why: "La même note peut sonner sombre, claire, chaude ou perçante. C'est la forme de ta bouche et de ta gorge qui choisit la couleur : c'est ce qui donne à la voix sa portée et son émotion.",
    x: "Les cordes vocales produisent un son brut. La gorge, la bouche et le nez le filtrent, comme la caisse d'une guitare transforme le son d'une corde. Changer de voyelle, ouvrir la gorge, sourire ou avancer le son modifient ce filtre, sans changer la note. Le « twang », un son légèrement nasillard comme un canard (« nyé nyé »), concentre l'énergie : la voix porte loin sans effort.",
    ok: "Tu changes de voyelle sur une même note sans que la note bouge sur la courbe.",
    deep: ["Passe de « i » à « ou » : la langue et les lèvres bougent, la note reste.", "Pour un son plus sombre, imagine le début d'un bâillement. Pour un son plus clair, un léger sourire.", "Le twang s'entend mais ne doit jamais faire mal : c'est un rétrécissement au-dessus des cordes, pas un serrage de la gorge."],
    ex: [
      { k: "stable", t: "Voyelles sur une note", how: "Tiens la note et change de voyelle quand l'écran te le dit. La note ne doit pas bouger.", rel: [0, 3], sec: 10, tol: 25, cue: "vowels" },
      { k: "timer", t: "Le twang", how: "Fais « nyé nyé nyé » comme un canard moqueur, sur quelques notes. Puis chante une phrase de ton choix en gardant un peu de ce son : elle doit porter plus, sans effort.", sec: 120 }
    ] },

  { t: "Les nuances", n: 3,
    why: "Chanter fort ou doucement sur demande est la base de l'expression. Le piège : en changeant de volume, la note change aussi.",
    x: "En chantant plus fort, on a tendance à monter et à serrer. En chantant doucement, on a tendance à baisser et à souffler. L'exercice classique, la messa di voce, consiste à tenir une note en partant très doucement, en gonflant jusqu'à fort, puis en revenant à très doux, sans que la note bouge. Le volume vient du souffle, pas de la gorge.",
    ok: "Ton volume varie d'au moins 15 dB pendant que la note reste dans la zone verte.",
    deep: ["Commence encore plus doucement que tu ne le crois : le plus dur est le très doux.", "Pour monter en volume, augmente le débit d'air depuis le ventre, garde la gorge identique.", "Le retour au très doux est la partie la plus difficile : c'est elle qui montre le contrôle."],
    ex: [
      { k: "stable", t: "Messa di voce", how: "Une note, 10 secondes : très doux, puis fort, puis très doux. Suis les indications à l'écran.", rel: [0, 2], sec: 10, tol: 25, cue: "messa", dyn: true }
    ] },

  { t: "L'agilité", n: 3,
    why: "Passer vite et juste d'une note à l'autre rend la voix souple et précise. Ton oreille est déjà bonne : il s'agit maintenant d'aller plus vite.",
    x: "La mélodie est jouée une fois, puis tu la chantes d'une traite, sans attendre chaque note. Garde le même souffle continu sous toutes les notes, comme une seule ligne, au lieu de relancer chaque note. Plus c'est rapide, plus le son doit être léger.",
    ok: "Tu enchaînes le motif d'une traite avec au moins 80 % de notes justes.",
    deep: ["Commence sur « i » ou « a » léger, jamais en force.", "Si une note rate, ne t'arrête pas : continue la ligne, c'est le réflexe à construire.", "Entends tout le motif dans ta tête avant de commencer."],
    ex: [
      { k: "seq", t: "Gamme rapide", how: "Écoute, puis chante d'une traite.", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], base: -3, chain: true },
      { k: "seq", t: "Arpège rapide", how: "Écoute, puis chante d'une traite.", rel: [0, 4, 7, 12, 7, 4, 0], base: -6, chain: true },
      { k: "seq", t: "Tierces", how: "Do-mi, ré-fa, mi-sol… Écoute, puis chante d'une traite.", rel: [0, 4, 2, 5, 4, 7, 5, 9, 7], base: -4, chain: true }
    ] },

  { t: "L'émotion", n: 3,
    why: "C'est ce que tu cherches dans le chant : faire passer quelque chose. L'émotion n'a rien de magique : elle passe par ce que tu as travaillé, le souffle, l'attaque, la couleur et le volume.",
    x: "Une voix triste est souvent plus soufflée, plus sombre, plus lente, avec des attaques douces. Une voix joyeuse est plus claire et brillante, avec des attaques nettes. Une voix décidée a un appui fort et des fins de phrase stables. La tendresse allège et adoucit. En chantant la même phrase avec quatre intentions, tu découvres comment ton corps traduit chaque émotion, et tu apprends à la produire volontairement.",
    ok: "À la réécoute, quelqu'un qui ne connaît pas l'intention pourrait la deviner.",
    deep: ["Pense à une situation réelle avant chaque prise : le corps suit l'image.", "Change un seul paramètre à la fois au début : le souffle, puis la couleur, puis le tempo.", "Les grands interprètes exagèrent en répétition, puis dosent en concert."],
    ex: [{ k: "emotion" }] },

  { t: "Ta voix parlée", n: 9999,
    why: "Tout ce que tu as travaillé sert aussi quand tu parles : une voix posée, qui porte et qui varie inspire confiance.",
    x: "Sous stress, la voix parlée monte, se serre et devient plate. Pour trouver ta hauteur naturelle, dis « mm-hmm » comme pour approuver : la note qui sort est proche de ta zone de confort. Parler autour de cette note, avec le souffle et la résonance travaillés en chant, rend la voix posée sans la forcer vers le grave.",
    ok: "Ta voix parlée reste autour de ta zone de confort et varie de 3 à 5 demi-tons.",
    deep: ["Avant une réunion : trois « mm-hmm » et une expiration longue.", "Si tu sens ta voix monter, ralentis et respire : elle redescend toute seule.", "La portée vient du twang et du souffle, pas du volume de la gorge."],
    ex: [
      { k: "speech", t: "Ta hauteur parlée", how: "Lis le texte à voix haute, naturellement, comme en réunion. L'appli mesure où se place ta voix et combien elle varie." },
      { k: "proj", t: "Projeter sa voix", how: "Dis « Bonjour à tous, merci d'être là » comme si la personne était à 1 mètre, puis 5 mètres, puis 15 mètres. Augmente le souffle, pas la gorge." }
    ] }
];

window.PAROLE = [
  { t: "Le message clé", n: 3,
    why: "Sous pression, c'est cette phrase qui te sert de repère : tant que tu la connais, tu ne peux pas vraiment te perdre.",
    x: "Avant de parler, une seule question : si la personne ne retient qu'une phrase, laquelle ? C'est le titre de ton affiche. Tout le reste (détails, contexte, nuances) est au service de ce titre. La plupart des présentations qui partent dans tous les sens n'ont pas de message clé : l'orateur découvre ce qu'il veut dire en le disant.",
    ok: "Ton message clé tient en une phrase de moins de 15 mots, et il arrive dans les 10 premières secondes.",
    deep: ["Test du couloir : si tu croisais la personne 30 secondes dans un couloir, que lui dirais-tu ?", "Un message clé contient un verbe et une prise de position : « Le bleu rend la marque plus accessible », pas « Le bleu ».", "Dans la vraie vie cette semaine : avant chaque échange important, écris ton message clé sur un papier."],
    ex: [
      { k: "takes", t: "Message clé d'abord", how: "Écris ton message clé, puis parle 45 secondes. Ta première phrase est ton message clé. Trois prises : chacune plus nette.", topics: "PROJETS", sec: 45, takes: 3, fields: ["Message clé, en une phrase"] },
      { k: "takes", t: "En une phrase, puis développe", how: "Commence par ta réponse en une phrase, puis développe. Trois prises.", topics: "QUICK", sec: 45, takes: 3, fields: ["Ma réponse, en une phrase"] }
    ] },

  { t: "La réponse d'abord", n: 3,
    why: "C'est ce qui empêche ton interlocuteur de décrocher et de reprendre la main.",
    x: "On raconte souvent dans l'ordre où on a pensé : contexte, détails, puis conclusion. L'interlocuteur attend, s'impatiente et reprend le contrôle. Inverse l'ordre : la conclusion d'abord, puis les raisons. Et annonce ton plan : « Je vois deux raisons. La première… » En une phrase, tu donnes une carte à l'autre. Il sait où tu vas, il te laisse y aller.",
    ok: "Ta première phrase est ta conclusion, la deuxième annonce le nombre de points.",
    deep: ["Annonce deux ou trois points, jamais plus. Si tu en as cinq, regroupe-les.", "Tu peux annoncer « deux points » avant même de connaître le deuxième : le cerveau le trouve pendant que tu développes le premier.", "Méthode PREP pour une réponse complète : Point, Raison, Exemple, Point.", "Dans la vraie vie : à la prochaine question en réunion, commence par « Ma réponse est… »."],
    ex: [
      { k: "rapid", t: "Réponses éclair", how: "L'appli te pose une question à voix haute. Réponds en 30 secondes : conclusion d'abord, puis « pour deux raisons ».", list: "QUICK", n: 5, sec: 30, checks: ["Conclusion dans la première phrase", "Plan annoncé (« deux raisons »)", "Fin nette, sans « voilà »"] },
      { k: "takes", t: "PREP en une minute", how: "Point, raison, exemple, point. Trois prises.", topics: "DEBATS", sec: 60, takes: 3, fields: ["Point", "Raison", "Exemple"] }
    ] },

  { t: "Parler de ses doutes", n: 3,
    why: "Sur un travail en cours, le doute est normal. Ce qui fait perdre confiance, c'est quand il se répand dans chaque phrase.",
    x: "« Peut-être », « un peu », « je pense que », « je sais pas si », « en gros » : chacun de ces mots semble prudent, mais ensemble ils donnent une impression d'hésitation générale. L'autre perd confiance dans tout ce que tu dis, même ce dont tu es sûr. La solution : isoler le doute. « Ce dont je suis sûr : … Ce qu'il reste à vérifier : … Ce que je recommande : … » Le doute devient une information précise, et tout le reste redevient solide.",
    ok: "Moins d'un mot de doute par minute, et tes incertitudes regroupées dans « ce qu'il reste à vérifier ».",
    deep: ["Une recommandation n'est pas une certitude : « Je recommande le bleu » reste vrai même si tu hésites un peu.", "« Je ne sais pas encore, je te réponds jeudi » inspire plus confiance qu'une réponse floue.", "Dans la vraie vie : présente un travail en cours avec sûr / à vérifier / je recommande."],
    ex: [
      { k: "rewrite", t: "Chasser les mots de doute" },
      { k: "takes", t: "Sûr, à vérifier, je recommande", how: "Réponds à la situation en trois temps. Tape le bouton à chaque mot de doute. Trois prises.", topics: "DOUTES", sec: 60, takes: 3, fields: ["Ce dont je suis sûr", "Ce qu'il reste à vérifier", "Ce que je recommande"] }
    ] },

  { t: "Gagner du temps sous pression", n: 3,
    why: "C'est souvent en cherchant ta réponse à voix haute que ça part dans tous les sens.",
    x: "Quand une question te prend de court, le cerveau a besoin de deux ou trois secondes pour organiser une réponse. Le réflexe est de commencer à parler tout de suite et de chercher en parlant. Donne-toi ces secondes sans perdre la face : reformule la question (« Si je comprends bien, tu te demandes si… »), utilise une phrase-pont (« Bonne question. Je vois deux choses. »), ou fais simplement deux secondes de silence en regardant ton interlocuteur. Ce silence passe pour de la réflexion, pas pour de l'hésitation.",
    ok: "Après chaque question surprise : une reformulation ou une phrase-pont, puis un plan annoncé.",
    deep: ["Garde deux phrases-ponts prêtes : « Bonne question, je vois deux choses » et « Il y a une réponse courte et une réponse longue ».", "Reformuler montre que tu écoutes, et calme souvent l'autre.", "Dans la vraie vie : à la prochaine question difficile, laisse deux secondes de silence avant de répondre."],
    ex: [
      { k: "rapid", t: "Questions surprises", how: "Pour chaque question : reformule ou phrase-pont, deux secondes, puis réponds avec un plan.", list: "QUICK", n: 5, sec: 30, checks: ["Reformulation ou phrase-pont", "Deux secondes de silence", "Plan annoncé"] },
      { k: "takes", t: "Sous pression", how: "Présente ce sujet. Pendant que tu parles, l'appli va t'interrompre avec une objection. Réponds, puis reprends ton plan.", topics: "PROJETS", sec: 75, takes: 2, fields: ["Message clé"], pressure: "OBJ" }
    ] },

  { t: "Garder le fil", n: 3,
    why: "Les orateurs à l'aise ne sont pas ceux qui ne se perdent jamais, mais ceux qui savent revenir.",
    x: "Même bien parti, on peut être dérouté par une question, une digression ou un trou de mémoire. L'outil : une phrase de retour, toujours la même, qui ramène au message clé. « Pour revenir à l'essentiel : … » ou « Ce qu'il faut retenir : … ». Prépare-la, et utilise-la dès que tu sens que tu t'égares. Ton interlocuteur y verra de la maîtrise, pas une hésitation.",
    ok: "Après chaque interruption, tu reviens au fil avec ta phrase de retour en moins de 20 secondes.",
    deep: ["Le message clé est ton point d'ancrage : sans lui, pas de retour possible.", "Si tu as un trou : « Je reprends » et répète ta dernière idée. Personne ne s'en souviendra.", "Dans la vraie vie : en réunion, conclus ton intervention par « Pour résumer : » et ton message clé."],
    ex: [
      { k: "takes", t: "Interruptions et retour", how: "Parle 90 secondes. L'appli t'interrompt avec une digression : réponds brièvement, puis « Pour revenir à l'essentiel ». Deux prises.", topics: "PROJETS", sec: 90, takes: 2, fields: ["Message clé"], pressure: "DIGRESSIONS" },
      { k: "rapid", t: "Retours éclair", how: "Choisis un projet et son message clé. À chaque digression : une réponse d'une phrase, puis « Pour revenir à l'essentiel : » et ton message clé.", list: "DIGRESSIONS", n: 5, sec: 25, checks: ["Réponse courte à la digression", "Phrase de retour", "Message clé redit"] }
    ] },

  { t: "Présenter un projet", n: 3,
    why: "Ta présentation devient lisible : l'autre sait quoi regarder et pourquoi.",
    x: "Pour présenter un travail, à un client ou à l'équipe, une structure en quatre temps marche presque toujours. La situation : d'où on part (« Le site actuel date de 2018. »). Le problème : ce qui ne va pas (« Il ne convertit pas sur mobile. »). La question : ce qu'on cherchait à résoudre (« Comment le rendre lisible en trois secondes ? »). La réponse : ta proposition, et pourquoi elle répond à la question. Montre le visuel seulement à ce moment-là : avant, personne ne sait quoi regarder.",
    ok: "Ta présentation suit les quatre temps, et le visuel arrive avec la réponse.",
    deep: ["Comme en mise en page : le problème est le titre, la réponse est l'image principale, le reste est du texte courant.", "Pour une équipe interne, la situation peut tenir en une phrase.", "Termine par la décision attendue : « J'ai besoin de ta validation sur la palette. »", "Dans la vraie vie : présente ton prochain travail à l'équipe avec ces quatre temps."],
    ex: [
      { k: "takes", t: "Présenter en quatre temps", how: "Présente le projet en 90 secondes. Deux prises.", topics: "PROJETS", sec: 90, takes: 2, fields: ["Situation", "Problème", "Question", "Réponse"] },
      { k: "takes", t: "Présenter sous pression", how: "Même chose, mais le client va t'interrompre.", topics: "PROJETS", sec: 90, takes: 2, fields: ["Problème", "Réponse"], pressure: "OBJ" }
    ] },

  { t: "Répondre à une objection", n: 3,
    why: "En débat, c'est la différence entre se défendre et expliquer.",
    x: "Une objection n'est pas une attaque, c'est une demande d'information. Les réponses qui marchent suivent trois temps. Reformuler : « Tu trouves que c'est trop sobre. » L'autre se sent compris et baisse la garde. Reconnaître ce qui est juste : « C'est vrai que la palette est retenue. » Répondre : « C'est voulu, parce que… », et si possible proposer : « Je peux te montrer une variante plus contrastée. » Tu ne te défends pas : tu expliques.",
    ok: "Pour chaque objection : reformuler, reconnaître, répondre, sans te justifier longuement.",
    deep: ["Une réponse courte est plus convaincante qu'une longue défense.", "« Qu'est-ce qui te fait dire ça ? » est souvent la meilleure première réponse.", "Concéder un point rend tes autres arguments plus crédibles.", "Dans la vraie vie : lors d'un désaccord, reformule avant de répondre."],
    ex: [
      { k: "rapid", t: "Objections en série", how: "Le client enchaîne les objections. Pour chacune, 45 secondes : reformuler, reconnaître, répondre.", list: "OBJ", n: 4, sec: 45, checks: ["Reformulé", "Reconnu ce qui est juste", "Répondu sans me justifier"] },
      { k: "takes", t: "Débat", how: "Défends ta position en 90 secondes. L'appli va te contredire en cours de route.", topics: "DEBATS", sec: 90, takes: 2, fields: ["Ma position", "Mes deux raisons"], pressure: "CONTRA" }
    ] },

  { t: "Tout assembler", n: 9999,
    why: "La structure devient un réflexe à force de répétition.",
    x: "Tu as les outils : message clé, réponse d'abord, plan annoncé, doutes isolés, phrases-ponts, phrase de retour, quatre temps, réponse aux objections. Chaque séance est maintenant une prise de parole complète, sous pression, que tu écoutes et corriges point par point. C'est l'entraînement des orateurs : répéter, s'écouter, corriger un point à la fois. Et avant une vraie présentation, utilise l'onglet Préparer.",
    ok: "Tu tiens deux minutes sous interruptions sans perdre ton message clé.",
    deep: ["Grille de réécoute : message clé en 10 s ? plan annoncé ? exemple concret ? pauses ? zéro mot de doute ? conclusion qui reprend le message ?", "Dans la vraie vie : propose de présenter un sujet en réunion."],
    ex: [
      { k: "takes", t: "Présentation complète", how: "Deux minutes, avec interruptions.", topics: "PROJETS", sec: 120, takes: 2, fields: ["Message clé", "Point 1", "Point 2"], pressure: "OBJ" },
      { k: "takes", t: "Défendre une idée", how: "Deux minutes pour convaincre, avec contradictions.", topics: "DEBATS", sec: 120, takes: 2, fields: ["Ma position", "Mes raisons"], pressure: "CONTRA" }
    ] }
];

window.LISTS = {
  PROJETS: ["Présente une identité visuelle que tu as créée", "Présente une maquette de site à un client", "Explique pourquoi tu as choisi cette typographie", "Présente l'avancement d'un projet à ton équipe", "Présente le projet dont tu es le plus fier", "Présente la refonte d'un logo", "Explique ta démarche sur ton dernier projet", "Présente deux pistes graphiques et recommande-en une", "Présente une affiche que tu viens de terminer", "Présente une charte graphique à un nouveau collègue"],
  QUICK: ["Pourquoi as-tu choisi ce métier ?", "Qu'est-ce qui fait un bon design ?", "Comment gères-tu un client difficile ?", "Quel est ton processus de travail ?", "Que penses-tu de l'IA dans le design ?", "Qu'est-ce que tu ferais différemment sur ton dernier projet ?", "Pourquoi ce délai ?", "Quel est ton projet préféré, et pourquoi ?", "Comment sais-tu qu'un projet est terminé ?", "Pourquoi devrait-on te confier ce projet ?", "Quelle est ta plus grande qualité au travail ?", "Qu'est-ce qui te motive dans ton travail ?"],
  DEBATS: ["Faut-il toujours suivre les tendances en design ?", "L'IA va-t-elle remplacer les graphistes ?", "Un bon logo doit-il être simple ?", "Faut-il montrer plusieurs pistes au client, ou une seule ?", "Le télétravail est-il bon pour la créativité ?", "Faut-il travailler gratuitement pour se faire connaître ?", "Le client a-t-il toujours raison ?", "Vaut-il mieux être spécialiste ou généraliste ?"],
  DOUTES: ["Le client demande si le site sera prêt vendredi. Tu n'en es pas sûr.", "On te demande si la police choisie est libre de droits. Tu dois vérifier.", "Ton équipe te demande quelle piste graphique garder. Tu hésites entre deux.", "On te demande ton avis sur une maquette qui n'est pas finie.", "Le client veut savoir si la charte fonctionnera sur les réseaux sociaux. Tu n'as pas encore testé.", "Ton responsable demande combien de temps prendra la refonte. Tu n'as pas tous les éléments."],
  OBJ: ["Je trouve ça un peu trop sobre.", "Pourquoi ce choix de couleur ?", "On avait demandé quelque chose de plus moderne.", "Ça va prendre combien de temps ?", "Mon associé n'aime pas le logo.", "Tu es sûr que c'est lisible ?", "On ne peut pas juste agrandir le logo ?", "C'est trop cher.", "Va à l'essentiel, on n'a pas le temps.", "Je ne vois pas où tu veux en venir.", "Quelle est ta recommandation, au final ?", "Et si on faisait l'inverse ?"],
  DIGRESSIONS: ["Au fait, tu as vu le mail de ce matin ?", "Et le budget, on en est où ?", "Ça me fait penser à un autre projet, tu te souviens ?", "Attends, tu peux revenir sur le début ?", "C'est qui, le développeur sur ce projet ?", "Et pour la version anglaise ?"],
  CONTRA: ["Je ne suis pas du tout d'accord.", "Tu as un exemple concret ?", "Ce n'est pas ce que disent les chiffres.", "Ça marche peut-être pour toi, mais pas en général.", "Tu ne réponds pas à la question.", "Et quel est l'inconvénient de ta position ?"]
};

window.REWRITES = [
  ["Je pense que peut-être on pourrait essayer le bleu, enfin je sais pas.", "Je recommande le bleu."],
  ["C'est un peu une première version, c'est pas encore trop ça.", "Voici la première version. Deux points sont encore à affiner."],
  ["Je suis pas sûr, mais je crois que ça devrait être prêt vendredi.", "Ce sera prêt vendredi, si je reçois les textes mercredi."],
  ["En fait, du coup, l'idée c'était un peu de moderniser.", "L'objectif : moderniser l'image."],
  ["Je sais pas si ça vous parle, mais j'ai essayé un truc.", "J'ai exploré une piste différente. Je vous la montre."],
  ["C'est peut-être un peu trop chargé, non ?", "La page est trop chargée. Je propose de retirer deux blocs."]
];

/* Le regard des autres : une idée par séance, lue au bilan */
window.FEAR = [
  ["L'effet projecteur", "On surestime fortement à quel point les autres remarquent nos erreurs. Dans une étude célèbre, des étudiants obligés de porter un t-shirt gênant pensaient que la moitié de la salle l'avait remarqué. En réalité, beaucoup moins. Les autres pensent surtout à eux."],
  ["L'illusion de transparence", "Tu as l'impression que ton stress se voit. Il se voit beaucoup moins que tu ne le crois. Des orateurs à qui on avait expliqué ce phénomène ont été jugés plus à l'aise que les autres."],
  ["« Je suis excité »", "Avant de parler, dire « je suis excité » plutôt que « calme-toi » aide davantage : le corps est déjà en alerte, il est plus facile de transformer cette énergie que de l'éteindre."],
  ["La peur baisse en la faisant", "C'est le résultat le plus solide sur le trac : chaque prise de parole réelle rend la suivante un peu plus facile. Les défis réels sont faits pour ça."],
  ["L'autre est de ton côté", "Une personne qui t'écoute préfère te voir à l'aise. Elle n'attend pas ton erreur : elle attend de comprendre ce que tu proposes."],
  ["Préparer, c'est réduire l'inconnu", "La peur se nourrit de l'incertitude. Un message clé et trois points connus à l'avance retirent une grande partie de l'inconnu, et donc de la peur."],
  ["Une erreur bien gérée rassure", "« Je reformule. » ou « Je reprends. », dit calmement, montre de la maîtrise. Ce n'est pas l'erreur qu'on retient, c'est la façon de la gérer."],
  ["Ce que tu ressens n'est pas ce qu'on voit", "Réécoute une prise faite sous stress : la plupart du temps, on n'entend presque rien de ce que tu ressentais."]
];

/* Défis réels, du plus facile au plus difficile */
window.DEFIS = [
  "Envoie un message vocal d'une minute au lieu d'un message écrit.",
  "Pose une question en réunion ou en public.",
  "Donne ton avis en premier sur un sujet, en équipe ou entre amis.",
  "Dans une conversation, annonce ton plan : « J'ai deux idées. »",
  "Face à une question difficile, laisse deux secondes de silence avant de répondre.",
  "Présente un travail en cours avec : sûr / à vérifier / je recommande.",
  "Lors d'un désaccord, reformule l'avis de l'autre avant de répondre.",
  "Raconte une anecdote à un groupe de plus de trois personnes.",
  "Présente un projet à ton équipe : message clé d'abord, puis trois points.",
  "Appelle un client ou un partenaire au lieu de lui écrire.",
  "Propose de présenter un sujet lors d'une réunion.",
  "Présente un projet à un client avec les quatre temps, en répondant aux objections."
];

window.SPEECH_TEXT = "Bonjour à tous. Je vais vous présenter la nouvelle identité visuelle en trois points. D'abord, le constat : l'ancienne image ne parlait plus à nos clients. Ensuite, la proposition : une palette plus claire et une typographie plus lisible. Enfin, la suite : les premiers supports seront prêts dans trois semaines. Ma recommandation est simple : lancer la nouvelle identité dès le mois prochain.";
window.EMO_PHRASE = [0, 0, 0, 2, 4, 2, 0, 4, 2, 2, 0];
