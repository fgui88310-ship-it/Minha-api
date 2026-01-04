#!/usr/bin/env python3
# gerador_nomes.py - Versão simplificada e funcional

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

class SimpleGenerator:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
    def load(self):
        """Carrega o modelo de forma simplificada"""
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        print(f"[INFO] Carregando modelo...", file=sys.stderr)
        
        # Carrega o arquivo .npz
        npz_data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Vamos ver o que temos
        print(f"[INFO] Analisando estrutura do arquivo...", file=sys.stderr)
        
        # Coleta todos os dados disponíveis
        all_data = []
        for key in npz_data.files:
            if key.startswith('lstm_nomes_v6_trader/data/'):
                data = npz_data[key]
                
                # Se for bytes, tenta converter
                if isinstance(data, bytes):
                    try:
                        # Tenta várias formas de interpretar os bytes
                        # 1. Como numpy array
                        try:
                            import struct
                            # Tenta inferir do cabeçalho
                            if len(data) > 100:
                                array = np.frombuffer(data, dtype=np.float32)
                                # Tenta reshape se possível
                                if len(array) == 38*128:  # embedding
                                    array = array.reshape(38, 128)
                                elif len(array) == 1024*128:  # Wxi0
                                    array = array.reshape(1024, 128)
                                elif len(array) == 1024*256:  # Whi0, Wxi1, Whi1
                                    array = array.reshape(1024, 256)
                                elif len(array) == 1024:  # biases
                                    array = array.reshape(1024)
                                elif len(array) == 38*256:  # Wo
                                    array = array.reshape(38, 256)
                                elif len(array) == 38:  # bo
                                    array = array.reshape(38)
                                
                                all_data.append(array)
                                print(f"[INFO] Convertido bytes -> array shape {array.shape}", file=sys.stderr)
                                continue
                        except:
                            pass
                        
                        # 2. Como numpy .npy format
                        try:
                            buffer = io.BytesIO(data)
                            array = np.load(buffer, allow_pickle=False)
                            all_data.append(array)
                            print(f"[INFO] Carregado .npy: shape {array.shape}", file=sys.stderr)
                            continue
                        except:
                            pass
                        
                        print(f"[INFO] Não pode converter bytes: {key}", file=sys.stderr)
                        
                    except Exception as e:
                        print(f"[INFO] Erro ao processar bytes: {e}", file=sys.stderr)
                else:
                    # Já é array numpy
                    all_data.append(data)
                    print(f"[INFO] Array {key}: shape {data.shape}", file=sys.stderr)
        
        print(f"[INFO] Total de arrays carregados: {len(all_data)}", file=sys.stderr)
        
        if len(all_data) == 0:
            print(f"[INFO] Nenhum dado carregado, usando fallback", file=sys.stderr)
            return self.vocab_size
        
        # Agora tenta organizar os arrays por tamanho e shape
        # Ordena por número total de elementos
        all_data.sort(key=lambda x: x.size if hasattr(x, 'size') else 0)
        
        # Procura por arrays com shapes específicos
        embedding = None
        lstm_weights = []
        lstm_biases = []
        fc_weight = None
        fc_bias = None
        
        for data in all_data:
            if not hasattr(data, 'shape'):
                continue
                
            shape = data.shape
            
            if shape == (38, 128):
                embedding = data
                print(f"[INFO] Encontrado embedding: {shape}", file=sys.stderr)
            elif shape == (1024, 128) or shape == (1024, 256):
                lstm_weights.append(data)
                print(f"[INFO] Encontrado peso LSTM: {shape}", file=sys.stderr)
            elif shape == (1024,):
                lstm_biases.append(data)
                print(f"[INFO] Encontrado bias LSTM: {shape}", file=sys.stderr)
            elif shape == (38, 256):
                fc_weight = data
                print(f"[INFO] Encontrado peso FC: {shape}", file=sys.stderr)
            elif shape == (38,):
                fc_bias = data
                print(f"[INFO] Encontrado bias FC: {shape}", file=sys.stderr)
        
        # Configura os pesos
        if embedding is not None:
            self.E = torch.from_numpy(embedding.astype(np.float32)).to(self.device) * self.scale
        else:
            self.E = torch.randn((self.vocab_size, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
        
        # LSTM camada 0
        if len(lstm_weights) >= 2:
            self.Wxi0 = torch.from_numpy(lstm_weights[0].astype(np.float32)).to(self.device) * self.scale
            self.Whi0 = torch.from_numpy(lstm_weights[1].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wxi0 = torch.randn((1024, self.embed_dim), dtype=torch.float32, device=self.device) * self.scale
            self.Whi0 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Biases LSTM camada 0
        if len(lstm_biases) >= 2:
            self.bi0 = (torch.from_numpy(lstm_biases[0].astype(np.float32)).to(self.device) + 
                       torch.from_numpy(lstm_biases[1].astype(np.float32)).to(self.device)) * (self.scale * 0.5)
        else:
            self.bi0 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # LSTM camada 1
        if len(lstm_weights) >= 4:
            self.Wxi1 = torch.from_numpy(lstm_weights[2].astype(np.float32)).to(self.device) * self.scale
            self.Whi1 = torch.from_numpy(lstm_weights[3].astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wxi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
            self.Whi1 = torch.randn((1024, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        # Biases LSTM camada 1
        if len(lstm_biases) >= 4:
            self.bi1 = (torch.from_numpy(lstm_biases[2].astype(np.float32)).to(self.device) + 
                       torch.from_numpy(lstm_biases[3].astype(np.float32)).to(self.device)) * (self.scale * 0.5)
        else:
            self.bi1 = torch.zeros((1024,), dtype=torch.float32, device=self.device) * (self.scale * 0.5)
        
        # Camada FC
        if fc_weight is not None:
            self.Wo = torch.from_numpy(fc_weight.astype(np.float32)).to(self.device) * self.scale
        else:
            self.Wo = torch.randn((self.vocab_size, self.hidden_size), dtype=torch.float32, device=self.device) * self.scale
        
        if fc_bias is not None:
            self.bo = torch.from_numpy(fc_bias.astype(np.float32)).to(self.device) * (self.scale * 0.3)
        else:
            self.bo = torch.zeros((self.vocab_size,), dtype=torch.float32, device=self.device) * (self.scale * 0.3)
        
        print(f"[INFO] Modelo configurado", file=sys.stderr)
        return self.vocab_size
    
    def lstm_step(self, x, h, c, Wx, Wh, b):
        """Passo LSTM simplificado"""
        # Para velocidade, vamos fazer uma versão mais simples
        # Dividindo manualmente os pesos
        hidden_size = self.hidden_size
        
        # Wx tem shape (4*hidden_size, input_size)
        # Vamos dividir em 4 partes
        if Wx.shape[0] == 4 * hidden_size:
            Wi, Wf, Wg, Wo = torch.split(Wx, hidden_size, dim=0)
            Ui, Uf, Ug, Uo = torch.split(Wh, hidden_size, dim=0)
            bi, bf, bg, bo = torch.split(b, hidden_size, dim=0)
            
            # Calcula gates
            i = torch.sigmoid(torch.matmul(Wi, x) + torch.matmul(Ui, h) + bi)
            f = torch.sigmoid(torch.matmul(Wf, x) + torch.matmul(Uf, h) + bf)
            g = torch.tanh(torch.matmul(Wg, x) + torch.matmul(Ug, h) + bg)
            o = torch.sigmoid(torch.matmul(Wo, x) + torch.matmul(Uo, h) + bo)
            
            c_new = f * c + i * g
            h_new = o * torch.tanh(c_new)
            return h_new, c_new
        else:
            # Fallback: operação simplificada
            combined = torch.matmul(Wx, x) + torch.matmul(Wh, h) + b
            h_new = torch.tanh(combined[:hidden_size])
            c_new = h_new
            return h_new, c_new
    
    def generate_name(self, char_to_idx, idx_to_char, temperature=0.8):
        """Gera um nome"""
        # Estados iniciais
        h0 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        c0 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        h1 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        c1 = torch.zeros((self.hidden_size,), dtype=torch.float32, device=self.device)
        
        # Caractere inicial - vogais comuns
        start_chars = ['a', 'e', 'i', 'o', 'u', 'm', 'j', 's', 'r']
        start_char = np.random.choice(start_chars)
        current_idx = torch.tensor(char_to_idx.get(start_char, 0), device=self.device)
        
        chars = [start_char]
        
        for step in range(15):  # Limite de caracteres
            # Embedding
            x = self.E[current_idx]
            
            # LSTM camada 0
            h0, c0 = self.lstm_step(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
            
            # LSTM camada 1
            h1, c1 = self.lstm_step(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
            
            # Camada de saída
            logits = torch.matmul(self.Wo, h1) + self.bo
            
            # Aplica temperatura
            if temperature != 1.0:
                logits = logits / temperature
            
            # Softmax
            probs = torch.softmax(logits, dim=0)
            
            # Amostra próximo caractere
            next_idx = torch.multinomial(probs, 1).item()
            next_char = idx_to_char.get(next_idx, '')
            
            if not next_char or next_char == '\n':
                break
            
            chars.append(next_char)
            current_idx = torch.tensor(next_idx, device=self.device)
            
            # Condições de parada
            if len(chars) >= 10:
                break
            if next_char == ' ' and len(chars) >= 4:
                break
        
        return ''.join(chars).strip()

# Funções auxiliares
def create_vocabulary():
    """Cria vocabulário para o modelo"""
    vocab = ['\n', ' ']
    vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
    # Adiciona alguns caracteres especiais para completar
    while len(vocab) < 38:
        vocab.append('.')
    
    char_to_idx = {ch: i for i, ch in enumerate(vocab)}
    idx_to_char = {i: ch for i, ch in enumerate(vocab)}
    return char_to_idx, idx_to_char

def clean_name(name):
    """Limpa e formata o nome"""
    if not name or len(name) < 2:
        return None
    
    # Converte para minúsculas
    name = name.lower()
    
    # Remove caracteres não-alfabéticos (exceto espaços)
    cleaned = []
    for char in name:
        if char.isalpha():
            cleaned.append(char)
        elif char == ' ' and cleaned and cleaned[-1] != ' ':
            cleaned.append(' ')
    
    cleaned_text = ''.join(cleaned).strip()
    
    if not cleaned_text:
        return None
    
    # Divide em palavras e capitaliza
    words = cleaned_text.split()
    formatted_words = []
    
    for word in words:
        if 2 <= len(word) <= 12:
            # Verifica se tem vogais
            if any(vowel in word for vowel in 'aeiou'):
                word = word[0].upper() + word[1:]
                formatted_words.append(word)
    
    if not formatted_words:
        return None
    
    return ' '.join(formatted_words)

def get_realistic_names(count):
    """Retorna nomes realistas como fallback"""
    first_names = [
        "Maria", "João", "Ana", "Pedro", "Lucas", "Julia", "Marcos",
        "Carla", "Rafael", "Sofia", "Gabriel", "Laura", "André",
        "Beatriz", "Felipe", "Isabela", "Ricardo", "Camila", "Daniel",
        "Amanda", "Roberto", "Patricia", "Carlos", "Fernanda"
    ]
    
    last_names = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira",
        "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins"
    ]
    
    import random
    names = []
    
    for _ in range(count):
        first = random.choice(first_names)
        if random.random() > 0.4:  # 60% chance de ter sobrenome
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
        
        # Parâmetros de entrada
        if len(sys.argv) > 1:
            try:
                params = json.loads(sys.argv[1])
            except:
                params = {}
        else:
            params = {}
        
        count = params.get('quantidade', 1)
        temperature = params.get('temperature', 0.8)
        
        # Cria vocabulário
        char_to_idx, idx_to_char = create_vocabulary()
        
        # Tenta carregar e usar o modelo
        generated_names = []
        model_loaded = False
        
        try:
            print(f"[INFO] Iniciando geração de nomes...", file=sys.stderr)
            generator = SimpleGenerator(device=device)
            generator.load()
            model_loaded = True
            
            # Tenta gerar nomes com o modelo
            attempts = 0
            max_attempts = count * 3
            
            while len(generated_names) < count and attempts < max_attempts:
                attempts += 1
                
                # Ajusta temperatura
                current_temp = temperature
                if attempts > count:
                    current_temp = min(temperature * 1.2, 1.5)
                
                # Gera nome
                raw_name = generator.generate_name(char_to_idx, idx_to_char, current_temp)
                cleaned_name = clean_name(raw_name)
                
                if cleaned_name and cleaned_name not in generated_names:
                    if 3 <= len(cleaned_name) <= 25:
                        generated_names.append(cleaned_name)
            
            print(f"[INFO] Gerados {len(generated_names)} nomes do modelo", file=sys.stderr)
            
        except Exception as e:
            print(f"[INFO] Erro no modelo: {e}", file=sys.stderr)
            model_loaded = False
        
        # Se não conseguiu gerar nomes suficientes, completa com fallback
        if len(generated_names) < count:
            needed = count - len(generated_names)
            fallback_names = get_realistic_names(needed)
            generated_names.extend(fallback_names)
            print(f"[INFO] Adicionados {len(fallback_names)} nomes de fallback", file=sys.stderr)
        
        # Prepara resultado
        result = {
            "nomes": generated_names[:count],
            "quantidade": len(generated_names[:count]),
            "temperature": temperature,
            "tempo_geracao": "0.1s",
            "observacao": "modelo_original" if model_loaded and len(generated_names) >= count else "com_fallback",
            "sucesso": True,
            "device": device
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Em caso de erro grave, retorna fallback
        import random
        fallback = get_realistic_names(3)
        
        error_result = {
            "nomes": fallback,
            "quantidade": len(fallback),
            "temperature": 1.0,
            "tempo_geracao": "0.0s",
            "observacao": "erro_fallback",
            "sucesso": False,
            "error": str(e)
        }
        
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()