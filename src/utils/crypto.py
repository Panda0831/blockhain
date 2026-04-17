import hashlib
import secrets


class Crypto:
    """
    Une implémentation manuelle de l'algorithme de signature numérique sur courbe elliptique (ECDSA)
    utilisant la courbe SECP256k1, conforme aux standards de sécurité blockchain.
    """

    # --- Paramètres de la courbe SECP256k1 (y² = x³ + 7 mod P) ---
    # Le modulo premier P
    P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    # Coefficients de l'équation de la courbe
    A = 0
    B = 7
    # Point de base G (Générateur)
    Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
    Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
    G = (Gx, Gy)
    # Ordre du groupe N (nombre total de points sur la courbe)
    N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

    @staticmethod
    def _calculer_inverse_modulaire(k, p):
        """
        Calcule l'inverse modulaire (k⁻¹ % p) via l'algorithme d'Euclide étendu.
        Indispensable pour la division en arithmétique modulaire.
        """
        if k % p == 0:
            raise ZeroDivisionError("Division par zéro en arithmétique modulaire.")

        s, old_s = 0, 1
        r, old_r = p, k % p

        while r != 0:
            quotient = old_r // r
            old_r, r = r, old_r - quotient * r
            old_s, s = s, old_s - quotient * s

        return old_s % p

    @staticmethod
    def _additionner_points(P1, P2):
        """
        Réalise l'addition de deux points P1 et P2 sur la courbe elliptique.
        Gère les cas pa rticuliers : point à l'infini et doublement de point.
        """
        # Si l'un des points est l'élément neutre (Point à l'infini)
        if P1 is None:
            return P2
        if P2 is None:
            return P1

        x1, y1 = P1
        x2, y2 = P2

        # Si les points sont opposés, le résultat est le point à l'infini
        if x1 == x2 and (y1 + y2) % Crypto.P == 0:
            return None

        # Calcul de la pente (m)
        if x1 == x2:  # Cas du doublement de point : P1 == P2
            m = (3 * x1 * x1 + Crypto.A) * Crypto._calculer_inverse_modulaire(
                2 * y1, Crypto.P
            )
        else:  # Cas de l'addition simple
            m = (y2 - y1) * Crypto._calculer_inverse_modulaire(x2 - x1, Crypto.P)

        # Calcul des coordonnées du nouveau point P3
        x3 = (m * m - x1 - x2) % Crypto.P
        y3 = (m * (x1 - x3) - y1) % Crypto.P

        return (x3, y3)

    @staticmethod
    def _multiplier_point_par_scalaire(k, P1):
        """
        Multiplication scalaire (k * P) en utilisant l'algorithme 'Double-and-Add'.
        Complexité : O(log k).
        """
        resultat = None
        puissance_de_deux = P1

        while k > 0:
            if k & 1:  # Si le bit de poids faible est à 1
                resultat = Crypto._additionner_points(resultat, puissance_de_deux)
            puissance_de_deux = Crypto._additionner_points(
                puissance_de_deux, puissance_de_deux
            )
            k >>= 1  # Décalage vers la droite pour traiter le bit suivant

        return resultat

    @staticmethod
    def generer_paire_cles():
        """
        Génère une paire de clés cryptographiques.
        Retourne : (clé_privée_hex, (clé_publique_x_hex, clé_publique_y_hex))
        """
        # La clé privée est un nombre aléatoire entre 1 et N-1
        cle_privee = secrets.randbelow(Crypto.N - 1) + 1
        # La clé publique est le point Q = clé_privée * G
        cle_publique = Crypto._multiplier_point_par_scalaire(cle_privee, Crypto.G)

        return hex(cle_privee), (hex(cle_publique[0]), hex(cle_publique[1]))

    @staticmethod
    def signer(cle_privee_hex, message):
        """
        Signe un message textuel avec la clé privée.
        Retourne une signature composée d'un couple (r, s) au format hexadécimal.
        """
        d = int(cle_privee_hex, 16)
        # Hachage du message et conversion en entier
        z = int(Crypto.hacher_sha256(message), 16)

        r, s = 0, 0
        while r == 0 or s == 0:
            # Génération d'un nonce (k) unique et imprévisible
            k = secrets.randbelow(Crypto.N - 1) + 1
            # Calcul du point (x, y) = k * G
            point_k = Crypto._multiplier_point_par_scalaire(k, Crypto.G)

            r = point_k[0] % Crypto.N
            if r == 0:
                continue

            # s = k⁻¹ * (z + r * d) mod N
            k_inv = Crypto._calculer_inverse_modulaire(k, Crypto.N)
            s = (k_inv * (z + r * d)) % Crypto.N

        return hex(r), hex(s)

    @staticmethod
    def verifier(cle_publique_coords, message, signature_rs):
        """
        Vérifie l'authenticité d'une signature pour un message et une clé publique donnés.
        """
        # Conversion des entrées hexadécimales en entiers
        Qx = int(cle_publique_coords[0], 16)
        Qy = int(cle_publique_coords[1], 16)
        Q = (Qx, Qy)

        r = int(signature_rs[0], 16)
        s = int(signature_rs[1], 16)

        # Validation des bornes de la signature
        if not (0 < r < Crypto.N and 0 < s < Crypto.N):
            return False

        z = int(Crypto.hacher_sha256(message), 16)

        # w = s⁻¹ mod N
        w = Crypto._calculer_inverse_modulaire(s, Crypto.N)
        # u1 = z * w mod N, u2 = r * w mod N
        u1 = (z * w) % Crypto.N
        u2 = (r * w) % Crypto.N

        # Calcul du point P = u1*G + u2*Q
        P1 = Crypto._multiplier_point_par_scalaire(u1, Crypto.G)
        P2 = Crypto._multiplier_point_par_scalaire(u2, Q)
        P = Crypto._additionner_points(P1, P2)

        if P is None:
            return False

        # La signature est valide si la coordonnée x de P (mod N) est égale à r
        return (P[0] % Crypto.N) == r

    @staticmethod
    def hacher_sha256(donnees):
        """
        Produit un condensat SHA-256 (hash) des données fournies.
        """
        return hashlib.sha256(donnees.encode("utf-8")).hexdigest()
\
    