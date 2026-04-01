Principes généraux
Application de gestion des agents, en lien avec les RH et la DSI, afin de gérer les licences, les droits, l'onboarding des agents et de faciliter la gestion de l'AD.

Une sidebar sera présente avec les menus suivants :

#Dashboard
#Agents
#Synchro
#Hiérarchie
#Alignements
#Onboarding
#Paramètres
#Explorateur SQL

Menu #Agents
Affiche la liste des agents de la Ville sous forme de liste paginée. Pour chaque agent, la "vue agent" sera affichée (voir ##règles-générales). Les autres informations seront affichées à la demande ; par défaut, la structure sur 2 lignes (direction en gras et service en dessous), le matricule et le mouvement sur 2 lignes (date d'arrivée et date de départ si connue). Un bouton "Colonnes" permettra de sélectionner les colonnes à afficher ou à masquer. Une liste d'actions sous forme d'icônes sera disponible : Voir fiche, Associer AD, Délier AD (si lié), Lier/délier Azure. Le niveau de licence associé à l'agent sera affiché sous forme de badge. L'icône AD aura la couleur reflétant l'état d'activité du compte. La liste sera filtrable et triable, avec un champ de recherche d'agent.

#Synchro
Menu technique de synchronisation des données :

Bouton Synchro brut : Récupère la liste des comptes AD et tous leurs champs depuis l'AD dans une table BRUT_AD, la liste des comptes Azure AD dans une table BRUT_AZURE, la liste des agents RH depuis la base RH dans une table BRUT_RH, et la hiérarchie depuis la base RH dans une table BRUT_HIERARCHIE. Ces tables sont intégralement écrasées à chaque exécution ; le résultat de la création sera affiché. Le paramétrage AD et Azure sera utilisé ; pour la base RH, l'API Ville sera utilisée.

Bouton Synchro RH : Alimente un référentiel hiérarchique (table REF_HIERARCHIE) à partir des données de BRUT_HIERARCHIE, complétées par des données locales. Alimente également un référentiel agent (table REF_AGENTS). Aucune ligne des référentiels ne sera supprimée : si un enregistrement n'est plus présent dans la table brute, un champ PLUS_VU sera mis à jour avec la date de synchronisation dans la table de référence correspondante. Seuls les champs provenant des tables brutes seront mis à jour dans les référentiels.

Bouton Synchro AD : Établit le lien entre chaque agent et son enregistrement AD, en se basant sur la correspondance stricte nom + prénom. Une barre de progression sera affichée durant la synchronisation.

Bouton Synchro Azure : Établit le lien entre chaque agent et ses informations Azure. La correspondance se fera par adresse e-mail ou par le CN.

Bouton Afficher les logs : Affiche les logs et les résultats de chaque synchronisation. Chaque synchronisation disposera de son propre code couleur.

#Hiérarchie
Affiche la hiérarchie de la collectivité en partant du niveau le plus haut : Direction Générale. Tous les membres de chaque niveau seront affichés (uniquement la vue agent), sous forme hiérarchique. Le responsable de chaque niveau sera mis en évidence de façon différenciée.

#Alignements
Menu permettant de gérer les alignements entre la base RH et la base AD, dans l'objectif de mettre à jour l'AD. Les alignements possibles seront listés, avec la possibilité de les éditer (modifier, supprimer, ajouter). Un alignement est la combinaison de couples de champs (l'un provenant de la base RH, l'autre de l'AD) et porte un nom.

Pour créer un alignement, il sera proposé de sélectionner un agent (via une recherche), puis de lier un champ AD et un champ RH via des listes déroulantes. Pour plus de facilité, les valeurs des champs pour l'agent sélectionné seront affichées entre parenthèses dans les listes déroulantes.

Un bouton "Sensible à la casse" permettra de paramétrer la recherche des désalignements. Un bouton "Chercher les désalignements" listera tous les agents dont les valeurs des champs d'alignement diffèrent. Il sera possible de les sélectionner/désélectionner individuellement ou par filtre. Un bouton "Aligner la sélection" générera un fichier PowerShell mettant à jour les informations de l'AD à partir des données RH.

#Paramètres
Affiche des onglets de paramétrage :

AD/Azure : Paramétrage des connexions AD et Azure, enregistrement des paramètres, test de la connexion et recherche d'un individu via SQL.

API Ville : Saisie de l'URL de l'API Ville, du lien Swagger pour la documentation et d'un jeton d'identification. Une zone SQL affichera les vues de la base RH. Un bouton de test de la liaison et un bouton de sélection "Vue RH" permettront de choisir la vue utilisée pour le menu #Synchro.

Hiérarchies : Reconstruction de la hiérarchie de la ville à partir du référentiel, selon les niveaux suivants :

Niveau final : CODE_AFFECT / NOM_AFFECT_L

Niveau parent 1 — Secteur (si disponible, sinon niveau supérieur) : CODE_SECTEUR / NOM_SECTEUR_L

Niveau parent 2 — Service (si disponible, sinon niveau supérieur) : CODE_SERVICE / NOM_SERVICE_L

Niveau parent 3 — Direction (si disponible, sinon niveau supérieur) : CODE_DIRECTION / NOM_DIRECTION_L

Niveau parent 4 — Direction Générale (si disponible, sinon pas de niveau parent) : CODE_DG-CAB / NOM_DG-CAB_L

Pour chaque niveau, il sera possible de saisir un nom, un code couleur et une règle SQL permettant d'identifier le responsable. Pour chaque occurrence du niveau 3, il sera possible de définir une icône (proposée par défaut à partir du nom de la direction).

Règles RH : Avec les sections suivantes :

Positions actives : Liste toutes les positions possibles des agents (champ POSITION_L) et permet de cocher celles considérées comme actives.

Onboarding :

Description du formulaire d'onboarding, avec bouton de prévisualisation.

Définition des listes déroulantes du formulaire.

Définition du workflow d'onboarding.

Utilisateurs : Gestion des utilisateurs du studio, avec les droits "user" ou "admin". La console SQL et le menu de paramétrage seront réservés aux administrateurs. Une fenêtre de connexion générale sera prévue.

#Onboarding
Ce menu permet de gérer les arrivées et départs. Il liste les futurs agents et propose de les sélectionner pour les onboarder. Les agents sont répartis dans les zones suivantes : Onboarding à faire, En cours de demande, En cours de réalisation, Terminé.

Pour les agents "à faire", il est possible de sélectionner un manager parmi la liste afin de lui envoyer un lien vers le formulaire d'onboarding. Il est également possible de créer un nouvel arrivant sans nom (non encore présent en base RH) afin d'envoyer le formulaire à son manager. L'agent passe alors dans la zone "En cours".

Une fois le formulaire complété et renseigné, l'agent passe en zone "En cours de réalisation". Le manager reçoit un e-mail récapitulatif. Une liste de tâches est générée à partir du formulaire ; une fois toutes les tâches cochées, l'onboarding est marqué comme terminé. Le manager ayant renseigné le formulaire peut à tout moment consulter l'état d'avancement des tâches.

#Explorateur SQL
Menu permettant de lister les bases de données utilisées, d'en afficher les tables et les vues, et de consulter le contenu de la vue sélectionnée. Une console SQL permet de saisir et d'exécuter des requêtes. Des icônes "Vider" et "Supprimer" sont disponibles pour chaque table.

##règles-générales
Affichage "vue agent" : Nom + Prénom de l'agent en gras, fonction en dessous, avatar à gauche.

Avatar de l'agent : Carré arrondi affichant les initiales de l'agent en gras. La couleur dépend du niveau hiérarchique défini dans #Paramètres/Hiérarchies.

Contour plein pour les agents actifs, pointillé pour les agents non actifs

Barré en diagonale pour les agents partis

Badge "Proch" si l'agent arrive dans le futur (champ DATE_ARRIVEE)

Badge "Nouv" si l'agent est arrivé depuis moins de 30 jours (champ DATE_ARRIVEE)

En cliquant sur la vue agent ou son avatar, une modale multi-onglets s'ouvre :

Onglet Général : Informations génériques et essentielles du référentiel RH.

Onglet RH : Toutes les informations en provenance de la base RH, regroupées autant que possible.

Onglet Active Directory : Toutes les informations en provenance de l'AD, en particulier les dates. Bouton coloré indiquant l'état du compte (actif ou non). Affichage des groupes memberOf de façon lisible et regroupés autant que possible.

Onglet Azure AD : Informations en provenance d'Azure. Bouton coloré indiquant l'état du compte. Licences Office 365 associées, avec affichage du nom en clair (E1, E3, F1, F3, etc.).

Agents actifs : Agents dont la position fait partie des positions actives définies dans #Paramètres.

Agents partis : Agents non revus (champ PLUS_VU) ou dont la date de départ (champ DATE_DEPART) est antérieure à la date du jour.

