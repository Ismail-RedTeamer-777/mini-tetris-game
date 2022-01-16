document.addEventListener('DOMContentLoaded', () => {
	const grille = document.querySelector('.grille');
	let squares = Array.from(document.querySelectorAll('.grille div')); // retourne un objet de type Array avec les <div> itérables
	const affichage_score = document.querySelector('#score');
	const affichage_niveau = document.querySelector('#niveau');
	const bouton_start = document.getElementById('start-button');
	const bouton_homepage = document.getElementById("back_homepage");
	const bouton_jeu_tetris = document.getElementById("bouton_lancer_partie");
	const bouton_restart = document.getElementById("restart-button");
	const largeur = 10;
	let temps_jeu = 1000; // 1000 ms = vitesse de déplacement
	let joueur = ''; // pseudo du joueur
	let prochaine_piece_aleatoire = 0;
	let ID_timer;
	let score = 0;
	let niveau = 1;
	const liste_couleurs_piece = [
		'orange',
		'red',
		'purple',
		'green',
		'blue'
	];

	//ici on crée les pièces avec les rotations possibles

    // pièce en Z
	const piece_Z = [
	[0, largeur, largeur+1, largeur*2+1],
	[largeur+1, largeur+2, largeur*2, largeur*2+1],
	[0, largeur, largeur+1, largeur*2+1],
	[largeur+1, largeur+2, largeur*2, largeur*2+1]
	]

	// pièce en T
	const piece_T = [
	[1, largeur, largeur+1, largeur+2],
	[1, largeur+1, largeur+2, largeur*2+1],
	[largeur, largeur+1, largeur+2, largeur*2+1],
	[1, largeur, largeur+1, largeur*2+1]
	]

	// pièce en I
	const piece_I = [
	[1, largeur+1, largeur*2+1, largeur*3+1],
	[largeur, largeur+1, largeur+2, largeur+3],
	[1, largeur+1, largeur*2+1, largeur*3+1],
	[largeur, largeur+1, largeur+2, largeur+3]
	]

	// pièce en O (carré)
	const piece_o = [
	[0, 1, largeur, largeur+1],
	[0, 1, largeur, largeur+1],
	[0, 1, largeur, largeur+1],
	[0, 1, largeur, largeur+1]
	]

	// pièce en L
	const piece_L = [
	[1, largeur+1, largeur*2+1, 2],
	[largeur, largeur+1, largeur+2, largeur*2+2],
	[1, largeur+1, largeur*2+1, largeur*2],
	[largeur, largeur*2, largeur*2+1, largeur*2+2]
	]

	// ici, il y a les pièces à afficher, chacune contenant son orientation
	const formes_pieces = [piece_L, piece_Z, piece_T, piece_o, piece_I];

	let position_courante = 4; // position de la pièce
	let rotation_courante = 0; // 1ère rotation

	// selection aléatoire d'une pièce à afficher en 1ère rotation
	let nombre_aleatoire = Math.floor(Math.random()*formes_pieces.length); // de 0 à 4 (length = 5)
	let piece_courante = formes_pieces[nombre_aleatoire][rotation_courante]; // forme (I/Z/O/T/L) + rotation (orientation de la forme)

	// dessine une pièce aléatoire avec une rotaiton définie
	function dessine_piece()
	{
		piece_courante.forEach(index => {
			// classList retourne le nom de classe d'une pièce et la modifie avec add() (ici, avec la classe "piece")
			squares[position_courante + index].classList.add('piece');
			squares[position_courante + index].style.backgroundColor = liste_couleurs_piece[nombre_aleatoire]; // chosit une couleur aléatoire pour la pièce
		})
	}

	// efface (visiblement) la pièce déjà dessinée (astuce = manipuler les classes en CSS pour gérer l'affichage des formes)
	function effacer_piece()
	{
		piece_courante.forEach(index => {
			// remove() enlève la classe "piece" pour ne pas afficher la pièce par le CSS
			squares[position_courante + index].classList.remove('piece');
			squares[position_courante + index].style.backgroundColor = '';
		});
	}

	// event listener pour les touches directionnelles
	function deplacement_piece(e)
	{
		if(e.keyCode === 37) // GAUCHE
		{
			deplace_vers_la_gauche();
		}
		else if(e.keyCode === 38) // ROTATION
		{
			rotation_piece();
		}
		else if(e.keyCode === 39) // DROIT
		{
			deplace_vers_la_droite();
		}
		else if(e.keyCode === 40) // BAS
		{
			deplace_vers_le_bas();
		}
		else if(e.keyCode === 32) // BARRE D'ESPACE
		{
			deplace_tout_en_bas();
		}
	}

	document.addEventListener('keydown', deplacement_piece);

	function deplace_vers_le_bas()
	{
		effacer_piece(); // fait disparaitre la pièce à l'ancienne position
		position_courante += largeur; // incrémente la distance 
		dessine_piece(); // fait apparaitre la pièce à une nouvelle position
		let contact_piece = fixer_position_piece();
		return contact_piece;
	}

	function deplace_tout_en_bas()
	{
		// tant que la pièce ne touche pas une autre on la déplace tout en bas
		let contact_piece = false;
		while(!contact_piece)
		{
			contact_piece = deplace_vers_le_bas();
		}
	}

	// ne laisse pas la pièce en traverser une en cas de contact
	function fixer_position_piece()
	{
		let contact_piece = false;
		// some() vérifie si "au moins" un des carré de la pièce touche la case juste en bas (la limite basse ou une autre pièce) 
		// (une des <div> de la classe "limite")
		if(piece_courante.some(index => squares[position_courante + index + largeur].classList.contains('limite'))) 
		{
			// fige la pièce à sa place
			piece_courante.forEach(index => squares[position_courante + index].classList.add('limite'));
			// ensuite, on fait tomber une autre pièce du haut
			nombre_aleatoire = prochaine_piece_aleatoire; // choix aléatoire de la prochaine pièce
			prochaine_piece_aleatoire = Math.floor(Math.random()*formes_pieces.length);
			piece_courante = formes_pieces[nombre_aleatoire][rotation_courante];
			position_courante = 4;
			dessine_piece();
			affichage_prochaine_piece(); // affiche la prochaine pièce dans le cadre
			ajout_score();
			game_over();
			contact_piece = true;
		}
		return contact_piece;
	}

    // vérifie si la pièce est sur le coté gauche en vérifiant s'il y a une limite à gauche
	function deplace_vers_la_gauche()
	{
		effacer_piece();
		// l'astuce consiste d'utiliser le "modulo" pour connaitre la limite du jeu
		const estAuCoteGauche = piece_courante.some(index => (position_courante + index) % largeur === 0);

		if(!estAuCoteGauche) position_courante -= 1;

		if(piece_courante.some(index => squares[position_courante + index].classList.contains('limite')))
		{
			position_courante += 1;
		}
		dessine_piece();
	}

	// déplace la pièce à droite en vérifiant s'il y a une limite à droite
	function deplace_vers_la_droite()
	{
		effacer_piece();
		const estAuCoteDroit = piece_courante.some(index => (position_courante+index) % largeur === largeur -1);

		if(!estAuCoteDroit) position_courante += 1;

		if(piece_courante.some(index => squares[position_courante + index].classList.contains('limite')))
		{
			position_courante -= 1;
		}
		dessine_piece();
	}

	// rotation de la pièce
	function rotation_piece()
	{
		effacer_piece();
		rotation_courante++; // rotation suivante de la pièce
		// si la rotation de la pièce = 4 on revient à la 1ère rotation
		if(rotation_courante === piece_courante.length)
		{
			rotation_courante = 0; // on remet à 0 pour ne pas avoir au-dessus de 4
		}
		piece_courante = formes_pieces[nombre_aleatoire][rotation_courante]; // on affecte la pièce avec la nouvelle rotation dans la pièce courante
		dessine_piece();
	}

	// affiche la prochaine pièce dans le petit cadre à droite
	const mini_grille = document.querySelectorAll('.mini-grille div');
	const affichage_largeur_piece = 4; // sert pour définir la largeur de la prochaine pièce dans la mini grille
	const position_prochaine_piece = 0; // sert pour positionner la prochaine pièce dans la mini grille

	// affiche la pièce sans se soucier de la rotation
	const liste_pieces_suivantes = [
	    [1, affichage_largeur_piece+1, affichage_largeur_piece*2+1, 2], // pièce_L
	    [0, affichage_largeur_piece, affichage_largeur_piece+1, affichage_largeur_piece*2+1], // pièce_Z
	    [1, affichage_largeur_piece, affichage_largeur_piece+1, affichage_largeur_piece+2], // pièce_T
	    [0, 1, affichage_largeur_piece, affichage_largeur_piece+1], // pièce_o
	    [1, affichage_largeur_piece+1, affichage_largeur_piece*2+1, affichage_largeur_piece*3+1] // pièce_I
    ]

    // affiche la forme de la prochaine pièce
    function affichage_prochaine_piece() 
    {
        //enlève la derière pièce à afficher
		mini_grille.forEach(square => {
		  square.classList.remove('piece');
		  square.style.backgroundColor = '';
		});
		liste_pieces_suivantes[prochaine_piece_aleatoire].forEach(index => {
		  mini_grille[position_prochaine_piece + index].classList.add('piece');
		  mini_grille[position_prochaine_piece + index].style.backgroundColor = liste_couleurs_piece[prochaine_piece_aleatoire];
		});
	}

	function augmente_niveau()
	{
		if(score % 100 == 0) // augmentation de niveau à chaque 100 points accumulés
		{
			niveau += 1;
			affichage_niveau.innerHTML = niveau;
			temps_jeu -= 200; // on décrémente l'interval de temps pour augmenter la vitesse des pièces
			ID_timer = setInterval(deplace_vers_le_bas, temps_jeu);
			alert("BRAVO!\nVOUS ÊTES MONTÉ AU NIVEAU " + niveau + "!");
		}
	}

	function ajout_score() 
	{
	    for (let i = 0; i < 199; i += largeur) 
	    {
	    	// 'ligne_grille' représente la i-ème ligne de la grille
			const ligne_grille = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
			if(ligne_grille.every(index => squares[index].classList.contains('limite'))) 
			{
				score += 50;
				augmente_niveau(score);
				affichage_score.innerHTML = score; // modifie le score dans l'HTML
				ligne_grille.forEach(index => {
				  squares[index].classList.remove('limite');
				  squares[index].classList.remove('piece');
				  squares[index].style.backgroundColor = ''; // enlève la couleur
				});
				// ici, on enlève une ligne pour en ajouter une autre afin de ne pas rétrécir la grille du jeu
				const squaresRemoved = squares.splice(i, largeur); // efface la ligne pleine
				squares = squaresRemoved.concat(squares); // concatène la ligne à la grille 
				squares.forEach(cell => grille.appendChild(cell));
			}
	    }
	}

	// fonction de Game Over
	function game_over() 
	{
		// vérifie si la dernière pièce posée touche le plafond
		if(piece_courante.some(index => squares[position_courante + index].classList.contains('limite')))
		{
			document.getElementById("game_over_sound").play();
			alert("GAME OVER!\nSCORE: " + score);
			affichage_score.innerHTML = '0';
			clearInterval(ID_timer); // arrete le jeu
			demande_pseudo();
			update_score_liste();
		}
	}

	function demande_pseudo()
	{
		joueur = prompt("Saisissez votre pseudo ci-dessous");
		if(joueur == null || joueur == '')
		{
			joueur = "player_1" // pseudo par défaut
		}
		update_score_liste();
		alert("Bien joué " + joueur + "!");
	}

	function update_score_liste()
	{
		var data_partie = chargement_partie(sauvegarde_partie());
		document.getElementById("pseudo").innerHTML = data_partie.pseudo;
		document.getElementById("score").innerHTML = data_partie.score;
		document.getElementById("niveau").innerHTML = data_partie.niveau;
	}

	function sauvegarde_partie()
	{
		const data_partie = {
			"pseudo": joueur,
			"score": score,
			"niveau": niveau
		};
		return JSON.stringify(data_partie);
	}

	function chargement_partie(data_json)
	{
		return JSON.parse(data_json);
	}

	// partie de la page d'accueil

	bouton_homepage.addEventListener('click', function(){
		document.getElementById("tetris_game").setAttribute('hidden', 'true');
		document.getElementById("homepage_game").removeAttribute('hidden');
	});

	bouton_jeu_tetris.addEventListener('click', () => {
		document.getElementById("homepage_game").setAttribute('hidden', 'true');
		document.getElementById("tetris_game").removeAttribute('hidden');
	});

	// le bouton permet de lancer et d'arreter le jeu
	bouton_start.addEventListener('click', () => {
		var click_sound = document.getElementById("click_sound");
	    if(ID_timer) 
	    {
	      clearInterval(ID_timer); // arrete le "temps" = arrete le jeu
	      ID_timer = null;
	    } 
	    else
	    {
	      dessine_piece();
	      ID_timer = setInterval(deplace_vers_le_bas, temps_jeu);
	      prochaine_piece_aleatoire = Math.floor(Math.random()*formes_pieces.length);
	      affichage_prochaine_piece();
	    }
		click_sound.play();
	});

	bouton_restart.addEventListener('click', () => {
		location.reload();
	});

});