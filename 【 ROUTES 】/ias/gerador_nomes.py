#!/usr/bin/env python3
# gerador_nomes.py - Versão que carrega pesos diretamente dos arquivos .npy

import torch
import numpy as np
import json
import sys
import os
import time
import traceback

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class DirectLoadModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega os pesos diretamente dos arquivos .npy dentro do .npz"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Lista todas as chaves disponíveis
        print(f"[DEBUG] Chaves no arquivo .npz: {npz_data.files}", file=sys.stderr)
        
        # Ignora o arquivo .pkl problemático e procura por arquivos de dados
        data_files = []
        for key in npz_data.files:
            if key.startswith('lstm_nomes_v6_trader/data/') and not key.endswith('.pkl'):
                data_files.append(key)
                print(f"[DEBUG] Arquivo de dados encontrado: {key}", file=sys.stderr)
        
        if not data_files:
            raise ValueError("Nenhum arquivo de dados encontrado no .npz")
        
        # Organiza os arquivos por número
        data_files.sort(key=lambda x: int(x.split('/')[-1]))
        
        # Tenta carregar os pesos na ordem esperada
        weights = []
        for data_file in data_files:
            try:
                data = npz_data[data_file]
                print(f"[DEBUG] Carregando {data_file}: shape={data.shape}, dtype={data.dtype}", file=sys.stderr)
                weights.append(data)
            except Exception as e:
                print(f"[DEBUG] Erro ao carregar {data_file}: {e}", file=sys.stderr)
        
        print(f"[DEBUG] Total de pesos carregados: {len(weights)}", file=sys.stderr)
        
        # Atribui os pesos baseado na posição e formato
        # Ordem esperada: embedding, Wxi0, Whi0, bias0, Wxi1, Whi1, bias1, fc_weight, fc_bias
        weight_idx = 0
        
        # 1. Embedding (vocab_size x embed_dim)
        if weight_idx < len(weights):
            self.E = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Embedding shape: {self.E.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # 2. LSTM layer 0 weights
        # Wxi0 (4*hidden_size x embed_dim)
        if weight_idx < len(weights):
            self.Wxi0 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Wxi0 shape: {self.Wxi0.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # 3. LSTM layer 0 recurrent weights
        # Whi0 (4*hidden_size x hidden_size)
        if weight_idx < len(weights):
            self.Whi0 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Whi0 shape: {self.Whi0.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 4. LSTM layer 0 bias
        # bias0 (4*hidden_size)
        if weight_idx < len(weights):
            self.bi0 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * (self.scale * 0.5)
            print(f"[DEBUG] bi0 shape: {self.bi0.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # 5. LSTM layer 1 weights
        # Wxi1 (4*hidden_size x hidden_size)
        if weight_idx < len(weights):
            self.Wxi1 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Wxi1 shape: {self.Wxi1.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 6. LSTM layer 1 recurrent weights
        # Whi1 (4*hidden_size x hidden_size)
        if weight_idx < len(weights):
            self.Whi1 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Whi1 shape: {self.Whi1.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 7. LSTM layer 1 bias
        # bias1 (4*hidden_size)
        if weight_idx < len(weights):
            self.bi1 = torch.from_numpy(weights[weight_idx]).float().to(self.device) * (self.scale * 0.5)
            print(f"[DEBUG] bi1 shape: {self.bi1.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # 8. FC layer weight
        # fc_weight (vocab_size x hidden_size)
        if weight_idx < len(weights):
            self.Wo = torch.from_numpy(weights[weight_idx]).float().to(self.device) * self.scale
            print(f"[DEBUG] Wo shape: {self.Wo.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # 9. FC layer bias
        # fc_bias (vocab_size)
        if weight_idx < len(weights):
            self.bo = torch.from_numpy(weights[weight_idx]).float().to(self.device) * (self.scale * 0.3)
            print(f"[DEBUG] bo shape: {self.bo.shape}", file=sys.stderr)
            weight_idx += 1
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[DEBUG] Modelo carregado com sucesso! Usados {weight_idx} pesos de {len(weights)} disponíveis", file=sys.stderr)
        
        return self.vocab_size
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação de uma célula LSTM"""
        # Divide os pesos em 4 gates
        Wi, Wf, Wg, Wo_gate = torch.split(Wx, self.hidden_size, dim=0)
        Ui, Uf, Ug, Uo = torch.split(Wh, self.hidden_size, dim=0)
        bi, bf, bg, bo = torch.split(b, self.hidden_size, dim=0)
        
        i = torch.sigmoid(torch.matmul(Wi, x) + torch.matmul(Ui, h) + bi)
        f = torch.sigmoid(torch.matmul(Wf, x) + torch.matmul(Uf, h) + bf)
        g = torch.tanh(torch.matmul(Wg, x) + torch.matmul(Ug, h) + bg)
        o = torch.sigmoid(torch.matmul(Wo_gate, x) + torch.matmul(Uo, h) + bo)
        
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
        if len(sys.argv) > 1:
            try:
                params = json.loads(sys.argv[1])
            except json.JSONDecodeError:
                params = {}
        else:
            params = {}
            
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
        model = DirectLoadModel(device=device)
        model.load()
        
        # Gera nomes
        nomes = []
        start_time = time.time()
        
        max_tentativas = quantidade * 5
        tentativas = 0
        
        while len(nomes) < quantidade and tentativas < max_tentativas:
            tentativas += 1
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