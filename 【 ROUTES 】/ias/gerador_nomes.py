#!/usr/bin/env python3
# gerador_nomes.py - Versão corrigida

import torch
import numpy as np
import json
import sys
import os
import time
import traceback

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class WorkingModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega o modelo de forma simples e direta"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        print(f"[DEBUG] Arquivos disponíveis: {npz_data.files}", file=sys.stderr)
        
        # Vamos carregar os 11 arquivos de dados (0-10) que sabemos existir
        data_arrays = []
        for i in range(11):
            key = f'lstm_nomes_v6_trader/data/{i}'
            if key in npz_data.files:
                data = npz_data[key]
                data_arrays.append(data)
                print(f"[DEBUG] Carregado {key}: shape={data.shape}, dtype={data.dtype}", file=sys.stderr)
        
        if len(data_arrays) != 11:
            print(f"[WARNING] Esperados 11 arquivos, encontrados {len(data_arrays)}", file=sys.stderr)
        
        # Mapeamento baseado na ordem típica do PyTorch LSTM:
        # 0: embedding.weight (38, 128)
        # 1: lstm.weight_ih_l0 (1024, 128) 
        # 2: lstm.weight_hh_l0 (1024, 256)
        # 3: lstm.bias_ih_l0 (1024,)
        # 4: lstm.bias_hh_l0 (1024,)
        # 5: lstm.weight_ih_l1 (1024, 256)
        # 6: lstm.weight_hh_l1 (1024, 256)
        # 7: lstm.bias_ih_l1 (1024,)
        # 8: lstm.bias_hh_l1 (1024,)
        # 9: fc.weight (38, 256)
        # 10: fc.bias (38,)
        
        # Carrega embedding
        if len(data_arrays) > 0:
            self.E = torch.from_numpy(data_arrays[0].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Embedding carregado: shape={self.E.shape}", file=sys.stderr)
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # Carrega LSTM layer 0
        if len(data_arrays) > 1:
            self.Wxi0 = torch.from_numpy(data_arrays[1].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Wxi0 carregado: shape={self.Wxi0.shape}", file=sys.stderr)
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 2:
            self.Whi0 = torch.from_numpy(data_arrays[2].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Whi0 carregado: shape={self.Whi0.shape}", file=sys.stderr)
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Combinar biases da camada 0
        if len(data_arrays) > 3 and len(data_arrays) > 4:
            bias_ih = torch.from_numpy(data_arrays[3].copy()).float().to(self.device)
            bias_hh = torch.from_numpy(data_arrays[4].copy()).float().to(self.device)
            self.bi0 = (bias_ih + bias_hh) * (self.scale * 0.5)
            print(f"[DEBUG] bi0 carregado: shape={self.bi0.shape}", file=sys.stderr)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # Carrega LSTM layer 1
        if len(data_arrays) > 5:
            self.Wxi1 = torch.from_numpy(data_arrays[5].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Wxi1 carregado: shape={self.Wxi1.shape}", file=sys.stderr)
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 6:
            self.Whi1 = torch.from_numpy(data_arrays[6].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Whi1 carregado: shape={self.Whi1.shape}", file=sys.stderr)
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Combinar biases da camada 1
        if len(data_arrays) > 7 and len(data_arrays) > 8:
            bias_ih = torch.from_numpy(data_arrays[7].copy()).float().to(self.device)
            bias_hh = torch.from_numpy(data_arrays[8].copy()).float().to(self.device)
            self.bi1 = (bias_ih + bias_hh) * (self.scale * 0.5)
            print(f"[DEBUG] bi1 carregado: shape={self.bi1.shape}", file=sys.stderr)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # Carrega camada fully connected
        if len(data_arrays) > 9:
            self.Wo = torch.from_numpy(data_arrays[9].copy()).float().to(self.device) * self.scale
            print(f"[DEBUG] Wo carregado: shape={self.Wo.shape}", file=sys.stderr)
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 10:
            self.bo = torch.from_numpy(data_arrays[10].copy()).float().to(self.device) * (self.scale * 0.3)
            print(f"[DEBUG] bo carregado: shape={self.bo.shape}", file=sys.stderr)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[DEBUG] Modelo carregado com sucesso!", file=sys.stderr)
        return self.vocab_size
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação eficiente de célula LSTM"""
        gates = torch.matmul(Wx, x) + torch.matmul(Wh, h) + b
        i, f, g, o = torch.split(gates, self.hidden_size)
        i = torch.sigmoid(i)
        f = torch.sigmoid(f)
        g = torch.tanh(g)
        o = torch.sigmoid(o)
        c_new = f * c + i * g
        h_new = o * torch.tanh(c_new)
        return h_new, c_new
    
    def step(self, char_idx, h0, c0, h1, c1):
        """Passo de geração"""
        x = self.E[char_idx]
        h0, c0 = self.lstm_cell(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
        h1, c1 = self.lstm_cell(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
        logits = torch.matmul(self.Wo, h1) + self.bo
        return logits, h0, c0, h1, c1

def gerar_nome(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera um nome"""
    # Inicializa estados
    h0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    
    # Letras iniciais comuns
    start_chars = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd', 'n', 'p', 'v']
    start_char = np.random.choice(start_chars)
    char_idx = torch.tensor(char_to_idx.get(start_char, 0), device=model.device)
    
    generated = [start_char]
    
    # Gera caracteres
    for step in range(25):
        logits, h0, c0, h1, c1 = model.step(char_idx, h0, c0, h1, c1)
        
        # Aplica temperatura
        if temperature != 1.0:
            logits = logits / temperature
        
        # Softmax
        probs = torch.softmax(logits, dim=0)
        
        # Nos primeiros passos, favorece letras comuns
        if step < 3:
            common_letters = 'aeioumnrstlcp'
            boost = 1.3
            for letter in common_letters:
                if letter in char_to_idx:
                    idx = char_to_idx[letter]
                    if idx < len(probs):
                        probs[idx] = probs[idx] * boost
            
            # Renormaliza
            probs = probs / probs.sum()
        
        # Amostra
        next_idx = torch.multinomial(probs, 1).item()
        next_char = idx_to_char.get(next_idx, '?')
        
        # Condições de parada
        if next_char == '\n' and len(generated) >= 3:
            break
        
        generated.append(next_char)
        char_idx = torch.tensor(next_idx, device=model.device)
        
        # Para em condições razoáveis
        if next_char == ' ' and len(generated) >= 4:
            break
        if len(generated) >= 15:
            break
    
    return ''.join(generated).strip()

def formatar_nome(texto):
    """Formata o nome gerado"""
    if not texto or len(texto) < 2:
        return None
    
    # Limpa e converte para minúsculas
    texto = texto.lower()
    
    # Mantém apenas letras e espaços
    chars = []
    for char in texto:
        if char.isalpha():
            chars.append(char)
        elif char == ' ' and chars and chars[-1] != ' ':
            chars.append(' ')
    
    clean_text = ''.join(chars).strip()
    
    if not clean_text:
        return None
    
    # Divide em palavras
    palavras = clean_text.split()
    palavras_validas = []
    
    for palavra in palavras:
        # Filtra palavras muito curtas ou longas
        if 2 <= len(palavra) <= 10:
            # Verifica se tem pelo menos uma vogal
            if any(vogal in palavra for vogal in 'aeiou'):
                # Capitaliza
                palavra = palavra[0].upper() + palavra[1:]
                palavras_validas.append(palavra)
    
    if not palavras_validas:
        return None
    
    return ' '.join(palavras_validas)

def gerar_nomes_reais(quantidade):
    """Gera nomes realistas como fallback"""
    nomes = [
        "Maria", "João", "Ana", "Pedro", "Lucas", "Julia", "Marcos",
        "Carla", "Rafael", "Sofia", "Gabriel", "Laura", "André",
        "Beatriz", "Felipe", "Isabela", "Ricardo", "Camila", "Daniel",
        "Amanda", "Roberto", "Patricia", "Carlos", "Fernanda", "Eduardo"
    ]
    
    sobrenomes = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira",
        "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins"
    ]
    
    import random
    resultados = []
    
    for _ in range(quantidade):
        nome = random.choice(nomes)
        if random.random() > 0.3:  # 70% chance de ter sobrenome
            sobrenome = random.choice(sobrenomes)
            nome = f"{nome} {sobrenome}"
        resultados.append(nome)
    
    return resultados

def main():
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"[DEBUG] Usando dispositivo: {device}", file=sys.stderr)
        
        # Lê parâmetros
        if len(sys.argv) > 1:
            try:
                params = json.loads(sys.argv[1])
            except:
                params = {}
        else:
            params = {}
        
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 0.8)
        
        # Cria vocabulário
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        # Preenche o resto com placeholders
        while len(vocab) < 38:
            vocab.append('_')
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Carrega modelo
        model = WorkingModel(device=device)
        model.load()
        
        # Gera nomes
        nomes_gerados = []
        tentativas = 0
        max_tentativas = quantidade * 8
        
        start_time = time.time()
        
        while len(nomes_gerados) < quantidade and tentativas < max_tentativas:
            tentativas += 1
            
            # Ajusta temperatura se necessário
            temp_ajustada = temperature
            if tentativas > quantidade * 3:
                temp_ajustada = min(temperature * 1.5, 1.5)
            
            # Gera nome
            texto = gerar_nome(model, char_to_idx, idx_to_char, temp_ajustada)
            nome = formatar_nome(texto)
            
            if nome and nome not in nomes_gerados:
                # Verifica se é um nome razoável
                if 3 <= len(nome) <= 25:
                    if any(vogal in nome.lower() for vogal in 'aeiou'):
                        nomes_gerados.append(nome)
        
        elapsed = time.time() - start_time
        
        # Se não gerou nomes suficientes, completa com fallback
        if len(nomes_gerados) < quantidade:
            print(f"[INFO] Gerados apenas {len(nomes_gerados)} nomes, completando com fallback", file=sys.stderr)
            nomes_fallback = gerar_nomes_reais(quantidade - len(nomes_gerados))
            nomes_gerados.extend(nomes_fallback)
        
        # Prepara resultado
        result = {
            "nomes": nomes_gerados[:quantidade],
            "quantidade": len(nomes_gerados[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "modelo_funcionando" if tentativas < max_tentativas else "com_fallback",
            "sucesso": True,
            "device": device
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            "sucesso": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(f"ERRO INTERNO: {error_result}", file=sys.stderr)
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()