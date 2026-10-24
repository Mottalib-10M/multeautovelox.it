import meta from '../data/velox/meta.json';

// Date de la copie du registre MIT utilisée, au format JJ/MM/AAAA : suit meta.json à chaque relecture réussie.
const [a, m, g] = meta.catturato_il.slice(0, 10).split('-');
export const DATA_REGISTRO = `${g}/${m}/${a}`;
