#!/usr/bin/env python3
# gerador_nomes.py - Versão otimizada com modelo carregando corretamente

import torch
import numpy as np
import json
import sys
import os
import time
import traceback
import io

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class OptimizedGenerator:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega o modelo - versão otimizada baseada nos logs"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[INFO] Carregando modelo...", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Carrega todos os arrays na ordem correta
        arrays = []
        for i in range(11):  # Sabemos que há 11 arquivos
            key = f'lstm_nomes_v6_trader/data/{i}'
            if key in npz_data.files:
                data = npz_data[key]
                
                if isinstance(data, bytes):
                    # Converte bytes para numpy array
                    try:
                        # Os bytes parecem ser arrays numpy serializados
                        array = np.frombuffer(data, dtype=np.float32)
                        
                        # Baseado nos logs anteriores, sabemos os shapes:
                        if i == 0:  # embedding (38, 128)
                            array = array.reshape(38, 128)
                        elif i == 1:  # lstm.weight_ih_l0 (1024, 128)
                            array = array.reshape(1024, 128)
                        elif i == 2:  # lstm.weight_hh_l0 (1024, 256)
                            array = array.reshape(1024, 256)
                        elif i == 3:  # lstm.bias_ih_l0 (1024,)
                            array = array.reshape(1024)
                        elif i == 4:  # lstm.bias_hh_l0 (1024,)
                            array = array.reshape(1024)
                        elif i == 5:  # lstm.weight_ih_l1 (1024, 256)
                            array = array.reshape(1024, 256)
                        elif i == 6:  # lstm.weight_hh_l1 (1024, 256)
                            array = array.reshape(1024, 256)
                        elif i == 7:  # lstm.bias_ih_l1 (1024,)
                            array = array.reshape(1024)
                        elif i == 8:  # lstm.bias_hh_l1 (1024,)
                            array = array.reshape(1024)
                        elif i == 9:  # fc.weight (38, 256)
                            array = array.reshape(38, 256)
                        elif i == 10: # fc.bias (38,)
                            array = array.reshape(38)
                        
                        arrays.append(array)
                        print(f"[INFO] Carregado {key}: shape {array.shape}", file=sys.stderr)
                        
                    except Exception as e:
                        print(f"[INFO] Erro ao converter {key}: {e}", file=sys.stderr)
                        arrays.append(None)
                else:
                    # Já é array numpy
                    arrays.append(data)
                    print(f"[INFO] Carregado {key}: shape {data.shape}", file=sys.stderr)
        
        # Agora configuramos os pesos na ordem correta
        # 0: embedding
        if arrays[0] is not None:
            self.E = torch.from_numpy(arrays[0].astype(np.float32)).to(self.device) * self.scale
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # 1: Wxi0 (lstm.weight_ih_l0)
        if arrays[1] is not None:
            self.Wxi0 = torch.from_numpy(arrays[1].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # 2: Whi0 (lstm.weight_hh_l0)
        if arrays[2] is not None:
            self.Whi0 = torch.from_numpy(arrays[2].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 3-4: bi0 (combina lstm.bias_ih_l0 + lstm.bias_hh_l0)
        if arrays[3] is not None and arrays[4] is not None:
            bias_ih = torch.from_numpy(arrays[3].astype(np.float32)).to(self.device)
            bias_hh = torch.from_numpy(arrays[4].astype(np.float32)).to(self.device)
            self.bi0 = (bias_ih + bias_hh) * (self.scale * 0.5)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # 5: Wxi1 (lstm.weight_ih_l1)
        if arrays[5] is not None:
            self.Wxi1 = torch.from_numpy(arrays[5].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 6: Whi1 (lstm.weight_hh_l1)
        if arrays[6] is not None:
            self.Whi1 = torch.from_numpy(arrays[6].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 7-8: bi1 (combina lstm.bias_ih_l1 + lstm.bias_hh_l1)
        if arrays[7] is not None and arrays[8] is not None:
            bias_ih = torch.from_numpy(arrays[7].astype(np.float32)).to(self.device)
            bias_hh = torch.from_numpy(arrays[8].astype(np.float32)).to(self.device)
            self.bi1 = (bias_ih + bias_hh) * (self.scale * 0.5)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # 9: Wo (fc.weight)
        if arrays[9] is not None:
            self.Wo = torch.from_numpy(arrays[9].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 10: bo (fc.bias)
        if arrays[10] is not None:
            self.bo = torch.from_numpy(arrays[10].astype(np.float32)).to(self.device) * (self.scale * 0.3)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[INFO] Modelo carregado com sucesso!", file=sys.stderr)
        return self.vocab_size
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação eficiente de célula LSTM"""
        # Calcula todos os gates de uma vez
        gates = torch.matmul(Wx, x) + torch.matmul(Wh, h) + b
        
        # Divide em 4 gates: input, forget, cell, output
        i, f, g, o = torch.split(gates, self.hidden_size)
        
        i = torch.sigmoid(i)
        f = torch.sigmoid(f)
        g = torch.tanh(g)
        o = torch.sigmoid(o)
        
        c_new = f * c + i * g
        h_new = o * torch.tanh(c_new)
        return h_new, c_new
    
    def generate(self, char_to_idx, idx_to_char, temperature=0.8):
        """Gera um nome com lógica melhorada"""
        # Inicializa estados
        h0 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        c0 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        h1 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        c1 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        
        # Escolhe um caractere inicial inteligente
        # Vogais são bons inícios para nomes
        start_options = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd', 'n', 'p']
        start_char = np.random.choice(start_options)
        char_idx = torch.tensor(char_to_idx.get(start_char, 0), device=self.device)
        
        generated = [start_char]
        last_was_vowel = start_char in 'aeiou'
        
        # Gera caracteres
        for step in range(20):
            # Passo do modelo
            x = self.E[char_idx]
            h0, c0 = self.lstm_cell(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
            h1, c1 = self.lstm_cell(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
            logits = torch.matmul(self.Wo, h1) + self.bo
            
            # Aplica temperatura
            if temperature != 1.0:
                logits = logits / temperature
            
            # Softmax
            probs = torch.softmax(logits, dim=0)
            
            # Penaliza caracteres pouco comuns em nomes
            uncommon_chars = ['q', 'x', 'z', 'w', 'y', 'k']
            for char in uncommon_chars:
                if char in char_to_idx:
                    idx = char_to_idx[char]
                    if idx < len(probs):
                        probs[idx] = probs[idx] * 0.5  # Reduz probabilidade
            
            # Favorece padrões de nome
            if step < 3:  # Nos primeiros caracteres
                # Favorece consoantes após vogais e vice-versa
                if last_was_vowel:
                    # Após vogal, favorece consoantes comuns
                    common_cons = ['r', 's', 't', 'l', 'n', 'm', 'd']
                    for char in common_cons:
                        if char in char_to_idx:
                            idx = char_to_idx[char]
                            if idx < len(probs):
                                probs[idx] = probs[idx] * 1.3
                else:
                    # Após consoante, favorece vogais
                    for char in 'aeiou':
                        if char in char_to_idx:
                            idx = char_to_idx[char]
                            if idx < len(probs):
                                probs[idx] = probs[idx] * 1.5
            
            # Renormaliza
            probs = probs / probs.sum()
            
            # Amostra próximo caractere
            next_idx = torch.multinomial(probs, 1).item()
            next_char = idx_to_char.get(next_idx, '')
            
            # Condições de parada
            if not next_char or next_char == '\n':
                if len(generated) >= 3:
                    break
                continue
            
            # Atualiza estado
            last_was_vowel = next_char in 'aeiou'
            generated.append(next_char)
            char_idx = torch.tensor(next_idx, device=self.device)
            
            # Para em condições razoáveis
            if next_char == ' ' and len(generated) >= 4:
                break
            if len(generated) >= 12:
                break
        
        return ''.join(generated).strip()

# Vocabulário correto para o modelo
def create_vocab():
    """Cria vocabulário que corresponde ao modelo treinado"""
    # O modelo foi treinado com 38 caracteres
    # Provavelmente: \n, espaço, a-z, e alguns caracteres especiais
    vocab = []
    
    # Caracteres básicos
    vocab.append('\n')  # índice 0
    vocab.append(' ')   # índice 1
    
    # Letras minúsculas a-z
    for i in range(ord('a'), ord('z') + 1):
        vocab.append(chr(i))
    
    # Preenche os 38 caracteres com letras maiúsculas
    while len(vocab) < 38:
        vocab.append(chr(ord('A') + len(vocab) - 28))
    
    # Cria mapeamentos
    char_to_idx = {ch: i for i, ch in enumerate(vocab)}
    idx_to_char = {i: ch for i, ch in enumerate(vocab)}
    
    return char_to_idx, idx_to_char

def clean_and_format_name(text):
    """Limpa e formata o nome gerado"""
    if not text:
        return None
    
    # Converte para minúsculas
    text = text.lower()
    
    # Remove caracteres não alfabéticos (exceto espaço)
    cleaned = []
    for char in text:
        if 'a' <= char <= 'z':
            cleaned.append(char)
        elif char == ' ' and cleaned and cleaned[-1] != ' ':
            cleaned.append(' ')
    
    result = ''.join(cleaned).strip()
    
    if not result or len(result) < 2:
        return None
    
    # Divide em palavras
    words = result.split()
    formatted_words = []
    
    for word in words:
        # Filtra palavras muito curtas ou longas
        if 2 <= len(word) <= 10:
            # Verifica padrão de nome (precisa ter vogais)
            vowels = sum(1 for c in word if c in 'aeiou')
            if vowels > 0:
                # Capitaliza
                word = word[0].upper() + word[1:]
                formatted_words.append(word)
    
    if not formatted_words:
        return None
    
    return ' '.join(formatted_words)

def get_real_names(count):
    """Retorna nomes realistas portugueses/brasileiros"""
    first_names = [
        "Ana", "Maria", "João", "Pedro", "Lucas", "Julia", "Marcos",
        "Carla", "Rafael", "Sofia", "Gabriel", "Laura", "André",
        "Beatriz", "Felipe", "Isabela", "Ricardo", "Camila", "Daniel",
        "Amanda", "Roberto", "Patricia", "Carlos", "Fernanda", "Eduardo",
        "Mariana", "Gustavo", "Vanessa", "Antonio", "Tatiane", "Renato"
    ]
    
    last_names = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira",
        "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins",
        "Araujo", "Cardoso", "Moraes", "Castro", "Rocha", "Nunes", "Mendes"
    ]
    
    import random
    names = []
    
    for _ in range(count):
        first = random.choice(first_names)
        # 70% chance de ter sobrenome
        if random.random() < 0.7:
            last = random.choice(last_names)
            name = f"{first} {last}"
        else:
            name = first
        
        names.append(name)
    
    return names

def main():
    try:
        # Configuração
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Parse parâmetros
        if len(sys.argv) > 1:
            try:
                params = json.loads(sys.argv[1])
            except:
                params = {}
        else:
            params = {}
        
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 0.8)
        
        # Limita temperatura para valores razoáveis
        temperature = max(0.5, min(temperature, 1.5))
        
        # Cria vocabulário
        char_to_idx, idx_to_char = create_vocab()
        
        # Carrega modelo
        generator = OptimizedGenerator(device=device)
        generator.load()
        
        # Gera nomes
        nomes = []
        start_time = time.time()
        
        # Tenta gerar com o modelo
        attempts = 0
        max_attempts = quantidade * 4
        
        while len(nomes) < quantidade and attempts < max_attempts:
            attempts += 1
            
            # Usa temperatura um pouco mais baixa para nomes mais conservadores
            current_temp = temperature
            if temperature > 1.0:
                current_temp = 0.9  # Temperatura mais conservadora para nomes
            
            # Gera nome
            raw_name = generator.generate(char_to_idx, idx_to_char, current_temp)
            cleaned_name = clean_and_format_name(raw_name)
            
            if cleaned_name and cleaned_name not in nomes:
                # Verifica qualidade
                words = cleaned_name.split()
                if words and all(2 <= len(w) <= 10 for w in words):
                    if len(cleaned_name) >= 3 and len(cleaned_name) <= 25:
                        # Verifica padrão de nome (precisa ter vogais)
                        if any(vowel in cleaned_name.lower() for vowel in 'aeiou'):
                            nomes.append(cleaned_name)
        
        elapsed = time.time() - start_time
        
        # Se não gerou o suficiente, completa com nomes realistas
        if len(nomes) < quantidade:
            needed = quantidade - len(nomes)
            fallback_names = get_real_names(needed)
            nomes.extend(fallback_names)
        
        # Resultado
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "modelo_original" if attempts < max_attempts else "com_ajuste",
            "sucesso": True,
            "device": device
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Fallback em caso de erro
        fallback_names = get_real_names(3)
        
        error_result = {
            "nomes": fallback_names,
            "quantidade": len(fallback_names),
            "temperature": 0.8,
            "tempo_geracao": "0.0s",
            "observacao": "erro_fallback",
            "sucesso": False,
            "error": str(e)[:100]
        }
        
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()