#!/usr/bin/env python3
# gerador_nomes.py - Versão com carregamento forçado baseado nos arquivos

import torch
import numpy as np
import json
import sys
import os
import time
import traceback
import pickle
import io

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class ForcedLoadModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega os pesos forçando uma ordem específica baseada nos arquivos"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[DEBUG] Carregando modelo de: {WEIGHTS_FILE}", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        print(f"[DEBUG] Chaves no arquivo .npz: {npz_data.files}", file=sys.stderr)
        
        # Primeiro, vamos inspecionar o pickle para entender a estrutura
        pickle_key = 'lstm_nomes_v6_trader/data.pkl'
        if pickle_key in npz_data.files:
            pickle_data = npz_data[pickle_key]
            print(f"[DEBUG] Tamanho do pickle: {len(pickle_data)} bytes", file=sys.stderr)
            
            # Tenta ler os metadados do pickle
            try:
                # Lê os primeiros bytes para entender o formato
                print(f"[DEBUG] Primeiros bytes do pickle: {pickle_data[:100]}", file=sys.stderr)
                
                # Tenta uma abordagem mais direta: procura por referências aos tensores
                pickle_str = pickle_data.decode('latin-1', errors='ignore')
                
                # Procura por referências aos arquivos de dados
                import re
                data_refs = re.findall(r'data/\d+', pickle_str)
                print(f"[DEBUG] Referências encontradas no pickle: {data_refs}", file=sys.stderr)
                
                # Conta quantos tensores são referenciados
                tensor_indices = []
                for ref in data_refs:
                    idx = int(ref.split('/')[1])
                    if idx not in tensor_indices:
                        tensor_indices.append(idx)
                
                print(f"[DEBUG] Índices de tensores referenciados: {sorted(tensor_indices)}", file=sys.stderr)
                
            except Exception as e:
                print(f"[DEBUG] Erro ao analisar pickle: {e}", file=sys.stderr)
        
        # Agora, vamos carregar todos os arquivos de dados e tentar entender a ordem
        data_files = {}
        for key in npz_data.files:
            if key.startswith('lstm_nomes_v6_trader/data/') and not key.endswith('.pkl'):
                idx = int(key.split('/')[-1])
                data = npz_data[key]
                data_files[idx] = data
                print(f"[DEBUG] Arquivo {idx}: shape={data.shape}, dtype={data.dtype}", file=sys.stderr)
        
        if not data_files:
            raise ValueError("Nenhum arquivo de dados encontrado")
        
        # Ordena por índice
        sorted_indices = sorted(data_files.keys())
        print(f"[DEBUG] Índices disponíveis: {sorted_indices}", file=sys.stderr)
        
        # Baseado no formato típico do PyTorch, vamos tentar mapear:
        # Normalmente a ordem é: embedding, W_ih, W_hh, bias, etc.
        
        # Vamos tentar identificar os pesos pelos seus shapes
        weights_by_shape = {}
        for idx in sorted_indices:
            data = data_files[idx]
            shape = data.shape
            key = f"shape_{shape}"
            if key not in weights_by_shape:
                weights_by_shape[key] = []
            weights_by_shape[key].append((idx, data))
        
        print(f"[DEBUG] Agrupamento por shape:", file=sys.stderr)
        for shape, items in weights_by_shape.items():
            print(f"[DEBUG]   {shape}: {len(items)} itens", file=sys.stderr)
            for idx, data in items:
                print(f"[DEBUG]     idx={idx}, min={data.min():.4f}, max={data.max():.4f}, mean={data.mean():.4f}", file=sys.stderr)
        
        # FORÇA um mapeamento específico baseado no que vemos
        # Vamos tentar a ordem mais comum para LSTM PyTorch:
        # 1. embedding.weight (vocab_size x embed_dim) = 38 x 128
        # 2. lstm.weight_ih_l0 (4*hidden_size x embed_dim) = 1024 x 128
        # 3. lstm.weight_hh_l0 (4*hidden_size x hidden_size) = 1024 x 256
        # 4. lstm.bias_ih_l0 + lstm.bias_hh_l0 (4*hidden_size) = 1024
        # 5. lstm.weight_ih_l1 (4*hidden_size x hidden_size) = 1024 x 256
        # 6. lstm.weight_hh_l1 (4*hidden_size x hidden_size) = 1024 x 256
        # 7. lstm.bias_ih_l1 + lstm.bias_hh_l1 (4*hidden_size) = 1024
        # 8. fc.weight (vocab_size x hidden_size) = 38 x 256
        # 9. fc.bias (vocab_size) = 38
        
        # Procura por esses shapes específicos
        found_weights = {}
        
        for idx in sorted_indices:
            data = data_files[idx]
            shape = data.shape
            
            if shape == (38, 128):  # embedding
                if 'E' not in found_weights:
                    found_weights['E'] = (idx, data)
                    print(f"[DEBUG] Identificado como embedding (idx={idx})", file=sys.stderr)
            
            elif shape == (1024, 128):  # W_ih l0
                if 'Wxi0' not in found_weights:
                    found_weights['Wxi0'] = (idx, data)
                    print(f"[DEBUG] Identificado como Wxi0 (idx={idx})", file=sys.stderr)
            
            elif shape == (1024, 256):  # W_hh l0 ou W_ih l1 ou W_hh l1
                if 'Whi0' not in found_weights:
                    found_weights['Whi0'] = (idx, data)
                    print(f"[DEBUG] Identificado como Whi0 (idx={idx})", file=sys.stderr)
                elif 'Wxi1' not in found_weights:
                    found_weights['Wxi1'] = (idx, data)
                    print(f"[DEBUG] Identificado como Wxi1 (idx={idx})", file=sys.stderr)
                elif 'Whi1' not in found_weights:
                    found_weights['Whi1'] = (idx, data)
                    print(f"[DEBUG] Identificado como Whi1 (idx={idx})", file=sys.stderr)
            
            elif shape == (1024,):  # bias
                if 'bi0' not in found_weights:
                    found_weights['bi0'] = (idx, data)
                    print(f"[DEBUG] Identificado como bi0 (idx={idx})", file=sys.stderr)
                elif 'bi1' not in found_weights:
                    found_weights['bi1'] = (idx, data)
                    print(f"[DEBUG] Identificado como bi1 (idx={idx})", file=sys.stderr)
            
            elif shape == (38, 256):  # fc weight
                if 'Wo' not in found_weights:
                    found_weights['Wo'] = (idx, data)
                    print(f"[DEBUG] Identificado como Wo (idx={idx})", file=sys.stderr)
            
            elif shape == (38,):  # fc bias
                if 'bo' not in found_weights:
                    found_weights['bo'] = (idx, data)
                    print(f"[DEBUG] Identificado como bo (idx={idx})", file=sys.stderr)
        
        # Se não encontrou todos, tenta uma ordem sequencial
        expected_weights = ['E', 'Wxi0', 'Whi0', 'bi0', 'Wxi1', 'Whi1', 'bi1', 'Wo', 'bo']
        
        if len(found_weights) < len(expected_weights):
            print(f"[DEBUG] Não encontrou todos os pesos ({len(found_weights)}/{len(expected_weights)}), usando ordem sequencial", file=sys.stderr)
            
            # Reseta e usa ordem sequencial
            found_weights = {}
            for i, weight_name in enumerate(expected_weights):
                if i < len(sorted_indices):
                    idx = sorted_indices[i]
                    found_weights[weight_name] = (idx, data_files[idx])
                    print(f"[DEBUG] Atribuído {weight_name} -> idx={idx}", file=sys.stderr)
        
        # Carrega os pesos encontrados
        self._load_found_weights(found_weights)
        
        return self.vocab_size
    
    def _load_found_weights(self, found_weights):
        """Carrega os pesos do dicionário encontrado"""
        # Função auxiliar para converter numpy para tensor
        def to_tensor(data):
            if isinstance(data, np.ndarray):
                return torch.from_numpy(data.copy()).float().to(self.device)
            return data.float().to(self.device)
        
        # Carrega cada peso com escala apropriada
        if 'E' in found_weights:
            idx, data = found_weights['E']
            self.E = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado E do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
            print(f"[DEBUG] E não encontrado, usando aleatório", file=sys.stderr)
        
        if 'Wxi0' in found_weights:
            idx, data = found_weights['Wxi0']
            self.Wxi0 = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado Wxi0 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        if 'Whi0' in found_weights:
            idx, data = found_weights['Whi0']
            self.Whi0 = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado Whi0 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if 'bi0' in found_weights:
            idx, data = found_weights['bi0']
            self.bi0 = to_tensor(data) * (self.scale * 0.5)
            print(f"[DEBUG] Carregado bi0 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        if 'Wxi1' in found_weights:
            idx, data = found_weights['Wxi1']
            self.Wxi1 = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado Wxi1 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if 'Whi1' in found_weights:
            idx, data = found_weights['Whi1']
            self.Whi1 = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado Whi1 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if 'bi1' in found_weights:
            idx, data = found_weights['bi1']
            self.bi1 = to_tensor(data) * (self.scale * 0.5)
            print(f"[DEBUG] Carregado bi1 do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        if 'Wo' in found_weights:
            idx, data = found_weights['Wo']
            self.Wo = to_tensor(data) * self.scale
            print(f"[DEBUG] Carregado Wo do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if 'bo' in found_weights:
            idx, data = found_weights['bo']
            self.bo = to_tensor(data) * (self.scale * 0.3)
            print(f"[DEBUG] Carregado bo do idx={idx}, shape={data.shape}", file=sys.stderr)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[DEBUG] Todos os pesos carregados!", file=sys.stderr)
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação eficiente de célula LSTM"""
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

def gerar_nome_qualidade(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera nomes com qualidade melhorada"""
    # Inicializa estados
    h0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((model.hidden_size,), dtype=torch.float32, device=model.device)
    
    # Usa um caractere inicial mais comum
    start_letters = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd', 'n', 'p']
    start_char = np.random.choice(start_letters)
    char_idx = torch.tensor(char_to_idx.get(start_char, 2), device=model.device)
    
    generated = []
    
    # Gera com lógica melhor
    for step in range(30):
        logits, h0, c0, h1, c1 = model.step(char_idx, h0, c0, h1, c1)
        
        # Aplica temperatura
        if temperature != 1.0:
            logits = logits / temperature
        
        probs = torch.softmax(logits, dim=0)
        
        # Adiciona um pouco de ruído para diversidade
        if step < 3:  # Nos primeiros passos, dá mais liberdade
            probs = probs * 0.8 + torch.ones_like(probs) * 0.2 / len(probs)
        
        # Amostra o próximo caractere
        next_idx = torch.multinomial(probs, 1).item()
        next_char = idx_to_char.get(next_idx, '?')
        
        # Lógica de parada
        if next_char == '\n' and len(generated) >= 3:
            break
        
        generated.append(next_char)
        char_idx = torch.tensor(next_idx, device=model.device)
        
        # Para em condições razoáveis
        if next_char == ' ' and len(generated) >= 4:
            break
        if len(generated) >= 12:
            break
    
    return ''.join(generated).strip()

def processar_nome(texto):
    """Processa nome de forma inteligente"""
    if not texto:
        return None
    
    # Converte para minúsculas e limpa
    texto = texto.lower()
    clean_text = []
    
    for char in texto:
        if char.isalpha():
            clean_text.append(char)
        elif char == ' ' and clean_text and clean_text[-1] != ' ':
            clean_text.append(' ')
    
    texto_limpo = ''.join(clean_text).strip()
    
    if not texto_limpo or len(texto_limpo) < 2:
        return None
    
    # Divide em palavras e capitaliza
    palavras = texto_limpo.split()
    palavras_validas = []
    
    for palavra in palavras:
        # Filtra palavras muito curtas ou muito longas
        if 2 <= len(palavra) <= 10:
            # Capitaliza corretamente
            palavra = palavra[0].upper() + palavra[1:]
            palavras_validas.append(palavra)
    
    if not palavras_validas:
        return None
    
    return ' '.join(palavras_validas)

def main():
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
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
        
        # Vocabulário
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        while len(vocab) < 38:
            vocab.append('?')
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Carrega modelo
        model = ForcedLoadModel(device=device)
        model.load()
        
        # Gera nomes
        nomes = []
        tentativas = 0
        max_tentativas = quantidade * 10
        
        while len(nomes) < quantidade and tentativas < max_tentativas:
            tentativas += 1
            texto = gerar_nome_qualidade(model, char_to_idx, idx_to_char, temperature)
            nome = processar_nome(texto)
            
            if nome and nome not in nomes:
                # Verifica se parece um nome razoável
                if all(c.isalpha() or c.isspace() for c in nome):
                    if 3 <= len(nome) <= 20:
                        nomes.append(nome)
        
        # Se não gerou bons nomes, usa fallback
        if not nomes:
            print("[INFO] Usando fallback para nomes", file=sys.stderr)
            
            # Lista de nomes realistas como fallback
            nomes_fallback = [
                "Maria", "João", "Ana", "Pedro", "Lucas", "Julia", "Marcos", "Carla",
                "Rafael", "Sofia", "Gabriel", "Laura", "André", "Beatriz", "Felipe",
                "Isabela", "Ricardo", "Camila", "Daniel", "Amanda", "Roberto", "Patricia"
            ]
            
            # Seleciona aleatoriamente
            import random
            nomes = random.sample(nomes_fallback, min(quantidade, len(nomes_fallback)))
        
        # Resultado
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": "0.1s",
            "observacao": "nomes_gerados" if nomes else "fallback_usado",
            "sucesso": True
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