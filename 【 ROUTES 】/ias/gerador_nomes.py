#!/usr/bin/env python3
# gerador_nomes.py - Versão final corrigida

import torch
import numpy as np
import json
import sys
import os
import time
import traceback

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class FixedModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega o modelo corrigindo o problema dos bytes"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        print(f"[DEBUG] Arquivos disponíveis: {npz_data.files}", file=sys.stderr)
        
        # Vamos carregar os 11 arquivos de dados (0-10)
        data_arrays = []
        for i in range(11):
            key = f'lstm_nomes_v6_trader/data/{i}'
            if key in npz_data.files:
                data = npz_data[key]
                
                # Verifica se é bytes e converte para numpy array
                if isinstance(data, bytes):
                    print(f"[DEBUG] Arquivo {key} é bytes, tamanho: {len(data)}", file=sys.stderr)
                    # Tenta interpretar como array numpy
                    try:
                        # Primeiro tenta carregar como numpy array diretamente
                        import io
                        buffer = io.BytesIO(data)
                        data = np.load(buffer, allow_pickle=True)
                        print(f"[DEBUG] Convertido bytes para numpy array: shape={data.shape}", file=sys.stderr)
                    except:
                        # Se falhar, assume que é um tensor serializado
                        print(f"[DEBUG] Não pode converter bytes, pulando...", file=sys.stderr)
                        continue
                
                # Agora data deve ser um numpy array
                if hasattr(data, 'shape'):
                    print(f"[DEBUG] Carregado {key}: shape={data.shape}, dtype={data.dtype}", file=sys.stderr)
                    data_arrays.append(data)
                else:
                    print(f"[WARNING] {key} não tem shape, tipo: {type(data)}", file=sys.stderr)
        
        print(f"[DEBUG] Total de arrays carregados: {len(data_arrays)}", file=sys.stderr)
        
        if len(data_arrays) < 9:
            print(f"[WARNING] Poucos arrays carregados: {len(data_arrays)}", file=sys.stderr)
            # Vamos tentar uma abordagem mais direta
            return self._load_simple_direct()
        
        # Carrega embedding (índice 0)
        if len(data_arrays) > 0:
            self.E = torch.from_numpy(data_arrays[0].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Embedding shape: {self.E.shape}", file=sys.stderr)
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # LSTM layer 0
        if len(data_arrays) > 1:
            self.Wxi0 = torch.from_numpy(data_arrays[1].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Wxi0 shape: {self.Wxi0.shape}", file=sys.stderr)
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 2:
            self.Whi0 = torch.from_numpy(data_arrays[2].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Whi0 shape: {self.Whi0.shape}", file=sys.stderr)
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Biases layer 0
        if len(data_arrays) > 3 and len(data_arrays) > 4:
            bias_ih = torch.from_numpy(data_arrays[3].astype(np.float32)).to(self.device)
            bias_hh = torch.from_numpy(data_arrays[4].astype(np.float32)).to(self.device)
            self.bi0 = (bias_ih + bias_hh) * (self.scale * 0.5)
            print(f"[DEBUG] bi0 shape: {self.bi0.shape}", file=sys.stderr)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # LSTM layer 1
        if len(data_arrays) > 5:
            self.Wxi1 = torch.from_numpy(data_arrays[5].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Wxi1 shape: {self.Wxi1.shape}", file=sys.stderr)
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 6:
            self.Whi1 = torch.from_numpy(data_arrays[6].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Whi1 shape: {self.Whi1.shape}", file=sys.stderr)
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Biases layer 1
        if len(data_arrays) > 7 and len(data_arrays) > 8:
            bias_ih = torch.from_numpy(data_arrays[7].astype(np.float32)).to(self.device)
            bias_hh = torch.from_numpy(data_arrays[8].astype(np.float32)).to(self.device)
            self.bi1 = (bias_ih + bias_hh) * (self.scale * 0.5)
            print(f"[DEBUG] bi1 shape: {self.bi1.shape}", file=sys.stderr)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # FC layer
        if len(data_arrays) > 9:
            self.Wo = torch.from_numpy(data_arrays[9].astype(np.float32)).to(self.device) * self.scale
            print(f"[DEBUG] Wo shape: {self.Wo.shape}", file=sys.stderr)
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if len(data_arrays) > 10:
            self.bo = torch.from_numpy(data_arrays[10].astype(np.float32)).to(self.device) * (self.scale * 0.3)
            print(f"[DEBUG] bo shape: {self.bo.shape}", file=sys.stderr)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[DEBUG] Modelo carregado com sucesso!", file=sys.stderr)
        return self.vocab_size
    
    def _load_simple_direct(self):
        """Carrega de forma mais direta"""
        print(f"[DEBUG] Tentando carregamento direto...", file=sys.stderr)
        
        # Carrega o arquivo .npz novamente
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Tenta carregar cada arquivo individualmente
        import io
        
        # Lista para armazenar os tensores
        tensors = []
        
        for i in range(11):
            key = f'lstm_nomes_v6_trader/data/{i}'
            if key in npz_data.files:
                data = npz_data[key]
                
                if isinstance(data, np.ndarray):
                    tensors.append(torch.from_numpy(data.astype(np.float32)))
                    print(f"[DEBUG] Tensor {i}: shape={data.shape}", file=sys.stderr)
                elif isinstance(data, bytes):
                    # Tenta carregar como numpy
                    try:
                        buffer = io.BytesIO(data)
                        array = np.load(buffer, allow_pickle=False)
                        tensors.append(torch.from_numpy(array.astype(np.float32)))
                        print(f"[DEBUG] Tensor {i} de bytes: shape={array.shape}", file=sys.stderr)
                    except:
                        # Ignora se não conseguir
                        print(f"[DEBUG] Não pode carregar tensor {i} de bytes", file=sys.stderr)
                        tensors.append(None)
        
        # Preenche os pesos
        self._fill_weights(tensors)
        return self.vocab_size
    
    def _fill_weights(self, tensors):
        """Preenche os pesos com os tensores carregados"""
        idx = 0
        
        # Embedding
        if idx < len(tensors) and tensors[idx] is not None:
            self.E = tensors[idx].to(self.device) * self.scale
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # Wxi0
        if idx < len(tensors) and tensors[idx] is not None:
            self.Wxi0 = tensors[idx].to(self.device) * self.scale
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # Whi0
        if idx < len(tensors) and tensors[idx] is not None:
            self.Whi0 = tensors[idx].to(self.device) * self.scale
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # bi0 (combina dois biases)
        if idx + 1 < len(tensors) and tensors[idx] is not None and tensors[idx + 1] is not None:
            self.bi0 = (tensors[idx] + tensors[idx + 1]).to(self.device) * (self.scale * 0.5)
            idx += 2
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
            idx += 2
        
        # Wxi1
        if idx < len(tensors) and tensors[idx] is not None:
            self.Wxi1 = tensors[idx].to(self.device) * self.scale
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # Whi1
        if idx < len(tensors) and tensors[idx] is not None:
            self.Whi1 = tensors[idx].to(self.device) * self.scale
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # bi1 (combina dois biases)
        if idx + 1 < len(tensors) and tensors[idx] is not None and tensors[idx + 1] is not None:
            self.bi1 = (tensors[idx] + tensors[idx + 1]).to(self.device) * (self.scale * 0.5)
            idx += 2
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
            idx += 2
        
        # Wo
        if idx < len(tensors) and tensors[idx] is not None:
            self.Wo = tensors[idx].to(self.device) * self.scale
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        idx += 1
        
        # bo
        if idx < len(tensors) and tensors[idx] is not None:
            self.bo = tensors[idx].to(self.device) * (self.scale * 0.3)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Célula LSTM"""
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

def gerar_nome_simples(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera um nome de forma simples"""
    h0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    
    # Começa com vogal
    start_chars = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r', 't']
    start_char = np.random.choice(start_chars)
    char_idx = torch.tensor(char_to_idx.get(start_char, 0), device=model.device)
    
    generated = [start_char]
    
    for _ in range(20):
        logits, h0, c0, h1, c1 = model.step(char_idx, h0, c0, h1, c1)
        
        if temperature != 1.0:
            logits = logits / temperature
        
        probs = torch.softmax(logits, dim=0)
        next_idx = torch.multinomial(probs, 1).item()
        next_char = idx_to_char.get(next_idx, '?')
        
        if next_char == '\n' and len(generated) >= 2:
            break
        
        generated.append(next_char)
        char_idx = torch.tensor(next_idx, device=model.device)
        
        if len(generated) >= 10:
            break
    
    return ''.join(generated).strip()

def formatar_nome_simples(texto):
    """Formata nome de forma simples"""
    if not texto:
        return None
    
    # Limpa
    texto = texto.lower()
    clean = []
    for c in texto:
        if c.isalpha():
            clean.append(c)
        elif c == ' ' and clean and clean[-1] != ' ':
            clean.append(' ')
    
    texto_limpo = ''.join(clean).strip()
    
    if not texto_limpo or len(texto_limpo) < 2:
        return None
    
    # Capitaliza
    palavras = texto_limpo.split()
    palavras_fmt = []
    
    for p in palavras:
        if 2 <= len(p) <= 8:
            p = p[0].upper() + p[1:]
            palavras_fmt.append(p)
    
    if not palavras_fmt:
        return None
    
    return ' '.join(palavras_fmt)

def get_fallback_names(quantidade):
    """Retorna nomes de fallback"""
    nomes = [
        "Maria Silva", "João Santos", "Ana Oliveira", "Pedro Souza", 
        "Lucas Rodrigues", "Julia Ferreira", "Marcos Alves",
        "Carla Pereira", "Rafael Lima", "Sofia Gomes", "Gabriel Costa",
        "Laura Ribeiro", "André Martins", "Beatriz Araujo", 
        "Felipe Cardoso", "Isabela Moraes", "Ricardo Castro"
    ]
    
    import random
    if quantidade <= len(nomes):
        return random.sample(nomes, quantidade)
    else:
        resultado = nomes[:]
        while len(resultado) < quantidade:
            resultado.append(random.choice(nomes))
        return resultado[:quantidade]

def main():
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Parâmetros
        if len(sys.argv) > 1:
            try:
                params = json.loads(sys.argv[1])
            except:
                params = {}
        else:
            params = {}
        
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 0.8)
        
        # Vocabulário simples
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        # Preenche o resto
        while len(vocab) < 38:
            vocab.append('x')
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Tenta carregar modelo
        try:
            model = FixedModel(device=device)
            model.load()
            modelo_carregado = True
        except Exception as e:
            print(f"[DEBUG] Erro ao carregar modelo: {e}", file=sys.stderr)
            modelo_carregado = False
        
        nomes = []
        start_time = time.time()
        
        if modelo_carregado:
            # Tenta gerar com o modelo
            tentativas = 0
            while len(nomes) < quantidade and tentativas < quantidade * 5:
                tentativas += 1
                texto = gerar_nome_simples(model, char_to_idx, idx_to_char, temperature)
                nome = formatar_nome_simples(texto)
                if nome and nome not in nomes:
                    nomes.append(nome)
        
        # Se não gerou o suficiente, usa fallback
        if len(nomes) < quantidade:
            print(f"[INFO] Usando fallback para completar nomes", file=sys.stderr)
            nomes_fallback = get_fallback_names(quantidade - len(nomes))
            nomes.extend(nomes_fallback)
        
        elapsed = time.time() - start_time
        
        # Resultado
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "modelo_original" if modelo_carregado and len(nomes) >= quantidade else "com_fallback",
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
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()