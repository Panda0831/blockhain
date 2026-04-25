class UnionFind:
    """
    Implémentation de l'algorithme Union-Find (Disjoint Set Union)
    utilisée pour la gestion foncière et la détection de double vente.
    """

    def __init__(self):
        self.parent = {}
        self.rang = {}

    def exists(self, item):
        """Vérifie si un élément existe déjà dans le set."""
        return item in self.parent

    def add(self, item):
        """Ajoute un nouvel élément (ex: une nouvelle parcelle ou un nouveau propriétaire)."""
        if item not in self.parent:
            self.parent[item] = item
            self.rang[item] = 0

    def find(self, item):
        """
        Trouve la racine de l'élément avec compression de chemin.
        La racine représente le propriétaire ultime ou le titre foncier parent.
        """
        if item not in self.parent:
            return None

        if self.parent[item] == item:
            return item

        # Compression de chemin : on rattache directement à la racine
        self.parent[item] = self.find(self.parent[item])
        return self.parent[item]

    def union(self, item1, item2):
        """
        Fusionne deux ensembles (ex: vente d'une parcelle à un propriétaire).
        Retourne True si la fusion a réussi, False si ils étaient déjà liés.
        """
        root1 = self.find(item1)
        root2 = self.find(item2)

        if root1 is None or root2 is None:
            return False

        if root1 != root2:
            # Union by rang : on attache le plus petit arbre sous le plus grand
            if self.rang[root1] > self.rang[root2]:
                self.parent[root2] = root1
            elif self.rang[root1] < self.rang[root2]:
                self.parent[root1] = root2
            else:
                self.parent[root2] = root1
                self.rang[root1] += 1
            return True

        return False

    def is_connected(self, item1, item2):
        """Vérifie si deux éléments appartiennent au même ensemble."""
        return self.find(item1) == self.find(item2)
