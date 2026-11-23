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
