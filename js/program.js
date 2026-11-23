// Programme Haut/Bas ×2 + 2 courses — données pures, sans logique d'interface.
export const MUS = {pecs:'Pecs',dos:'Dos',epaules:'Épaules',biceps:'Biceps',triceps:'Triceps',quads:'Quadriceps',ischios:'Ischios',fessiers:'Fessiers',mollets:'Mollets',abdos:'Abdos'};
export const TARGET = {pecs:[12,20],dos:[12,20],epaules:[12,20],biceps:[10,16],triceps:[10,16],quads:[10,16],ischios:[8,14],fessiers:[8,14],mollets:[6,12],abdos:[6,10]};
// Pas de charge par type : bu barre haut, bl barre bas, db haltères, mc machine/câble, bw poids du corps (lest)
export const INC = {bu:2.5, bl:5, db:2, mc:2.5, bw:2.5};

export const EX = {
 bench:{n:'Développé couché barre',k:'bu',rr:[6,10],rest:120,m:{pecs:1,triceps:.5,epaules:.5},c:['Omoplates serrées et basses, pieds ancrés.','La barre touche le bas des pecs, sans rebond.','Pousse en arc vers le haut des épaules.']},
 csrow:{n:'Rowing poitrine appuyée',k:'mc',rr:[8,12],rest:120,m:{dos:1,biceps:.5},c:['Poitrine collée au banc incliné ou au pad.','Bras complètement tendus en bas : étire le dos.','Tire les coudes vers les hanches, pas vers le haut.']},
 incdb:{n:'Développé incliné haltères',k:'db',rr:[8,12],rest:90,m:{pecs:1,epaules:.5,triceps:.5},c:['Banc à 30°, pas plus.','Descends bas, haltères au niveau de la poitrine.','Coudes à environ 45° du buste.']},
 pulldown:{n:'Tirage vertical prise neutre',k:'mc',rr:[8,12],rest:90,m:{dos:1,biceps:.5},c:['Laisse les épaules monter en haut pour étirer les dorsaux.','Tire les coudes vers les hanches.','Buste légèrement incliné, sans balancer.']},
 cablefly:{n:'Écarté poulie basse',k:'mc',rr:[12,15],rest:60,m:{pecs:1},c:['Poulies en bas, mouvement de bas en haut.','Bras ouverts loin derrière : étirement des pecs.','Coudes légèrement fléchis et fixes.']},
 rdelt:{n:'Oiseau à la machine',k:'mc',rr:[12,20],rest:60,m:{epaules:1},c:['Cible l\'arrière d\'épaule, souvent faible chez les boxeurs.','Bras presque tendus, mouvement large.','Pas d\'élan, contrôle le retour.']},
 inccurl:{n:'Curl incliné haltères',k:'db',rr:[10,15],rest:60,m:{biceps:1},c:['Banc à 45°, bras pendants derrière le corps.','Coudes immobiles, monte sans avancer les épaules.','Descente lente jusqu\'à l\'extension complète.']},
 ohext:{n:'Extension triceps au-dessus de la tête',k:'mc',rr:[10,15],rest:75,m:{triceps:1},c:['Dos à la poulie, corde derrière la tête.','Coudes près de la tête, pointés vers l\'avant.','Descends loin derrière pour étirer le long chef.']},
 latcable:{n:'Élévations latérales poulie',k:'mc',rr:[12,20],rest:60,m:{epaules:1},c:['Câble qui passe derrière le corps.','Départ bras devant la hanche opposée.','Monte jusqu\'à l\'horizontale, pas plus.']},
 ohp:{n:'Développé militaire haltères assis',k:'db',rr:[6,10],rest:120,m:{epaules:1,triceps:.5},c:['Dossier presque vertical.','Haltères au niveau des oreilles en bas.','Pousse sans cambrer le bas du dos.']},
 pullup:{n:'Tractions',k:'bw',rr:[6,10],rest:120,m:{dos:1,biceps:.5},c:['Note le lest en kg (0 sans lest).','Bras complètement tendus en bas.','Poitrine vers la barre, coudes vers les côtes.']},
 dips:{n:'Dips buste penché',k:'bw',rr:[8,12],rest:90,m:{pecs:1,triceps:.5},c:['Note le lest en kg (0 sans lest).','Buste penché en avant pour cibler les pecs.','Descends jusqu\'à sentir l\'étirement, sans douleur d\'épaule.']},
 cablerow:{n:'Rowing assis poulie',k:'mc',rr:[10,12],rest:90,m:{dos:1,biceps:.5},c:['Dos droit, buste immobile.','Laisse les omoplates avancer en fin de retour.','Tire vers le nombril.']},
 pecdeck:{n:'Pec deck',k:'mc',rr:[12,15],rest:60,m:{pecs:1},c:['Siège réglé pour avoir les poignées à hauteur de poitrine.','Ouverture large, pause d\'1 s en étirement.','Serre fort au centre.']},
 facepull:{n:'Face pull',k:'mc',rr:[12,20],rest:60,m:{epaules:.5,dos:.5},c:['Poulie à hauteur du front, corde.','Tire vers le visage en écartant les mains.','Finis en rotation externe, pouces vers l\'arrière.']},
 preacher:{n:'Curl pupitre',k:'mc',rr:[10,15],rest:60,m:{biceps:1},c:['Aisselles calées en haut du pupitre.','Descends jusqu\'à l\'extension complète.','Pas de rebond en bas.']},
 skull:{n:'Barre au front',k:'bu',rr:[10,15],rest:75,m:{triceps:1},c:['Barre EZ, coudes fixes.','Amène la barre derrière la tête, pas sur le front.','Remonte en serrant les triceps.']},
 lat2:{n:'Élévations latérales haltères',k:'db',rr:[15,20],rest:60,m:{epaules:1},c:['Légèrement penché en avant.','Coudes qui mènent le mouvement.','Charge légère, zéro élan.']},
 squat:{n:'Squat barre',k:'bl',rr:[6,10],rest:150,m:{quads:1,fessiers:.5},c:['Barre haute sur les trapèzes.','Descends le plus bas possible, dos neutre.','Genoux dans l\'axe des pieds.']},
 press:{n:'Presse à cuisses',k:'mc',rr:[8,12],rest:120,m:{quads:1,fessiers:.5},c:['Pieds au milieu de la plateforme.','Genoux vers la poitrine, bassin collé au dossier.','Ne verrouille pas les genoux en haut.']},
 sleg:{n:'Leg curl assis',k:'mc',rr:[10,15],rest:75,m:{ischios:1},c:['La version assise étire mieux les ischios.','Buste légèrement penché en avant.','Contrôle la remontée.']},
 legext:{n:'Leg extension',k:'mc',rr:[12,15],rest:60,m:{quads:1},c:['Dossier incliné vers l\'arrière si possible.','Pause d\'1 s jambes tendues.','Descente lente.']},
 calfs:{n:'Mollets debout',k:'mc',rr:[10,15],rest:60,m:{mollets:1},c:['Talons le plus bas possible.','Pause de 2 s en bas, en étirement.','Monte sur la pointe, sans rebond.']},
 crunch:{n:'Crunch poulie',k:'mc',rr:[10,15],rest:60,m:{abdos:1},c:['À genoux, corde derrière la tête.','Enroule la colonne vers le bassin.','Les bras ne tirent pas.']},
 rdl:{n:'Soulevé de terre roumain',k:'bl',rr:[6,10],rest:150,m:{ischios:1,fessiers:.5},c:['Hanches qui partent en arrière, genoux souples.','Barre collée aux jambes.','Descends jusqu\'à l\'étirement des ischios, dos neutre.']},
 bss:{n:'Fente bulgare haltères',k:'db',rr:[8,12],rest:90,m:{quads:1,fessiers:.5},c:['Charge par main. Pied arrière sur un banc.','Descends bas, genou arrière proche du sol.','Buste penché = plus de fessiers.']},
 hipthrust:{n:'Hip thrust',k:'bl',rr:[8,12],rest:90,m:{fessiers:1},c:['Haut du dos sur le banc, menton rentré.','Pousse par les talons.','Pause d\'1 s en haut, bassin en rétroversion.']},
 lleg:{n:'Leg curl allongé',k:'mc',rr:[10,15],rest:60,m:{ischios:1},c:['Hanches collées au banc.','Amplitude complète.','Descente lente.']},
 calfseat:{n:'Mollets à la presse',k:'mc',rr:[12,20],rest:60,m:{mollets:1},c:['Pointe des pieds en bas de la plateforme.','Étirement complet en bas.','Pas de genoux verrouillés.']},
 hangleg:{n:'Relevés de jambes suspendu',k:'bw',rr:[10,15],rest:60,m:{abdos:1},c:['Enroule le bassin vers le haut.','Aucun balancement.','Jambes fléchies si trop dur.']}
};

// Noms français des variantes (source des images : free-exercise-db, domaine public)
export const FR = {
 'Barbell_Bench_Press_-_Medium_Grip':'Développé couché barre','Machine_Bench_Press':'Développé couché machine','Smith_Machine_Bench_Press':'Développé couché Smith',
 'Incline_Bench_Pull':'Rowing sur banc incliné','Lying_T-Bar_Row':'Rowing T-bar allongé','Leverage_Iso_Row':'Rowing machine à leviers',
 'Incline_Dumbbell_Press':'Développé incliné haltères','Leverage_Incline_Chest_Press':'Développé incliné machine','Hammer_Grip_Incline_DB_Bench_Press':'Développé incliné prise marteau',
 'V-Bar_Pulldown':'Tirage vertical prise neutre','Close-Grip_Front_Lat_Pulldown':'Tirage vertical prise serrée','Wide-Grip_Lat_Pulldown':'Tirage vertical prise large',
 'Low_Cable_Crossover':'Écarté poulie basse','Incline_Cable_Flye':'Écarté poulie banc incliné','Dumbbell_Flyes':'Écarté haltères',
 'Reverse_Machine_Flyes':'Oiseau machine','Cable_Rear_Delt_Fly':'Oiseau poulie','Reverse_Flyes':'Oiseau haltères',
 'Incline_Dumbbell_Curl':'Curl incliné haltères','Alternate_Incline_Dumbbell_Curl':'Curl incliné alterné','Overhead_Cable_Curl':'Curl poulie haute',
 'Cable_Rope_Overhead_Triceps_Extension':'Extension triceps corde au-dessus de la tête','Dumbbell_One-Arm_Triceps_Extension':'Extension triceps haltère un bras','Low_Cable_Triceps_Extension':'Extension triceps poulie basse',
 'Cable_Seated_Lateral_Raise':'Élévation latérale poulie','Side_Lateral_Raise':'Élévations latérales haltères','One-Arm_Incline_Lateral_Raise':'Élévation latérale sur banc incliné',
 'Seated_Dumbbell_Press':'Développé militaire haltères assis','Leverage_Shoulder_Press':'Développé épaules machine','Arnold_Dumbbell_Press':'Développé Arnold',
 'Pullups':'Tractions pronation','Chin-Up':'Tractions supination','Band_Assisted_Pull-Up':'Tractions avec élastique',
 'Dips_-_Chest_Version':'Dips buste penché','Dip_Machine':'Dips machine','Leverage_Decline_Chest_Press':'Développé décliné machine',
 'Seated_Cable_Rows':'Rowing assis poulie','Leverage_High_Row':'Rowing haut machine','Bent_Over_Two-Dumbbell_Row':'Rowing buste penché haltères',
 'Butterfly':'Pec deck','Cable_Crossover':'Vis-à-vis poulie haute',
 'Face_Pull':'Face pull','Cable_Rope_Rear-Delt_Rows':'Rowing arrière d\'épaule corde','Reverse_Flyes_With_External_Rotation':'Oiseau avec rotation externe',
 'Machine_Preacher_Curls':'Curl pupitre machine','Preacher_Curl':'Curl pupitre barre','Cable_Preacher_Curl':'Curl pupitre poulie',
 'EZ-Bar_Skullcrusher':'Barre au front EZ','Cable_Lying_Triceps_Extension':'Extension triceps allongé poulie','Lying_Triceps_Press':'Extension triceps allongé barre',
 'Lying_One-Arm_Lateral_Raise':'Élévation latérale allongé','Lateral_Raise_-_With_Bands':'Élévations latérales élastique',
 'Barbell_Full_Squat':'Squat barre complet','Hack_Squat':'Hack squat','Lying_Machine_Squat':'Squat machine',
 'Leg_Press':'Presse à cuisses','Narrow_Stance_Leg_Press':'Presse pieds serrés','Smith_Machine_Leg_Press':'Presse au Smith',
 'Seated_Leg_Curl':'Leg curl assis','Standing_Leg_Curl':'Leg curl debout','Lying_Leg_Curls':'Leg curl allongé',
 'Leg_Extensions':'Leg extension','Single-Leg_Leg_Extension':'Leg extension une jambe',
 'Standing_Calf_Raises':'Mollets debout machine','Smith_Machine_Calf_Raise':'Mollets au Smith','Donkey_Calf_Raises':'Mollets « donkey »',
 'Cable_Crunch':'Crunch poulie','Ab_Crunch_Machine':'Crunch machine','Ab_Roller':'Roue abdominale',
 'Romanian_Deadlift':'Soulevé de terre roumain','Good_Morning':'Good morning','Stiff_Leg_Barbell_Good_Morning':'Good morning jambes tendues',
 'Split_Squat_with_Dumbbells':'Fente bulgare haltères','Smith_Single-Leg_Split_Squat':'Fente bulgare au Smith','Dumbbell_Rear_Lunge':'Fente arrière haltères',
 'Barbell_Hip_Thrust':'Hip thrust barre','Barbell_Glute_Bridge':'Pont fessier barre','Single_Leg_Glute_Bridge':'Pont fessier une jambe',
 'Ball_Leg_Curl':'Leg curl sur ballon',
 'Calf_Press_On_The_Leg_Press_Machine':'Mollets à la presse','Seated_Calf_Raise':'Mollets assis machine','Barbell_Seated_Calf_Raise':'Mollets assis barre',
 'Hanging_Leg_Raise':'Relevés de jambes suspendu','Plank':'Gainage planche','Pallof_Press':'Pallof press'
};

export const SESS = {
 UA:{n:'Haut A',f:'Horizontal · pecs et dos',min:80,it:[['A1','bench',4],['A2','csrow',4],['B1','incdb',3],['B2','pulldown',3],['C1','cablefly',3],['C2','rdelt',3],['D1','inccurl',4],['D2','ohext',4],['E','latcable',4]]},
 LA:{n:'Bas A',f:'Squat · quadriceps',min:70,it:[['A','squat',4],['B','press',3],['C1','sleg',3],['C2','legext',3],['D1','calfs',4],['D2','crunch',3]]},
 UB:{n:'Haut B',f:'Vertical · épaules et bras',min:80,it:[['A1','ohp',4],['A2','pullup',4],['B1','dips',3],['B2','cablerow',3],['C1','pecdeck',3],['C2','facepull',3],['D1','preacher',3],['D2','skull',3],['E','lat2',3]]},
 LB:{n:'Bas B',f:'Charnière · ischios et fessiers',min:70,it:[['A','rdl',4],['B','bss',3],['C1','hipthrust',3],['C2','lleg',3],['D1','calfseat',4],['D2','hangleg',3]]},
 EZ:{n:'Course facile',f:'30–45 min, conversation possible',run:1},
 IN:{n:'Fractionné',f:'4×4 norvégien ou rounds de boxe',run:1},
 RE:{n:'Repos',f:'Marche, mobilité, sommeil'}
};
export const PLAN = {1:'UA',2:'LA',3:'EZ',4:'UB',5:'LB',6:'IN',0:'RE'};
export const WEEKS = [
 {rir:'3',note:'Prise en main des charges'},{rir:'2',note:''},{rir:'2',note:''},
 {rir:'1',note:''},{rir:'0–1',note:'Isolation jusqu\'à l\'échec'},{rir:'4',note:'Deload : moitié des séries, mêmes charges',deload:1}
];
