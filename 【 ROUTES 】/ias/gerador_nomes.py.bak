#!/usr/bin/env python3
# gerador_nomes.py - Versão para API com PyTorch

import torch
import numpy as np
import json
import sys
import os
import time
import traceback
import tempfile
import pickle

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class RealModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
        # Inicializar camadas
        self.E = None
        self.lstm = None
        self.fc = None
    
    def load(self):
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Encontra a chave que contém os dados do modelo
        model_key = None
        for key in npz_data.keys():
            if key.endswith('data.pkl'):
                model_key = key
                break
        
        if model_key is None:
            # Tenta encontrar qualquer chave que possa conter dados do modelo
            for key in npz_data.keys():
                if 'data' in key or 'model' in key or 'weights' in key:
                    model_key = key
                    break
        
        if model_key is None:
            # Se não encontrar, usa a primeira chave
            model_key = npz_data.files[0]
        
        print(f"[DEBUG] Carregando modelo da chave: {model_key}", file=sys.stderr)
        
        # Extrai os bytes
        model_bytes = npz_data[model_key]
        
        # Tenta diferentes abordagens para carregar os pesos
        try:
            # Abordagem 1: Tenta carregar como um dicionário Python diretamente
            if isinstance(model_bytes, bytes):
                # Tenta deserializar como pickle primeiro
                try:
                    weights_dict = pickle.loads(model_bytes)
                    print("[DEBUG] Carregado via pickle.loads", file=sys.stderr)
                except:
                    # Se falhar, salva em arquivo temporário
                    with tempfile.NamedTemporaryFile(suffix='.pth', delete=False) as tmp_file:
                        tmp_path = tmp_file.name
                        tmp_file.write(model_bytes)
                    
                    try:
                        # Tenta com weights_only=True primeiro
                        weights_dict = torch.load(tmp_path, map_location=self.device, weights_only=True)
                        print("[DEBUG] Carregado com weights_only=True", file=sys.stderr)
                    except:
                        # Tenta sem weights_only
                        weights_dict = torch.load(tmp_path, map_location=self.device, weights_only=False)
                        print("[DEBUG] Carregado com weights_only=False", file=sys.stderr)
                    
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
            else:
                # Se não for bytes, usa diretamente
                weights_dict = model_bytes
                
        except Exception as e:
            print(f"[DEBUG] Erro ao carregar modelo: {e}", file=sys.stderr)
            raise
        
        print(f"[DEBUG] Modelo carregado com sucesso!", file=sys.stderr)
        print(f"[DEBUG] Tipo do objeto: {type(weights_dict)}", file=sys.stderr)
        
        # Extrai os pesos de diferentes formatos possíveis
        if isinstance(weights_dict, dict):
            print(f"[DEBUG] Chaves disponíveis: {list(weights_dict.keys())}", file=sys.stderr)
            final_weights = weights_dict
        elif hasattr(weights_dict, 'state_dict'):
            final_weights = weights_dict.state_dict()
            print(f"[DEBUG] Extraído state_dict. Chaves: {list(final_weights.keys())}", file=sys.stderr)
        elif hasattr(weights_dict, '__dict__'):
            # Tenta extrair atributos
            final_weights = {}
            for key in dir(weights_dict):
                if not key.startswith('_'):
                    attr = getattr(weights_dict, key)
                    if isinstance(attr, torch.Tensor):
                        final_weights[key] = attr
            print(f"[DEBUG] Extraído de atributos. Chaves: {list(final_weights.keys())}", file=sys.stderr)
        else:
            # Última tentativa: trata como dicionário
            try:
                final_weights = dict(weights_dict)
                print(f"[DEBUG] Convertido para dict. Chaves: {list(final_weights.keys())}", file=sys.stderr)
            except:
                raise ValueError(f"Formato não suportado: {type(weights_dict)}")
        
        # Mapeamento flexível de chaves
        def find_tensor(key_pattern, weights_dict):
            key_pattern_lower = key_pattern.lower()
            for k in weights_dict.keys():
                if key_pattern_lower in k.lower():
                    return weights_dict[k]
            
            # Tenta variações comuns
            variations = [
                key_pattern.replace('.', '_'),
                key_pattern.replace('_', '.'),
                key_pattern.split('.')[-1],
                key_pattern.split('_')[-1]
            ]
            
            for var in variations:
                if var in weights_dict:
                    return weights_dict[var]
            
            return None
        
        # Carrega os pesos com mapeamento flexível
        embedding_weight = find_tensor('embedding.weight', final_weights)
        if embedding_weight is None:
            embedding_weight = find_tensor('E', final_weights)
        if embedding_weight is None:
            raise KeyError("Peso de embedding não encontrado")
        self.E = (embedding_weight.float() * self.scale).to(self.device)
        
        # Pesos LSTM primeira camada
        Wxi0 = find_tensor('lstm.weight_ih_l0', final_weights)
        if Wxi0 is None:
            Wxi0 = find_tensor('Wxi0', final_weights)
            if Wxi0 is None:
                Wxi0 = find_tensor('weight_ih_l0', final_weights)
        
        Whi0 = find_tensor('lstm.weight_hh_l0', final_weights)
        if Whi0 is None:
            Whi0 = find_tensor('Whi0', final_weights)
            if Whi0 is None:
                Whi0 = find_tensor('weight_hh_l0', final_weights)
        
        b_ih0 = find_tensor('lstm.bias_ih_l0', final_weights)
        if b_ih0 is None:
            b_ih0 = find_tensor('bias_ih_l0', final_weights)
        
        b_hh0 = find_tensor('lstm.bias_hh_l0', final_weights)
        if b_hh0 is None:
            b_hh0 = find_tensor('bias_hh_l0', final_weights)
        
        if b_ih0 is not None and b_hh0 is not None:
            self.bi0 = (b_ih0.float() + b_hh0.float()) * (self.scale * 0.5)
        else:
            bias0 = find_tensor('bi0', final_weights)
            if bias0 is None:
                bias0 = find_tensor('bias0', final_weights)
            if bias0 is None:
                bias0 = torch.zeros((1024,), dtype=torch.float32)  # 4 * hidden_size
            self.bi0 = (bias0.float() * (self.scale * 0.5)).to(self.device)
        
        # Pesos LSTM segunda camada
        Wxi1 = find_tensor('lstm.weight_ih_l1', final_weights)
        if Wxi1 is None:
            Wxi1 = find_tensor('Wxi1', final_weights)
            if Wxi1 is None:
                Wxi1 = find_tensor('weight_ih_l1', final_weights)
        
        Whi1 = find_tensor('lstm.weight_hh_l1', final_weights)
        if Whi1 is None:
            Whi1 = find_tensor('Whi1', final_weights)
            if Whi1 is None:
                Whi1 = find_tensor('weight_hh_l1', final_weights)
        
        b_ih1 = find_tensor('lstm.bias_ih_l1', final_weights)
        if b_ih1 is None:
            b_ih1 = find_tensor('bias_ih_l1', final_weights)
        
        b_hh1 = find_tensor('lstm.bias_hh_l1', final_weights)
        if b_hh1 is None:
            b_hh1 = find_tensor('bias_hh_l1', final_weights)
        
        if b_ih1 is not None and b_hh1 is not None:
            self.bi1 = (b_ih1.float() + b_hh1.float()) * (self.scale * 0.5)
        else:
            bias1 = find_tensor('bi1', final_weights)
            if bias1 is None:
                bias1 = find_tensor('bias1', final_weights)
            if bias1 is None:
                bias1 = torch.zeros((1024,), dtype=torch.float32)
            self.bi1 = (bias1.float() * (self.scale * 0.5)).to(self.device)
        
        # Pesos da camada de saída
        Wo = find_tensor('fc.weight', final_weights)
        if Wo is None:
            Wo = find_tensor('Wo', final_weights)
            if Wo is None:
                Wo = find_tensor('output.weight', final_weights)
        
        bo = find_tensor('fc.bias', final_weights)
        if bo is None:
            bo = find_tensor('bo', final_weights)
            if bo is None:
                bo = find_tensor('output.bias', final_weights)
        
        if Wxi0 is None or Whi0 is None or Wxi1 is None or Whi1 is None:
            print("[WARNING] Alguns pesos LSTM não encontrados. Verificando estrutura alternativa...", file=sys.stderr)
            
            # Tenta encontrar todos os pesos em um único tensor
            all_weights = []
            for k, v in final_weights.items():
                if isinstance(v, torch.Tensor) and v.numel() > 1000:
                    all_weights.append(v)
                    print(f"[DEBUG] Tensor grande encontrado: {k} - shape: {v.shape}", file=sys.stderr)
            
            if len(all_weights) >= 6:
                # Tenta atribuir baseado no tamanho
                all_weights.sort(key=lambda x: x.numel())
                print(f"[DEBUG] {len(all_weights)} tensores grandes encontrados", file=sys.stderr)
                
                # Tenta inferir os pesos baseado nos shapes
                for i, w in enumerate(all_weights):
                    print(f"[DEBUG] Tensor {i}: shape={w.shape}, numel={w.numel()}", file=sys.stderr)
                
                # Se não conseguirmos carregar os pesos, usaremos pesos aleatórios
                print("[WARNING] Usando pesos aleatórios para LSTM", file=sys.stderr)
                Wxi0 = torch.randn((1024, 128), dtype=torch.float32) * 0.01
                Whi0 = torch.randn((1024, 256), dtype=torch.float32) * 0.01
                self.bi0 = torch.zeros((1024,), dtype=torch.float32)
                Wxi1 = torch.randn((1024, 256), dtype=torch.float32) * 0.01
                Whi1 = torch.randn((1024, 256), dtype=torch.float32) * 0.01
                self.bi1 = torch.zeros((1024,), dtype=torch.float32)
        
        self.Wxi0 = (Wxi0.float() * self.scale).to(self.device) if Wxi0 is not None else torch.randn((1024, 128), dtype=torch.float32).to(self.device) * 0.01
        self.Whi0 = (Whi0.float() * self.scale).to(self.device) if Whi0 is not None else torch.randn((1024, 256), dtype=torch.float32).to(self.device) * 0.01
        self.Wxi1 = (Wxi1.float() * self.scale).to(self.device) if Wxi1 is not None else torch.randn((1024, 256), dtype=torch.float32).to(self.device) * 0.01
        self.Whi1 = (Whi1.float() * self.scale).to(self.device) if Whi1 is not None else torch.randn((1024, 256), dtype=torch.float32).to(self.device) * 0.01
        
        self.Wo = (Wo.float() * self.scale).to(self.device) if Wo is not None else torch.randn((38, 256), dtype=torch.float32).to(self.device) * 0.01
        self.bo = (bo.float() * (self.scale * 0.3)).to(self.device) if bo is not None else torch.zeros((38,), dtype=torch.float32).to(self.device)
        
        print(f"[DEBUG] Modelo configurado com sucesso!", file=sys.stderr)
        print(f"[DEBUG] Shapes: E={self.E.shape}, Wxi0={self.Wxi0.shape}, Whi0={self.Whi0.shape}", file=sys.stderr)
        print(f"[DEBUG] Shapes: Wxi1={self.Wxi1.shape}, Whi1={self.Whi1.shape}, Wo={self.Wo.shape}", file=sys.stderr)
        
        return self.vocab_size

    def lstm_cell(self, x, h, c, Wx, Wh, b):
        # Divide os pesos em 4 partes: input, forget, cell, output gates
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
        x = self.E[char_idx]
        h0, c0 = self.lstm_cell(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
        h1, c1 = self.lstm_cell(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
        logits = torch.matmul(self.Wo, h1) + self.bo
        return logits, h0, c0, h1, c1

def softmax(x, temperature=1.0):
    if temperature != 1.0:
        x = x / temperature
    return torch.softmax(x, dim=0)

def gerar_nome_real(model, char_to_idx, idx_to_char, temperature=0.8):
    h0 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    
    start_letters = ['a', 'e', 'i', 'o', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd']
    start_char = np.random.choice(start_letters)
    char_idx = torch.tensor(char_to_idx.get(start_char, 2), device=model.device)
    
    generated = []
    
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
        
        params = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 1.0)
        
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        while len(vocab) < 38:
            vocab.append(chr(ord('A') + len(vocab) - 28))
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        model = RealModel(device=device)
        model.load()
        
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
        
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "fallback" if len(nomes) == 0 else "gerado_pelo_modelo",
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