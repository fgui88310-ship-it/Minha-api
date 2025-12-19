import numpy as np
import pickle
import sys
import json

# ====================== CARREGAR PESOS ======================
WEIGHTS_FILE = 'pesos_nomes_rapido.pkl'  # ajuste o caminho se necessário

with open(WEIGHTS_FILE, 'rb') as f:
    Wxh, Whh, Why, bh, by, n_iter, p = pickle.load(f)

hidden_size = Wxh.shape[0]
expected_vocab_size = Wxh.shape[1]

# ====================== VOCABULÁRIO (simplificado – você pode melhorar) ======================
# Aqui vamos recriar o vocabulário básico (ou salvar ele no pickle também)
# Para simplificar, vamos assumir que você salvou chars, char_to_ix, ix_to_char no pickle
# Melhor ainda: modifique o treinamento para salvar tudo em um dict

# Supondo que você tenha salvo assim no treinamento:
# pickle.dump({'Wxh': Wxh, 'Whh': Whh, 'Why': Why, 'bh': bh, 'by': by, 'chars': chars, 'char_to_ix': char_to_ix, 'ix_to_char': ix_to_char}, f)

data = pickle.load(open(WEIGHTS_FILE, 'rb'))
Wxh = data['Wxh']
Whh = data['Whh']
Why = data['Why']
bh = data['bh']
by = data['by']
chars = data['chars']
char_to_ix = data['char_to_ix']
ix_to_char = data['ix_to_char']

vocab_size = len(chars)

def gerar_nome(temperature=1.0, max_length=30):
    h = np.zeros((hidden_size, 1))
    seed_ix = char_to_ix.get('\n', 0)
    x = np.zeros((vocab_size, 1))
    x[seed_ix] = 1
    nome = []

    for _ in range(max_length):
        h = np.tanh(np.dot(Wxh, x) + np.dot(Whh, h) + bh)
        y = np.dot(Why, h) + by
        y = y / temperature
        p = np.exp(y - np.max(y, axis=0))
        p = p / p.sum()
        ix = np.random.choice(vocab_size, p=p.ravel())
        char = ix_to_char[ix]

        if char == '\n' and len(nome) >= 3:
            break
        nome.append(char)
        x = np.zeros((vocab_size, 1))
        x[ix] = 1

    return ''.join(nome).strip().capitalize()

if __name__ == '__main__':
    # Recebe argumentos: quantidade e temperatura
    args = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    quantidade = args.get('quantidade', 1)
    temperature = args.get('temperature', 1.0)

    nomes = [gerar_nome(temperature=temperature) for _ in range(quantidade)]
    print(json.dumps({'nomes': nomes}))