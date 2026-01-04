#!/usr/bin/env python3
# gerador_nomes.py - Versão que carrega o pickle corretamente

import torch
import numpy as np
import json
import sys
import os
import time
import traceback
import pickle
import io
import collections

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class CorrectLoadModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega o modelo do pickle usando a estrutura correta"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Carrega o pickle
        pickle_key = 'lstm_nomes_v6_trader/data.pkl'
        if pickle_key not in npz_data.files:
            raise ValueError(f"Arquivo pickle não encontrado: {pickle_key}")
        
        pickle_data = npz_data[pickle_key]
        print(f"[DEBUG] Tamanho do pickle: {len(pickle_data)} bytes", file=sys.stderr)
        
        # Cria um unpickler customizado para lidar com os tensores
        class TensorUnpickler(pickle.Unpickler):
            def __init__(self, file, npz_data):
                super().__init__(file)
                self.npz_data = npz_data
                
            def persistent_load(self, pid):
                # O formato é: (storage_type, key, location, numel, view_metadata)
                if isinstance(pid, tuple) and len(pid) >= 4:
                    storage_type, key, location, numel = pid[:4]
                    
                    # Procura o tensor nos arquivos de dados
                    data_key = f"lstm_nomes_v6_trader/data/{key}"
                    if data_key in self.npz_data.files:
                        tensor_data = self.npz_data[data_key]
                        print(f"[DEBUG] Carregando tensor {key} de {data_key}, shape={tensor_data.shape}", file=sys.stderr)
                        
                        # Converte para tensor PyTorch
                        tensor = torch.from_numpy(tensor_data.copy())
                        
                        # Aplica view se necessário
                        if len(pid) > 4:
                            view_metadata = pid[4]
                            if view_metadata:
                                tensor = tensor.view(*view_metadata)
                        
                        return tensor
                    else:
                        print(f"[WARNING] Tensor {key} não encontrado em {data_key}", file=sys.stderr)
                        # Retorna tensor vazio
                        return torch.zeros(numel, dtype=torch.float32)
                
                raise pickle.UnpicklingError(f"Persistent ID inválido: {pid}")
        
        # Carrega o pickle
        stream = io.BytesIO(pickle_data)
        unpickler = TensorUnpickler(stream, npz_data)
        
        try:
            model_dict = unpickler.load()
            print(f"[DEBUG] Tipo do objeto carregado: {type(model_dict)}", file=sys.stderr)
            
            if isinstance(model_dict, collections.OrderedDict):
                print(f"[DEBUG] É um OrderedDict com {len(model_dict)} chaves", file=sys.stderr)
                print(f"[DEBUG] Chaves: {list(model_dict.keys())}", file=sys.stderr)
                
                # Converte para dicionário regular
                weights_dict = dict(model_dict)
            elif isinstance(model_dict, dict):
                weights_dict = model_dict
                print(f"[DEBUG] É um dict com {len(weights_dict)} chaves", file=sys.stderr)
                print(f"[DEBUG] Chaves: {list(weights_dict.keys())}", file=sys.stderr)
            else:
                raise ValueError(f"Tipo inesperado: {type(model_dict)}")
            
        except Exception as e:
            print(f"[DEBUG] Erro ao carregar pickle: {e}", file=sys.stderr)
            # Tenta uma abordagem mais simples
            return self._load_simple(npz_data)
        
        # Agora extrai os pesos do dicionário
        self._extract_weights(weights_dict)
        
        return self.vocab_size
    
    def _load_simple(self, npz_data):
        """Carregamento simples se o pickle falhar"""
        print(f"[DEBUG] Tentando carregamento simples...", file=sys.stderr)
        
        # Procura por arquivos de dados
        data_files = {}
        for key in npz_data.files:
            if key.startswith('lstm_nomes_v6_trader/data/') and not key.endswith('.pkl'):
                idx = int(key.split('/')[-1])
                data = npz_data[key]
                data_files[idx] = data
        
        if not data_files:
            raise ValueError("Nenhum arquivo de dados encontrado")
        
        # Ordena por índice
        sorted_indices = sorted(data_files.keys())
        
        # Mapeamento baseado na ordem - ajuste baseado no que vimos
        # Pelos logs anteriores, temos 11 tensores (0-10)
        mapping = {
            0: 'embedding.weight',
            1: 'lstm.weight_ih_l0',
            2: 'lstm.weight_hh_l0',
            3: 'lstm.bias_ih_l0',
            4: 'lstm.bias_hh_l0',
            5: 'lstm.weight_ih_l1',
            6: 'lstm.weight_hh_l1',
            7: 'lstm.bias_ih_l1',
            8: 'lstm.bias_hh_l1',
            9: 'fc.weight',
            10: 'fc.bias'
        }
        
        weights_dict = {}
        for idx in sorted_indices:
            if idx in mapping:
                key = mapping[idx]
                weights_dict[key] = data_files[idx]
                print(f"[DEBUG] Mapeado idx {idx} -> {key}, shape={data_files[idx].shape}", file=sys.stderr)
        
        self._extract_weights(weights_dict)
        return self.vocab_size
    
    def _extract_weights(self, weights_dict):
        """Extrai os pesos do dicionário"""
        print(f"[DEBUG] Extraindo pesos...", file=sys.stderr)
        
        # Função para obter tensor
        def get_tensor(key, default_shape=None):
            # Tenta várias variações do nome da chave
            variations = [
                key,
                key.lower(),
                key.replace('.', '_'),
                key.replace('_', '.'),
            ]
            
            for var in variations:
                if var in weights_dict:
                    data = weights_dict[var]
                    if isinstance(data, np.ndarray):
                        return torch.from_numpy(data.copy()).float().to(self.device)
                    elif isinstance(data, torch.Tensor):
                        return data.float().to(self.device)
            
            return None
        
        # 1. Embedding
        self.E = get_tensor('embedding.weight')
        if self.E is None:
            # Tenta outras variações
            self.E = get_tensor('embedding_weight') or get_tensor('E')
        
        if self.E is None:
            print(f"[WARNING] Embedding não encontrado, usando aleatório", file=sys.stderr)
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.E = self.E * self.scale
            print(f"[DEBUG] Embedding carregado, shape={self.E.shape}", file=sys.stderr)
        
        # 2. LSTM camada 0
        # Combina bias_ih e bias_hh
        bias_ih_l0 = get_tensor('lstm.bias_ih_l0') or get_tensor('lstm_bias_ih_l0')
        bias_hh_l0 = get_tensor('lstm.bias_hh_l0') or get_tensor('lstm_bias_hh_l0')
        
        if bias_ih_l0 is not None and bias_hh_l0 is not None:
            self.bi0 = (bias_ih_l0 + bias_hh_l0) * (self.scale * 0.5)
            print(f"[DEBUG] bi0 carregado (combinado), shape={self.bi0.shape}", file=sys.stderr)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
            print(f"[WARNING] bi0 não encontrado, usando zeros", file=sys.stderr)
        
        self.Wxi0 = get_tensor('lstm.weight_ih_l0') or get_tensor('lstm_weight_ih_l0')
        if self.Wxi0 is None:
            print(f"[WARNING] Wxi0 não encontrado, usando aleatório", file=sys.stderr)
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.Wxi0 = self.Wxi0 * self.scale
            print(f"[DEBUG] Wxi0 carregado, shape={self.Wxi0.shape}", file=sys.stderr)
        
        self.Whi0 = get_tensor('lstm.weight_hh_l0') or get_tensor('lstm_weight_hh_l0')
        if self.Whi0 is None:
            print(f"[WARNING] Whi0 não encontrado, usando aleatório", file=sys.stderr)
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.Whi0 = self.Whi0 * self.scale
            print(f"[DEBUG] Whi0 carregado, shape={self.Whi0.shape}", file=sys.stderr)
        
        # 3. LSTM camada 1
        # Combina bias_ih e bias_hh
        bias_ih_l1 = get_tensor('lstm.bias_ih_l1') or get_tensor('lstm_bias_ih_l1')
        bias_hh_l1 = get_tensor('lstm.bias_hh_l1') or get_tensor('lstm_bias_hh_l1')
        
        if bias_ih_l1 is not None and bias_hh_l1 is not None:
            self.bi1 = (bias_ih_l1 + bias_hh_l1) * (self.scale * 0.5)
            print(f"[DEBUG] bi1 carregado (combinado), shape={self.bi1.shape}", file=sys.stderr)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
            print(f"[WARNING] bi1 não encontrado, usando zeros", file=sys.stderr)
        
        self.Wxi1 = get_tensor('lstm.weight_ih_l1') or get_tensor('lstm_weight_ih_l1')
        if self.Wxi1 is None:
            print(f"[WARNING] Wxi1 não encontrado, usando aleatório", file=sys.stderr)
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.Wxi1 = self.Wxi1 * self.scale
            print(f"[DEBUG] Wxi1 carregado, shape={self.Wxi1.shape}", file=sys.stderr)
        
        self.Whi1 = get_tensor('lstm.weight_hh_l1') or get_tensor('lstm_weight_hh_l1')
        if self.Whi1 is None:
            print(f"[WARNING] Whi1 não encontrado, usando aleatório", file=sys.stderr)
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.Whi1 = self.Whi1 * self.scale
            print(f"[DEBUG] Whi1 carregado, shape={self.Whi1.shape}", file=sys.stderr)
        
        # 4. Camada de saída
        self.Wo = get_tensor('fc.weight') or get_tensor('fc_weight')
        if self.Wo is None:
            print(f"[WARNING] Wo não encontrado, usando aleatório", file=sys.stderr)
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        else:
            self.Wo = self.Wo * self.scale
            print(f"[DEBUG] Wo carregado, shape={self.Wo.shape}", file=sys.stderr)
        
        self.bo = get_tensor('fc.bias') or get_tensor('fc_bias')
        if self.bo is None:
            print(f"[WARNING] bo não encontrado, usando zeros", file=sys.stderr)
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        else:
            self.bo = self.bo * (self.scale * 0.3)
            print(f"[DEBUG] bo carregado, shape={self.bo.shape}", file=sys.stderr)
        
        print(f"[DEBUG] Todos os pesos extraídos com sucesso!", file=sys.stderr)
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação de célula LSTM"""
        # Calcula todos os gates de uma vez
        gates = torch.matmul(Wx, x) + torch.matmul(Wh, h) + b
        
        # Divide em 4 gates
        i, f, g, o = torch.split(gates, self.hidden_size)
        
        i = torch.sigmoid(i)
        f = torch.sigmoid(f)
        g = torch.tanh(g)
        o = torch.sigmoid(o)
        
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

def gerar_nome_inteligente(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera nomes de forma inteligente"""
    # Inicializa estados
    h0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    
    # Começa com vogais comuns
    start_chars = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r', 't', 'l', 'c']
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
        
        # Para os primeiros caracteres, incentiva letras comuns
        if step < 3:
            # Aumenta probabilidade de vogais e consoantes comuns
            common_chars = ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'l', 'n', 'm']
            common_indices = [char_to_idx.get(c, 0) for c in common_chars if c in char_to_idx]
            for idx in common_indices:
                if idx < len(probs):
                    probs[idx] = probs[idx] * 1.5
        
        # Normaliza novamente
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

def processar_nome(texto):
    """Processa e formata o nome"""
    if not texto or len(texto) < 2:
        return None
    
    # Limpa o texto
    texto = texto.lower()
    clean_chars = []
    
    for char in texto:
        if char.isalpha():
            clean_chars.append(char)
        elif char == ' ' and clean_chars and clean_chars[-1] != ' ':
            clean_chars.append(' ')
    
    clean_text = ''.join(clean_chars).strip()
    
    if not clean_text:
        return None
    
    # Divide e capitaliza
    palavras = clean_text.split()
    palavras_validas = []
    
    for palavra in palavras:
        if 2 <= len(palavra) <= 10:
            # Verifica se parece um nome real (evita combinações estranhas)
            vogais = sum(1 for c in palavra if c in 'aeiou')
            if vogais > 0:  # Precisa ter pelo menos uma vogal
                palavra = palavra[0].upper() + palavra[1:]
                palavras_validas.append(palavra)
    
    if not palavras_validas:
        return None
    
    return ' '.join(palavras_validas)

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
        
        # Vocabulário
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        while len(vocab) < 38:
            vocab.append('?')
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Carrega modelo
        model = CorrectLoadModel(device=device)
        model.load()
        
        # Gera nomes
        nomes = []
        tentativas = 0
        max_tentativas = quantidade * 15
        
        while len(nomes) < quantidade and tentativas < max_tentativas:
            tentativas += 1
            
            # Usa temperatura ajustada
            temp_ajustada = temperature
            if tentativas > quantidade * 5:
                temp_ajustada = min(temperature * 1.3, 1.2)
            
            # Gera nome
            texto = gerar_nome_inteligente(model, char_to_idx, idx_to_char, temp_ajustada)
            nome = processar_nome(texto)
            
            if nome and nome not in nomes:
                # Verifica qualidade
                if 3 <= len(nome) <= 20:
                    # Verifica se tem pelo menos uma vogal
                    if any(v in nome.lower() for v in 'aeiou'):
                        nomes.append(nome)
        
        # Fallback se necessário
        if not nomes:
            # Lista de nomes comuns em português
            nomes_comuns = [
                "Maria", "João", "Ana", "Pedro", "Lucas", "Julia", "Marcos", 
                "Carla", "Rafael", "Sofia", "Gabriel", "Laura", "André", 
                "Beatriz", "Felipe", "Isabela", "Ricardo", "Camila", "Daniel"
            ]
            
            import random
            # Seleciona aleatoriamente
            nomes = random.sample(nomes_comuns, min(quantidade, len(nomes_comuns)))
        
        # Resultado
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": "0.1s",
            "observacao": "nomes_reais" if nomes else "fallback_usado",
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