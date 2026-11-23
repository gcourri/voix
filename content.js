/* Contenu pédagogique : réflexes de structure, mini-cours, sujets, chant (facultatif). */

/* Les réflexes de structure, du plus simple au plus complet.
   Chaque réflexe : t, why, x (explication), rule (la règle), missions (à appliquer dans la journée), checks (réécoute), fields (écriture), topics (sujets). */
window.REFLEXES = [
  { t: "La destination", n: 3, topics: "QUICK",
    why: "C'est ce qui t'évite de chercher en parlant. Tant que tu sais où tu vas, tu ne te perds pas.",
    x: "Avant de parler, demande-toi : quelle est ma dernière phrase ? Ce que je veux que l'autre retienne, ou décide. Deux secondes suffisent. Puis tu dis cette destination tout de suite, au début, et le reste ne sert qu'à y mener. On se perd quand on découvre sa conclusion en parlant. Avec une destination, chaque phrase a une direction.",
    rule: "Deux secondes de silence. Je décide de ma dernière phrase. Je la dis en premier.",
    missions: [
      "Quand on me pose une question, je laisse deux secondes et je décide de ma dernière phrase avant de répondre.",
      "Quand j'écris un message ou un mail, la première ligne est ma conclusion.",
      "Avant chaque réunion, j'écris sur un papier la phrase que je veux que les autres retiennent.",
      "Quand je raconte quelque chose, je commence par la fin : « Il s'est passé un truc drôle : … »",
      "Après une conversation importante, je me demande : quelle était ma destination ? L'ai-je dite ?",
      "Avant de montrer un visuel, je dis ce que j'attends de l'autre : un avis, une validation, une décision."
    ],
    checks: ["J'ai dit ma destination dans les 10 premières secondes"],
    fields: ["Ma destination : ma dernière phrase"] },

  { t: "Le nombre annoncé", n: 3, topics: "AVIS",
    why: "Annoncer « deux choses » t'oblige à trier tes idées, et donne une carte à ton interlocuteur.",
    x: "Après ta destination, annonce combien de points tu vas donner : « Pour deux raisons. », « Trois choix. ». Ton cerveau cherche alors exactement ce nombre, et arrête de partir dans tous les sens. Ton interlocuteur sait où il en est, et ne te coupe pas pour reprendre la main. Deux ou trois, jamais plus. Tu peux même annoncer « deux » avant de connaître le second : il arrive pendant que tu développes le premier.",
    rule: "Destination, puis « Il y a deux raisons. La première… La deuxième… »",
    missions: [
      "Quand je donne mon avis, j'annonce le nombre de raisons : « Pour deux raisons. »",
      "Quand j'explique un choix graphique, je dis « Trois choix », puis « premier, deuxième, troisième ».",
      "En réunion, j'observe les autres : qui annonce le nombre de ses points ? Comment ça se passe ?",
      "Quand je fais un retour sur un travail, je le structure : « Deux choses qui marchent, une à revoir. »",
      "Ce soir, j'explique mon projet en cours à quelqu'un en deux points, pas plus.",
      "Avant d'écrire un message, je numérote mes idées."
    ],
    checks: ["J'ai annoncé le nombre de points et je l'ai respecté"],
    fields: ["Ma destination", "Point 1", "Point 2"] },

  { t: "Finir sa phrase", n: 3, topics: "AVIS",
    why: "Les reprises (« enfin, je veux dire… ») brouillent ton message et donnent une impression d'hésitation. Ce sont elles qui te font perdre le fil.",
    x: "Quand tu te reprends, tu recommences une phrase avant d'avoir fini la première. L'autre doit garder les deux versions en tête, et toi aussi. La règle : une phrase commencée se termine, même imparfaite. Puis point. Si elle n'était pas parfaite, la suivante précise. Les phrases courtes rendent ça facile : sujet, verbe, complément, stop. À l'oral, une phrase courte n'est jamais trop simple.",
    rule: "Je finis ma phrase. Point. La suivante précise, si besoin.",
    missions: [
      "Dans une conversation, je repère chaque « enfin, je veux dire » et je finis plutôt ma phrase.",
      "Quand j'explique quelque chose, je fais des phrases de moins de 15 mots.",
      "Quand je sens que je vais me reprendre, je finis ma phrase, je marque une pause, puis je précise.",
      "J'enregistre un message vocal d'une minute et je compte mes reprises.",
      "Quand je présente un visuel : une phrase par élément. « La typo est ronde. Elle rend la marque accessible. »",
      "Je remplace « et… et… et… » par des points : une idée, une phrase."
    ],
    checks: ["Je n'ai presque pas recommencé de phrase", "Mes phrases étaient courtes"],
    fields: ["Ma destination", "Point 1", "Point 2"] },

  { t: "Les mots-clés", n: 3, topics: "PROJETS",
    why: "C'est ce que l'autre retiendra. Les choisir à l'avance te donne des repères pendant que tu parles.",
    x: "Pour chaque idée, choisis un à trois mots qui la résument : « lisible », « chaleureux », « premium ». Ce sont tes balises : pendant que tu parles, tu vas d'un mot-clé au suivant, comme on suit des repères sur un chemin. Appuie-les avec la voix : ralentis légèrement, fais une micro-pause juste avant. Et répète-les. À l'oral, la répétition n'est pas une faute : c'est ce qui fait retenir.",
    rule: "Trois mots-clés choisis avant. Je les appuie et je les répète.",
    missions: [
      "Avant une réunion, je choisis trois mots-clés pour mon intervention et je les place.",
      "Quand je présente un projet, je répète le mot de l'intention au moins trois fois.",
      "Quand quelqu'un présente, je note ses mots-clés : sont-ils clairs ? En a-t-il ?",
      "Je décris une affiche ou un site croisé dans la journée en trois mots-clés.",
      "Dans un message, je place le mot le plus important au début de la phrase.",
      "Quand je donne un retour, je résume chaque remarque en un mot avant de l'expliquer."
    ],
    checks: ["J'ai appuyé et répété mes mots-clés"],
    fields: ["Ma destination", "Point 1", "Point 2", "Mes 3 mots-clés"] },

  { t: "Boucler", n: 3, topics: "PROJETS",
    why: "La fin est ce qu'on retient le mieux. Boucler sur ta destination donne une impression de clarté et de maîtrise.",
    x: "Beaucoup d'interventions s'éteignent : « …voilà, enfin, je sais pas. » Ta dernière phrase doit être ta destination, redite : « Donc je te propose de garder la piste B. » Puis tu t'arrêtes et tu laisses le silence. C'est le signal que tu as fini, et c'est souvent le moment où l'autre acquiesce. Pas de « voilà », pas de « bref » : ta destination, puis silence.",
    rule: "Je termine par « Donc… » et ma destination. Puis silence.",
    missions: [
      "Je termine chaque intervention en réunion par « Donc… » et ma conclusion.",
      "Je supprime « voilà » à la fin de mes phrases : je m'arrête et je laisse le silence.",
      "Quand je présente un projet, je finis par la décision que j'attends : « J'ai besoin de ta validation sur… »",
      "Je termine mes messages par une phrase de conclusion claire.",
      "Après avoir conclu, je compte deux secondes avant de reprendre la parole.",
      "Quand j'explique quelque chose, je finis par « En résumé : » et une seule phrase."
    ],
    checks: ["J'ai fini par ma destination, sans « voilà »"],
    fields: ["Ma destination", "Point 1", "Point 2", "Mes 3 mots-clés"] },

  { t: "Intention, choix, effet", n: 4, topics: "PROJETS",
    why: "C'est la structure du directeur artistique. Elle rend tes présentations lisibles et tes choix défendables.",
    x: "Pour présenter un travail créatif, trois temps. L'intention : ce qu'on veut faire ressentir ou obtenir. Les choix : deux ou trois décisions concrètes (typo, couleur, image, composition). L'effet : ce que ça produit, comparé à avant. « L'intention : rendre la marque plus chaleureuse. Trois choix : une typo ronde, une palette terre, des photos en lumière naturelle. L'effet : on passe d'une image froide à une image proche. » Chaque choix est relié à l'intention : c'est ce qui le rend défendable face à une objection.",
    rule: "Intention, puis deux ou trois choix, puis l'effet. Chaque choix sert l'intention.",
    missions: [
      "Quand je présente un visuel, je dis l'intention avant de le montrer.",
      "Je décris un projet que j'admire avec intention, choix, effet.",
      "Quand on critique un de mes choix, je le relie à l'intention : « Ce choix sert… »",
      "Je briefe un graphiste ou un prestataire en commençant par l'intention, pas par les détails.",
      "Devant une campagne de pub dans la rue, je devine son intention et ses trois choix.",
      "Avant de montrer une maquette à l'équipe, je l'écris en trois lignes : intention, choix, effet."
    ],
    checks: ["J'ai suivi intention, choix, effet", "Chaque choix était relié à l'intention"],
    fields: ["Intention", "Choix 1", "Choix 2", "Choix 3", "Effet", "Mots-clés"] },

  { t: "Tout assembler", n: 9999, topics: "TOUT",
    why: "Les réflexes deviennent automatiques à force de répétition.",
    x: "Destination, nombre annoncé, phrases finies, mots-clés, bouclage, et pour un travail créatif : intention, choix, effet. Chaque exercice les mobilise tous. Choisis un seul point à corriger par prise : c'est comme ça qu'on progresse le plus vite. Et avant une vraie présentation, utilise l'onglet Préparer.",
    rule: "Destination, nombre, phrases finies, mots-clés, boucle.",
    missions: [
      "Quand on me pose une question, deux secondes, puis ma dernière phrase en premier.",
      "Je termine chaque intervention par « Donc… » et ma conclusion.",
      "Quand je présente un visuel, je dis l'intention avant de le montrer.",
      "Je repère mes reprises dans une conversation et je finis mes phrases.",
      "Avant une réunion, j'écris ma destination et trois mots-clés.",
      "Ce soir, je résume ma journée en trois phrases à voix haute."
    ],
    checks: [],
    fields: ["Ma destination", "Point 1", "Point 2", "Mots-clés"] }
];

window.MINICOURS = {
  topics: ["La hiérarchie typographique", "Choisir une palette de couleurs", "Le contraste en design", "Qu'est-ce qu'une identité visuelle ?", "La grille de mise en page", "Le rôle du blanc dans une page", "Comment briefer un photographe", "Un logo doit-il être simple ?", "Ce qui rend une affiche lisible de loin", "À quoi sert une charte graphique ?", "Associer deux typographies", "Présenter un projet à un client"],
  how: "Un bon mini-cours : une destination (ce que l'élève saura faire à la fin), trois points, un exemple concret, une boucle. Trois minutes. Enseigner oblige à structurer plus que tout le reste : c'est le meilleur entraînement pour clarifier ta pensée.",
  fields: ["Destination : à la fin, tu sauras…", "Point 1", "Point 2", "Point 3", "Un exemple concret", "Mots-clés"],
  checks: ["Destination annoncée au début", "Trois points annoncés et suivis", "Un exemple concret", "Bouclé sur la destination", "Un débutant aurait compris"]
};

window.LISTS = {
  AVIS: ["Quel est le meilleur site web que tu connaisses, et pourquoi ?", "Faut-il montrer une ou plusieurs pistes au client ?", "Pourquoi un bon brief change tout ?", "Ton outil de travail indispensable, et pourquoi", "Qu'est-ce qui fait une bonne affiche ?", "Faut-il suivre les tendances en design ?", "Ce que tu changerais dans l'identité visuelle de ta ville", "Comment choisis-tu une typographie ?", "L'IA va-t-elle changer le métier de directeur artistique ?", "Quel est le rôle d'un directeur artistique ?"],
  PROJETS: ["Présente une identité visuelle que tu as créée", "Présente une maquette de site à un client", "Explique pourquoi tu as choisi cette typographie", "Présente l'avancement d'un projet à ton équipe", "Présente le projet dont tu es le plus fier", "Présente la refonte d'un logo", "Explique ta démarche sur ton dernier projet", "Présente deux pistes graphiques et recommande-en une", "Présente une affiche que tu viens de terminer", "Présente une charte graphique à un nouveau collègue"],
  QUICK: ["Pourquoi as-tu choisi ce métier ?", "Qu'est-ce qui fait un bon design ?", "Comment gères-tu un client difficile ?", "Quel est ton processus de travail ?", "Que penses-tu de l'IA dans le design ?", "Qu'est-ce que tu ferais différemment sur ton dernier projet ?", "Pourquoi ce délai ?", "Quel est ton projet préféré, et pourquoi ?", "Comment sais-tu qu'un projet est terminé ?", "Pourquoi devrait-on te confier ce projet ?", "Quelle est ta plus grande qualité au travail ?", "Qu'est-ce qui te motive dans ton travail ?"],
  DEBATS: ["Faut-il toujours suivre les tendances en design ?", "L'IA va-t-elle remplacer les graphistes ?", "Un bon logo doit-il être simple ?", "Faut-il montrer plusieurs pistes au client, ou une seule ?", "Le télétravail est-il bon pour la créativité ?", "Faut-il travailler gratuitement pour se faire connaître ?", "Le client a-t-il toujours raison ?", "Vaut-il mieux être spécialiste ou généraliste ?"],
  DOUTES: ["Le client demande si le site sera prêt vendredi. Tu n'en es pas sûr.", "On te demande si la police choisie est libre de droits. Tu dois vérifier.", "Ton équipe te demande quelle piste graphique garder. Tu hésites entre deux.", "On te demande ton avis sur une maquette qui n'est pas finie.", "Le client veut savoir si la charte fonctionnera sur les réseaux sociaux. Tu n'as pas encore testé.", "Ton responsable demande combien de temps prendra la refonte. Tu n'as pas tous les éléments."],
  OBJ: ["Je trouve ça un peu trop sobre.", "Pourquoi ce choix de couleur ?", "On avait demandé quelque chose de plus moderne.", "Ça va prendre combien de temps ?", "Mon associé n'aime pas le logo.", "Tu es sûr que c'est lisible ?", "On ne peut pas juste agrandir le logo ?", "C'est trop cher.", "Va à l'essentiel, on n'a pas le temps.", "Je ne vois pas où tu veux en venir.", "Quelle est ta recommandation, au final ?", "Et si on faisait l'inverse ?"],
  DIGRESSIONS: ["Au fait, tu as vu le mail de ce matin ?", "Et le budget, on en est où ?", "Ça me fait penser à un autre projet, tu te souviens ?", "Attends, tu peux revenir sur le début ?", "C'est qui, le développeur sur ce projet ?", "Et pour la version anglaise ?"],
  CONTRA: ["Je ne suis pas du tout d'accord.", "Tu as un exemple concret ?", "Ce n'est pas ce que disent les chiffres.", "Ça marche peut-être pour toi, mais pas en général.", "Tu ne réponds pas à la question.", "Et quel est l'inconvénient de ta position ?"]
};

window.LISTS.TOUT = [].concat(window.LISTS.QUICK, window.LISTS.AVIS, window.LISTS.PROJETS);

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

window.SPEECH_TEXT = "Bonjour à tous. Je vais vous présenter la nouvelle identité visuelle en trois points. D'abord, le constat : l'ancienne image ne parlait plus à nos clients. Ensuite, la proposition : une palette plus claire et une typographie plus lisible. Enfin, la suite : les premiers supports seront prêts dans trois semaines. Ma recommandation est simple : lancer la nouvelle identité dès le mois prochain.";
window.EMO_PHRASE = [0, 0, 0, 2, 4, 2, 0, 4, 2, 2, 0];

/* ============ Coach vocal · Parler : trouver et garder son timbre naturel ============ */
window.PARLER = [
  { t: "Ta note naturelle", n: 2,
    why: "Ta voix a une hauteur où elle sonne pleine sans effort : c'est ta note naturelle. La plupart des gens parlent un peu au-dessus, surtout sous stress, ou poussent vers le grave pour paraître sérieux. Les deux fatiguent et sonnent faux.",
    x: "Quand tu approuves quelqu'un sans réfléchir, « mm-hmm », la note qui sort est celle de ta voix au repos. Même chose quand tu comptes sur un soupir détendu, comme affalé dans un canapé. L'appli écoute ces sons, en tire ta note naturelle, puis te montre pendant que tu lis si ta voix reste autour. Ta zone, c'est cette note plus ou moins 3 demi-tons : à l'intérieur, la voix peut monter et descendre librement.",
    ok: "Ta note naturelle est mesurée, et ta voix de lecture passe plus de 70 % du temps dans ta zone.",
    deep: ["Refais la mesure le matin et le soir : la voix est souvent plus grave le matin. Garde la mesure faite en milieu de journée.", "Ta note naturelle n'est pas « la plus grave possible ». Une voix forcée vers le bas s'écrase et porte moins.", "Les lèvres fermées pendant le « mm-hmm » doivent vibrer légèrement : c'est le signe que la voix est bien placée."],
    ex: [
      { k: "find" },
      { k: "voice", t: "Lire dans ta zone", how: "Lis le texte à voix haute, comme en réunion. Regarde la courbe de temps en temps : la bande verte, c'est ta zone.", mode: "read" }
    ] },

  { t: "Le souffle bas", n: 3,
    why: "Ton timbre repose sur l'air. Quand le souffle est haut et court, la gorge compense en serrant : la voix monte, se durcit, et s'éteint en fin de phrase.",
    x: "Inspire par le nez en laissant le ventre et les côtes basses s'ouvrir, les épaules immobiles. En parlant, laisse l'air sortir de façon régulière et reprends ton souffle à chaque point, sans attendre d'être vide. Une phrase, un souffle. C'est aussi ce qui crée tes pauses : la respiration et la ponctuation travaillent ensemble.",
    ok: "Ton « sss » dépasse 20 secondes, et tu comptes jusqu'à 15 sur un souffle sans que la voix monte ni s'éteigne.",
    deep: ["Main sur le ventre, main sur la poitrine : seule celle du ventre bouge à l'inspiration.", "Respirer à chaque point ralentit ton débit sans que tu y penses, et donne du poids à ce que tu dis.", "Si tu manques d'air en réunion, ce n'est pas un manque de capacité : tu as oublié de reprendre ton souffle aux points."],
    ex: [
      { k: "breath" },
      { k: "timer", t: "Compter sur un souffle", how: "Inspire bas, puis compte à voix normale « un, deux, trois… » sur un seul souffle, sans forcer. Arrête-toi avant d'être vide. Trois fois. La voix doit garder la même hauteur et le même volume du premier au dernier chiffre.", sec: 90 },
      { k: "voice", t: "Une phrase, un souffle", how: "Lis le texte en reprenant ton souffle à chaque point. Prends ton temps : le silence fait partie du texte.", mode: "read", goal: "fins" }
    ] },

  { t: "Détendre l'instrument", n: 3,
    why: "Le timbre naturel, c'est la voix quand rien ne la gêne. Mâchoire serrée, langue crispée, gorge tendue : le stress s'installe dans ces muscles, et la voix devient plus aiguë et plus mince.",
    x: "On relâche les muscles qui entourent la voix, puis on parle tout de suite après, pour que la voix garde cette détente. Les exercices à bouche semi-fermée, comme les trilles de lèvres ou parler dans une paille, équilibrent la pression d'air : la voix vibre sans effort, et ce réglage se transmet ensuite à la parole.",
    ok: "Après l'échauffement, ta voix de lecture est plus proche de ta note naturelle qu'avant.",
    deep: ["Le bâillement ouvre la gorge, le soupir relâche les cordes vocales : combine les deux, puis enchaîne une phrase sur la même détente.", "Masse les muscles de la mâchoire, devant les oreilles, en ouvrant doucement la bouche.", "Une paille dans un verre d'eau, et tu fais des bulles en faisant « ou » : c'est l'exercice préféré des orthophonistes."],
    ex: [
      { k: "timer", t: "Relâcher mâchoire et langue", how: "Masse la mâchoire devant les oreilles 20 secondes. Laisse tomber la mâchoire, langue posée derrière les dents du bas. Puis sors la langue et dis « la la la » lentement. Termine par trois soupirs sonores du haut vers le bas.", sec: 90 },
      { k: "timer", t: "Trilles de lèvres, puis parler", how: "Fais vibrer les lèvres (« brrr ») en glissant doucement sur quelques notes, 30 secondes. Puis enchaîne directement : « brrr… bonjour, je m'appelle… ». Garde la même facilité dans la phrase. Recommence trois fois.", sec: 90 },
      { k: "voice", t: "Lire sur la détente", how: "Juste après l'échauffement, lis le texte. Compare avec ta mesure habituelle.", mode: "read" }
    ] },

  { t: "La résonance", n: 3,
    why: "Une voix qui porte sans forcer vibre dans le visage, à l'avant : lèvres, nez, pommettes. C'est ce qui donne de la présence, même à volume moyen.",
    x: "Fais « mmm » sur ta note naturelle, lèvres fermées, dents desserrées. Tu dois sentir les lèvres et le nez chatouiller. Puis ouvre sur une syllabe en gardant cette vibration à l'avant : « mmm-mon », « mmm-mais », « mmm-mien ». Ensuite une phrase entière. C'est la base de la thérapie par voix résonante, utilisée par les orthophonistes : beaucoup de son pour peu d'effort.",
    ok: "Tu sens la vibration dans les lèvres en parlant, et ta voix porte à 5 mètres sans que ta gorge pousse.",
    deep: ["Si la vibration est dans la gorge, avance le son : imagine qu'il sort par le bout du nez.", "Résonance ne veut pas dire voix nasale. Pince le nez sur une phrase sans « m » ni « n » : elle ne doit pas changer.", "Plus la résonance est à l'avant, moins tu as besoin de volume."],
    ex: [
      { k: "timer", t: "Du « mmm » aux mots", how: "« mmm » sur ta note naturelle, 5 secondes. Puis « mmm-mon, mmm-mais, mmm-mien, mmm-moi ». Puis « mon mari mange des marrons ». Puis « mardi, Marie m'a montré la maquette ». Garde la vibration dans les lèvres du début à la fin.", sec: 120 },
      { k: "voice", t: "Lire avec la vibration", how: "Commence par un « mmm » sur ta note, puis lis le texte en gardant la vibration à l'avant.", mode: "read" },
      { k: "proj", t: "Porter sans pousser", how: "Dis « Bonjour à tous, merci d'être là » pour quelqu'un à 1 mètre, puis 5 mètres, puis 15 mètres. Le son doit grossir par l'avant et le souffle, jamais par la gorge." }
    ] },

  { t: "Jusqu'au bout de la phrase", n: 3,
    why: "C'est ce qui fait la différence entre une voix assurée et une voix qui doute : la fin de phrase. Si elle s'éteint ou s'écrase, le message perd sa force, même avec de bonnes idées.",
    x: "En fin de phrase, on manque d'air ou on relâche l'attention : la voix descend dans un grésillement, ou on avale les derniers mots. En français, une affirmation descend naturellement à la fin : c'est bien. Mais elle doit descendre sur une voix pleine, jusqu'au dernier mot, puis s'arrêter net. L'appli repère les fins de phrase qui s'éteignent.",
    ok: "Au moins 80 % de tes fins de phrase restent pleines jusqu'au dernier mot.",
    deep: ["Pense le dernier mot comme le plus important : souvent, c'est vrai.", "Reprends de l'air avant la fin de ton souffle, pas après.", "Une fin qui monte transforme une affirmation en question. Garde-la descendante quand tu affirmes."],
    ex: [
      { k: "voice", t: "Des fins pleines", how: "Lis le texte. Appuie légèrement le dernier mot de chaque phrase, puis silence.", mode: "read", goal: "fins" },
      { k: "voice", t: "En improvisant", how: "Réponds à la question à voix haute pendant une minute. Phrases courtes, fins pleines.", mode: "free", goal: "fins" }
    ] },

  { t: "La mélodie", n: 3,
    why: "Une voix naturelle n'est pas plate : elle monte et descend pour souligner le sens. Le stress l'aplatit, et une voix monotone fait décrocher l'auditoire, même quand le fond est bon.",
    x: "La mélodie se joue autour de ta note naturelle, pas au-dessus. Pour souligner un mot-clé, tu as trois outils : monter un peu sur lui, le dire plus lentement, ou faire une courte pause juste avant. Une variation de 3 à 5 demi-tons suffit pour une voix vivante. Au-delà, ça devient théâtral.",
    ok: "Ta voix varie de 2,5 à 5 demi-tons en restant dans ta zone.",
    deep: ["Une pause avant un mot-clé est souvent plus efficace qu'une montée.", "Lis une phrase comme un journaliste, puis comme si tu racontais une histoire à un ami : sens la différence.", "La mélodie suit l'intention. Si tu sais pourquoi tu dis la phrase, elle trouve sa forme."],
    ex: [
      { k: "voice", t: "Faire vivre les mots-clés", how: "Lis le texte en faisant ressortir les mots en gras : un peu plus haut, un peu plus lent, ou après une courte pause.", mode: "read", text: 1, goal: "var" },
      { k: "voice", t: "Raconter", how: "Réponds à la question à voix haute pendant une minute, comme si tu le racontais à un ami. Laisse la voix bouger.", mode: "free", goal: "var" }
    ] },

  { t: "Sous pression", n: 3,
    why: "C'est là que tout se joue : en réunion, devant un client, quand on te coupe. Sous stress, la voix monte de 2 à 4 demi-tons sans que tu t'en rendes compte. Ton timbre ne vaut que si tu le gardes à ce moment-là.",
    x: "L'appli va t'interrompre avec des objections pendant que tu parles. À chaque fois : une respiration basse avant de répondre, et tu repars sur ta note naturelle. L'appli compare ta hauteur avant et après les objections. L'objectif n'est pas de ne rien ressentir, c'est que ta voix ne le trahisse pas.",
    ok: "Après une objection, ta voix ne monte pas de plus d'un demi-ton.",
    deep: ["Le réflexe à construire : objection, inspiration, réponse. La respiration remet la voix en place.", "Sous pression, on accélère. Ralentir fait redescendre la voix tout seul.", "Avant une réunion importante : trois « mm-hmm », une expiration longue, et la première phrase sur ta note."],
    ex: [
      { k: "voice", t: "Garder ta note quand on te coupe", how: "Réponds à la question pendant une minute. Quand une objection tombe : inspire, puis réponds sur ta note.", mode: "free", pressure: true },
      { k: "voice", t: "Lire malgré les interruptions", how: "Lis le texte. Quand une objection tombe : inspire, réponds en une phrase, puis reprends la lecture sur ta note.", mode: "read", text: 2, pressure: true }
    ] },

  { t: "Au quotidien", n: 9999,
    why: "Ton timbre s'entretient comme une posture : un peu chaque jour, et surtout dans tes vraies conversations.",
    x: "Chaque séance alterne une mesure de ta note naturelle, une lecture et une improvisation sous pression. Dans la journée, prends l'habitude de vérifier ta voix aux moments clés : la première phrase d'une réunion, une réponse à une objection, une présentation.",
    ok: "Ta voix reste dans ta zone plus de 75 % du temps, y compris sous pression.",
    deep: ["Avant une réunion : trois « mm-hmm », une expiration longue, la première phrase sur ta note.", "Si ta voix monte en pleine discussion : ralentis, respire au prochain point.", "Bois de l'eau dans la journée : des cordes vocales hydratées vibrent plus facilement."],
    ex: [
      { k: "voice", t: "Sous pression", how: "Réponds à la question. Objection : inspire, puis réponds sur ta note.", mode: "free", pressure: true },
      { k: "find" },
      { k: "voice", t: "Lire dans ta zone", how: "Lis le texte, fins pleines, mots-clés appuyés.", mode: "read", text: 1, goal: "var" }
    ] }
];

window.PARLER_WARM = [
  { t: "Échauffement · soupirs et « mm-hmm »", how: "Trois bâillements-soupirs, du haut vers le bas. Puis cinq « mm-hmm » d'approbation, lèvres fermées. Puis dis « bonjour » sur la note du « mm-hmm »." },
  { t: "Échauffement · trilles de lèvres", how: "Trilles de lèvres (« brrr ») en glissant doucement vers le haut et vers le bas, 30 secondes. Puis « brrr… bonjour à tous », trois fois." },
  { t: "Échauffement · mâchoire et « mmm »", how: "Masse la mâchoire devant les oreilles, bouche entrouverte, 20 secondes. Puis « mmm » sur ta note naturelle, en sentant les lèvres vibrer, et « mmm-mon, mmm-mais, mmm-moi »." }
];

window.PARLER_TEXTS = [
  "Bonjour à tous. Je vais vous présenter la nouvelle identité visuelle en trois points. D'abord, le constat : l'ancienne image ne parlait plus à nos clients. Ensuite, la proposition : une palette plus claire et une typographie plus lisible. Enfin, la suite : les premiers supports seront prêts dans trois semaines. Ma recommandation est simple : lancer la nouvelle identité dès le mois prochain.",
  "Ce projet repose sur une idée <b>simple</b>. Nos clients ne lisent pas, ils <b>regardent</b>. Nous avons donc choisi une seule image forte par page, et une typographie <b>généreuse</b>. Le résultat est plus <b>calme</b>, plus <b>lisible</b>, et il se reconnaît de loin. C'est cette <b>clarté</b> que je vous propose de garder.",
  "Pour cette campagne, nous avons exploré deux pistes. La première joue sur la couleur : un orange franc, qui attire l'œil en rayon. La seconde mise sur la photographie : des portraits en noir et blanc, plus sobres. Je recommande la première. Elle se distingue mieux de la concurrence, et elle fonctionne aussi bien sur une affiche que sur un écran de téléphone."
];
