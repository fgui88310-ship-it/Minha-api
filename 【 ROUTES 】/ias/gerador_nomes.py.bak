#!/usr/bin/env python3
# gerador_nomes.py - Versão para API com carregamento direto de numpy

import torch
import numpy as np
import json
import sys
import os
import time
import traceback
import pickle

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class SimpleModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega os pesos do arquivo .npz diretamente como numpy arrays"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Lista todas as chaves disponíveis
        print(f"[DEBUG] Chaves no arquivo .npz: {npz_data.files}", file=sys.stderr)
        
        # Tenta encontrar a chave que contém os dados
        data_key = None
        for key in npz_data.files:
            print(f"[DEBUG] Examinando chave: {key}", file=sys.stderr)
            data = npz_data[key]
            print(f"[DEBUG]   Tipo: {type(data)}, Shape: {getattr(data, 'shape', 'N/A')}", file=sys.stderr)
            
            # Procura por dados que possam ser um modelo
            if key.endswith('.pkl') or 'data' in key or 'model' in key:
                data_key = key
                print(f"[DEBUG]   Chave potencial encontrada: {key}", file=sys.stderr)
                break
        
        if data_key is None and len(npz_data.files) > 0:
            # Usa a primeira chave como fallback
            data_key = npz_data.files[0]
            print(f"[DEBUG]   Usando primeira chave como fallback: {data_key}", file=sys.stderr)
        
        if data_key is None:
            raise ValueError("Nenhuma chave encontrada no arquivo .npz")
        
        print(f"[DEBUG] Carregando dados da chave: {data_key}", file=sys.stderr)
        data = npz_data[data_key]
        
        # Se os dados são bytes, tentamos carregar como pickle
        if isinstance(data, bytes):
            print(f"[DEBUG] Dados são bytes, tentando carregar como pickle...", file=sys.stderr)
            try:
                # Tentativa 1: Carregar diretamente como objeto
                loaded_data = pickle.loads(data)
                print(f"[DEBUG] Pickle carregado. Tipo: {type(loaded_data)}", file=sys.stderr)
                
                # Verifica se é um dicionário com pesos
                if isinstance(loaded_data, dict):
                    weights_dict = loaded_data
                    print(f"[DEBUG] É um dicionário. Chaves: {list(loaded_data.keys())}", file=sys.stderr)
                else:
                    # Tenta converter para dicionário
                    weights_dict = {}
                    if hasattr(loaded_data, '__dict__'):
                        weights_dict = loaded_data.__dict__
                        print(f"[DEBUG] Convertido de __dict__. Chaves: {list(weights_dict.keys())}", file=sys.stderr)
                    elif hasattr(loaded_data, 'state_dict'):
                        weights_dict = loaded_data.state_dict()
                        print(f"[DEBUG] Extraído de state_dict. Chaves: {list(weights_dict.keys())}", file=sys.stderr)
                    else:
                        # Último recurso: assume que são os pesos diretamente
                        weights_dict = {'weights': loaded_data}
                        print(f"[DEBUG] Usando como peso único", file=sys.stderr)
                        
            except Exception as e:
                print(f"[DEBUG] Erro ao carregar pickle: {e}", file=sys.stderr)
                raise
        else:
            # Se não são bytes, usa diretamente
            print(f"[DEBUG] Dados não são bytes, usando diretamente. Tipo: {type(data)}", file=sys.stderr)
            weights_dict = {'data': data}
        
        # Agora extraímos os pesos específicos do modelo
        print(f"[DEBUG] Procurando pesos específicos...", file=sys.stderr)
        
        # Função para extrair pesos
        def extract_weight(pattern, default_shape=None):
            for key, value in weights_dict.items():
                if pattern.lower() in key.lower():
                    print(f"[DEBUG]   Encontrado '{pattern}' em '{key}'", file=sys.stderr)
                    if isinstance(value, np.ndarray):
                        return torch.from_numpy(value).float().to(self.device)
                    elif isinstance(value, torch.Tensor):
                        return value.float().to(self.device)
                    else:
                        # Tenta converter para tensor
                        return torch.tensor(value, dtype=torch.float32, device=self.device)
            
            # Se não encontrou, cria pesos aleatórios
            print(f"[DEBUG]   '{pattern}' não encontrado, criando aleatório", file=sys.stderr)
            if default_shape:
                return torch.randn(default_shape, dtype=torch.float32, device=self.device) * 0.01
            return None
        
        # Extrai ou cria os pesos necessários
        self.E = extract_weight('embedding', (self.vocab_size, self.embed_dim)) or \
                 torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # Pesos LSTM
        self.Wxi0 = extract_weight('weight_ih_l0', (1024, self.embed_dim)) or \
                   torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        self.Whi0 = extract_weight('weight_hh_l0', (1024, self.hidden_size)) or \
                   torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        self.bi0 = extract_weight('bias_ih_l0', (1024,)) or \
                  torch.zeros((1024,), dtype=torch.float32, device=self.device) * self.scale
        
        self.Wxi1 = extract_weight('weight_ih_l1', (1024, self.hidden_size)) or \
                   torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        self.Whi1 = extract_weight('weight_hh_l1', (1024, self.hidden_size)) or \
                   torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        self.bi1 = extract_weight('bias_ih_l1', (1024,)) or \
                  torch.zeros((1024,), dtype=torch.float32, device=self.device) * self.scale
        
        # Pesos da camada de saída
        self.Wo = extract_weight('fc.weight', (self.vocab_size, self.hidden_size)) or \
                 torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        self.bo = extract_weight('fc.bias', (self.vocab_size,)) or \
                 torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * self.scale * 0.3
        
        print(f"[DEBUG] Modelo carregado com sucesso!", file=sys.stderr)
        print(f"[DEBUG] Shapes: E={self.E.shape}", file=sys.stderr)
        print(f"[DEBUG] Shapes: Wxi0={self.Wxi0.shape}, Whi0={self.Whi0.shape}", file=sys.stderr)
        print(f"[DEBUG] Shapes: Wxi1={self.Wxi1.shape}, Whi1={self.Whi1.shape}", file=sys.stderr)
        print(f"[DEBUG] Shapes: Wo={self.Wo.shape}", file=sys.stderr)
        
        return self.vocab_size
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação de uma célula LSTM"""
        # Divide os pesos em 4 gates
        Wi, Wf, Wg, Wo = torch.split(Wx, self.hidden_size, dim=0)
        Ui, Uf, Ug, Uo = torch.split(Wh, self.hidden_size, dim=0)
        bi, bf, bg, bo = torch.split(b, self.hidden_size, dim=0)
        
        i = torch.sigmoid(torch.matmul(Wi, x) + torch.matmul(Ui, h) + bi)
        f = torch.sigmoid(torch.matmul(Wf, x) + torch.matmul(Uf, h) + bf)
        g = torch.tanh(torch.matmul(Wg, x) + torch.matmul(Ug, h) + bg)
        o = torch.sigmoid(torch.matmul(Wo, x) + torch.matmul(Uo, h) + bo)
        
        c_new = f * c + i * g
        h_new = o * torch.tanh(c_new)
        return h_new, c_new
    
    def step(self, char_idx, h0, c0, h1, c1):
        """Um passo de geração"""
        x = self.E[char_idx]
        h0, c0 = self.lstm_cell(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
        h1, c1 = self.lstm_cell(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
        logits = torch.matmul(self.Wo, h1) + self.bo
        return logits, h0, c0, h1, c1

def softmax(x, temperature=1.0):
    """Softmax com temperatura"""
    if temperature != 1.0:
        x = x / temperature
    return torch.softmax(x, dim=0)

def gerar_nome_real(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera um nome usando o modelo"""
    # Inicializa estados ocultos
    h0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    
    # Escolhe uma letra inicial
    start_letters = ['a', 'e', 'i', 'o', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd']
    start_char = np.random.choice(start_letters)
    char_idx = torch.tensor(char_to_idx.get(start_char, 2), device=model.device)
    
    generated = []
    
    # Gera caracteres
    for step in range(30):
        logits, h0, c0, h1, c1 = model.step(char_idx, h0, c0, h1, c1)
        probs = softmax(logits, temperature)
        next_idx = torch.multinomial(probs, 1).item()
        next_char = idx_to_char.get(next_idx, '?')
        
        if next_char == '\n':
            if len(generated) >= 2:
                break
            continue
        
        generated.append(next_char)
        char_idx = torch.tensor(next_idx, device=model.device)
        
        if next_char == ' ' and len(generated) >= 3:
            break
        if len(generated) >= 15:
            break
    
    return ''.join(generated).strip()

def processar_nome_gerado(texto, idx_to_char):
    """Processa e limpa o nome gerado"""
    if not texto:
        return None
    
    texto = texto.lower()
    limpo = []
    for c in texto:
        if c.isalpha():
            limpo.append(c)
        elif c.isspace() and limpo and limpo[-1] != ' ':
            limpo.append(' ')
    
    texto_limpo = ''.join(limpo).strip()
    if not texto_limpo:
        return None
    
    palavras = texto_limpo.split()
    palavras_filtradas = []
    for p in palavras:
        if 2 <= len(p) <= 10:
            palavras_filtradas.append(p[0].upper() + p[1:])
    
    if not palavras_filtradas:
        return None
    
    return ' '.join(palavras_filtradas)

def main():
    print(f"[DEBUG] Diretório atual: {os.getcwd()}", file=sys.stderr)
    print(f"[DEBUG] Caminho do script: {__file__}", file=sys.stderr)
    print(f"[DEBUG] Buscando modelo em: {os.path.abspath(WEIGHTS_FILE)}", file=sys.stderr)
    
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"[DEBUG] Usando dispositivo: {device}", file=sys.stderr)
        
        # Parse parâmetros
        params = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 0.8)
        
        # Cria vocabulário
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        while len(vocab) < 38:
            vocab.append(chr(ord('A') + len(vocab) - 28))
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Carrega modelo
        model = SimpleModel(device=device)
        model.load()
        
        # Gera nomes
        nomes = []
        start_time = time.time()
        
        for i in range(quantidade * 3):
            if len(nomes) >= quantidade:
                break
            
            texto_bruto = gerar_nome_real(model, char_to_idx, idx_to_char, temperature)
            nome = processar_nome_gerado(texto_bruto, idx_to_char)
            
            if nome:
                palavras = nome.split()
                if (1 <= len(palavras) <= 3 and 
                    all(2 <= len(p) <= 10 for p in palavras) and
                    nome not in nomes):
                    nomes.append(nome)
        
        # Fallback se não gerou nomes
        if not nomes:
            print("[WARNING] Nenhum nome gerado, usando fallback", file=sys.stderr)
            prefixos = ["Mar", "Jon", "Alex", "Luc", "Jul", "Ped", "Sof", "Mat", "Lau", "Car"]
            sufixos = ["ia", "as", "to", "ana", "iano", "erte", "ro", "ia", "eus", "ra"]
            for _ in range(quantidade):
                p = np.random.choice(prefixos)
                s = np.random.choice(sufixos)
                nome = p + s
                if len(nome) >= 4:
                    nomes.append(nome.capitalize())
        
        elapsed = time.time() - start_time
        
        # Prepara resultado
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "fallback" if not nomes else "gerado_pelo_modelo",
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
        print(f"ERRO INTERNO NO PYTHON: {error_result}", file=sys.stderr)
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()